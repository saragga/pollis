/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { RunOnceScheduler } from '../../../../base/common/async.js';
import { VSBuffer } from '../../../../base/common/buffer.js';
import { Emitter } from '../../../../base/common/event.js';
import { parse } from '../../../../base/common/json.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { basename, extname, joinPath } from '../../../../base/common/resources.js';
import { URI } from '../../../../base/common/uri.js';
import { ICommandActionTitle } from '../../../../platform/action/common/action.js';
import { IMenuItem, isIMenuItem, ISubmenuItem, MenuId, MenuRegistry } from '../../../../platform/actions/common/actions.js';
import { MenuViewFilter, MenuViewScope } from '../../../../platform/actions/common/menuViewFilter.js';
import { ConfigurationTarget, IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { IContextKeyService } from '../../../../platform/contextkey/common/contextkey.js';
import { FileSystemProviderCapabilities, IFileService } from '../../../../platform/files/common/files.js';
import { ILogService } from '../../../../platform/log/common/log.js';
import { IPathService } from '../../../services/path/common/pathService.js';
import { IPollisMenuNode, IPollisView, IPollisViewsService, MAX_VIEW_NAME, POLLIS_VIEW_SETTING } from '../common/pollisViews.js';

/** The menus a View can trim with its `show` list, in menu bar order. */
const POLLIS_MENUS = [MenuId.MenubarExploreMenu, MenuId.MenubarModelMenu, MenuId.MenubarSimulateMenu, MenuId.MenubarOptimiseMenu, MenuId.MenubarComposeMenu];

const BUILTIN_VIEWS: readonly IPollisView[] = [
	{ name: MAX_VIEW_NAME },
	{
		name: 'Min',
		show: [
			// Explore: the Visualise plot types StatsPlots.jl can draw (it includes Plots.jl),
			// and Descriptive Statistics
			'chiara.explore.dvcs.scatter',
			'chiara.explore.dvcs.bar',
			'chiara.explore.dvcs.histogram',
			'chiara.explore.dvcs.box',
			'chiara.explore.dvcs.violin',
			'chiara.explore.dvcs.pie',
			'chiara.explore.dvcs.line',
			'chiara.explore.dvdist.ecdf',
			'chiara.explore.dvdist.qq',
			'chiara.explore.dvdist.marginal',
			'chiara.explore.dvdist.correlogram',
			'chiara.explore.dvmulti.corner',
			'chiara.explore.dvmulti.parallel',
			'chiara.explore.dvmulti.bubble',
			'chiara.explore.dvmulti.heatmap',
			'chiara.explore.dvts.tsplot',
			'chiara.explore.dvts.ribbon',
			'chiara.explore.dvts.stacked',
			'chiara.explore.dvts.ohlc',
			'chiara.explore.dvcp.mosaic',
			'chiara.explore.dvcp.nightingale',
			'chiara.explore.dvcp.waterfall',
			'chiara.explore.dvcp.treemap',
			'chiara.explore.dvsf.contour',
			'chiara.explore.dvsf.surface',
			'chiara.explore.dstats',
			// Model
			'chiara.statistics.d',
			'chiara.statistics.de',
			'chiara.statistics.ht',
			'chiara.statistics.lm.hac',
			'chiara.statistics.glm',
			'chiara.statistics.dtrf.dt',
			// Simulate
			'chiara.statistics.ds',
			'chiara.statistics.up',
			// Optimise
			'chiara.optimise.qn',
			'chiara.mp.lp',
		],
	},
];

export class PollisViewsService extends Disposable implements IPollisViewsService {

	declare readonly _serviceBrand: undefined;

	private readonly _onDidChange = this._register(new Emitter<void>());
	readonly onDidChange = this._onDidChange.event;

	readonly folder: URI;

	private userViews: readonly IPollisView[] = [];
	private readonly readScheduler = this._register(new RunOnceScheduler(() => this.readViews(), 300));

	constructor(
		@IConfigurationService private readonly configurationService: IConfigurationService,
		@IFileService private readonly fileService: IFileService,
		@IPathService pathService: IPathService,
		@ILogService private readonly logService: ILogService,
		@IContextKeyService private readonly contextKeyService: IContextKeyService,
	) {
		super();
		this.folder = joinPath(pathService.userHome({ preferLocal: true }), '.pollis', 'views');

		// A built-in View applies at once; a View in a file once the folder is read.
		this.apply();
		this._register(this.configurationService.onDidChangeConfiguration(e => {
			if (e.affectsConfiguration(POLLIS_VIEW_SETTING)) {
				this.apply();
				this._onDidChange.fire();
			}
		}));
		this._register({ dispose: () => MenuViewFilter.set(undefined) });
		void this.watchViews();
	}

	getViews(): readonly IPollisView[] {
		return [...BUILTIN_VIEWS, ...this.userViews];
	}

	getActiveView(): IPollisView {
		const name = this.configurationService.getValue<string>(POLLIS_VIEW_SETTING);
		return this.getViews().find(view => view.name === name) ?? BUILTIN_VIEWS[0];
	}

	async setActiveView(name: string): Promise<void> {
		await this.configurationService.updateValue(POLLIS_VIEW_SETTING, name, ConfigurationTarget.USER);
	}

	async createView(name: string, base: IPollisView): Promise<URI> {
		const resource = joinPath(this.folder, `${name.replace(/[\\/:*?"<>|]/g, '-')}.json`);
		await this.writeView(resource, { ...base, name });
		return resource;
	}

	async editView(view: IPollisView): Promise<URI> {
		if (!view.resource) {
			throw new Error(`The built-in View "${view.name}" cannot be edited.`);
		}
		await this.writeView(view.resource, view);
		return view.resource;
	}

	async updateView(view: IPollisView, show: readonly string[] | undefined, hide: readonly string[]): Promise<void> {
		if (!view.resource) {
			throw new Error(`The built-in View "${view.name}" cannot be changed.`);
		}
		await this.writeView(view.resource, { ...view, show, hide });
	}

	getMenuTree(): readonly IPollisMenuNode[] {
		const build = (menu: MenuId, scope: MenuViewScope, path: ReadonlySet<string>): IPollisMenuNode[] => {
			const nodes: IPollisMenuNode[] = [];
			// An item registered twice (under different conditions) is one entry: its id is its identity
			const ids = new Set<string>();
			for (const item of sortMenuItems(MenuRegistry.getMenuItems(menu))) {
				const id = isIMenuItem(item) ? item.command.id : item.submenu.id;
				if (ids.has(id) || id === MenuId.MenubarPreferencesMenu.id) {
					continue;
				}
				ids.add(id);
				if (isIMenuItem(item)) {
					nodes.push({ id: item.command.id, title: titleOf(item.command.title), pollis: scope === 'pollis' });
				} else if (!path.has(item.submenu.id)) {
					const submenuScope = MenuViewFilter.scopeOf(item.submenu, scope);
					const children = submenuScope === 'none' ? [] : build(item.submenu, submenuScope, new Set([...path, item.submenu.id]));
					if (children.length) {
						nodes.push({ id: item.submenu.id, title: titleOf(item.title), pollis: submenuScope === 'pollis', children });
					}
				}
			}
			return nodes;
		};
		// The menus the menu bar shows here; the Help menu is never filtered, so it is left out, and
		// Preferences (top level on macOS, under File elsewhere) is left out so a View is not used to hide it
		const menus = sortMenuItems(MenuRegistry.getMenuItems(MenuId.MenubarMainMenu))
			.filter((item): item is ISubmenuItem => !isIMenuItem(item) && item.submenu.id !== MenuId.MenubarPreferencesMenu.id && this.contextKeyService.contextMatchesRules(item.when));
		const tree: IPollisMenuNode[] = [];
		for (const menu of menus) {
			const scope = MenuViewFilter.scopeOf(menu.submenu, 'menubar');
			const children = scope === 'none' ? [] : build(menu.submenu, scope, new Set([menu.submenu.id]));
			if (children.length) {
				tree.push({ id: menu.submenu.id, title: titleOf(menu.title), pollis: scope === 'pollis', children });
			}
		}
		return tree;
	}

	async deleteView(view: IPollisView): Promise<void> {
		if (!view.resource) {
			throw new Error(`The built-in View "${view.name}" cannot be deleted.`);
		}
		if (this.getActiveView().name === view.name) {
			await this.setActiveView(MAX_VIEW_NAME);
		}
		await this.fileService.del(view.resource, { useTrash: this.fileService.hasCapability(view.resource, FileSystemProviderCapabilities.Trash) });
		await this.readViews();
	}

	/**
	 * Writes a View as the list of every item of the Pollis menus, in menu order: the items the
	 * View shows as lines, the others as commented-out lines, so that showing or hiding an item
	 * is toggling its comment.
	 */
	private async writeView(resource: URI, view: IPollisView): Promise<void> {
		const show = view.show && new Set(view.show);
		const lines = [
			'{',
			'\t// A Pollis View. Comment out the line of an item to hide it (Cmd+/ or Ctrl+/), uncomment it to',
			'\t// show it again. A menu with nothing left disappears. To show a whole menu, including items added',
			'\t// later, list its id (given after "menu:"). Ids under "hide" are hidden anywhere in the menu bar,',
			'\t// the File to Help menus included. "Pollis: Edit View..." rewrites this file in this form.',
			`\t"name": ${JSON.stringify(view.name)},`,
			'\t"show": [',
		];
		const seen = new Set<string>();
		const walk = (menu: MenuId, path: string, shownByMenu: boolean) => {
			for (const item of sortMenuItems(MenuRegistry.getMenuItems(menu))) {
				if (isIMenuItem(item)) {
					if (!seen.has(item.command.id)) {
						seen.add(item.command.id);
						const shown = !show || shownByMenu || show.has(item.command.id);
						lines.push(`\t\t${shown ? '' : '// '}${JSON.stringify(item.command.id)}, // ${titleOf(item.command.title)}`);
					}
				} else {
					// allow-any-unicode-next-line
					const submenuPath = `${path} › ${titleOf(item.title)}`;
					seen.add(item.submenu.id);
					lines.push(show?.has(item.submenu.id) ? `\t\t${JSON.stringify(item.submenu.id)}, // ${submenuPath} (whole menu)` : `\t\t// ${submenuPath} (menu: ${item.submenu.id})`);
					walk(item.submenu, submenuPath, shownByMenu || !!show?.has(item.submenu.id));
				}
			}
		};
		const mainMenuItems = MenuRegistry.getMenuItems(MenuId.MenubarMainMenu);
		for (const menu of POLLIS_MENUS) {
			const root = mainMenuItems.find((item): item is ISubmenuItem => !isIMenuItem(item) && item.submenu.id === menu.id);
			const title = root ? titleOf(root.title) : menu.id;
			seen.add(menu.id);
			lines.push(show?.has(menu.id) ? `\t\t${JSON.stringify(menu.id)}, // ${title} (whole menu)` : `\t\t// ${title} (menu: ${menu.id})`);
			walk(menu, title, !!show?.has(menu.id));
		}
		// Ids of items the menus don't have now (an extension not installed, say) are kept
		for (const id of show ?? []) {
			if (!seen.has(id)) {
				lines.push(`\t\t${JSON.stringify(id)},`);
			}
		}
		lines.push('\t],', `\t"hide": ${JSON.stringify(view.hide ?? [])}`, '}', '');

		await this.fileService.writeFile(resource, VSBuffer.fromString(lines.join('\n')));
		await this.readViews();
	}

	private apply(): void {
		const view = this.getActiveView();
		MenuViewFilter.set(view.show || view.hide?.length ? { show: view.show && new Set(view.show), hide: new Set(view.hide) } : undefined);
	}

	private async watchViews(): Promise<void> {
		try {
			await this.fileService.createFolder(this.folder);
		} catch {
			// Already there.
		}
		this._register(this.fileService.createWatcher(this.folder, { recursive: false, excludes: [] }).onDidChange(() => this.readScheduler.schedule()));
		await this.readViews();
	}

	private async readViews(): Promise<void> {
		const views: IPollisView[] = [];
		try {
			const folder = await this.fileService.resolve(this.folder);
			for (const child of folder.children ?? []) {
				if (child.isDirectory || extname(child.resource).toLowerCase() !== '.json') {
					continue;
				}
				try {
					const content = (await this.fileService.readFile(child.resource)).value.toString();
					const json: { name?: unknown; show?: unknown; hide?: unknown } | undefined = parse(content);
					const name = typeof json?.name === 'string' && json.name.trim() ? json.name.trim() : basename(child.resource).slice(0, -'.json'.length);
					if (BUILTIN_VIEWS.some(view => view.name === name)) {
						this.logService.warn(`[Pollis Views] ${child.resource.fsPath} is skipped: "${name}" is a built-in View.`);
						continue;
					}
					views.push({ name, show: stringsOf(json?.show), hide: stringsOf(json?.hide), resource: child.resource });
				} catch (error) {
					this.logService.warn(`[Pollis Views] Cannot read ${child.resource.fsPath}: ${error}`);
				}
			}
		} catch {
			// No folder yet.
		}
		this.userViews = views.sort((a, b) => a.name.localeCompare(b.name));
		this.apply();
		this._onDidChange.fire();
	}
}

function stringsOf(value: unknown): string[] | undefined {
	return Array.isArray(value) ? value.filter((id): id is string => typeof id === 'string') : undefined;
}

function titleOf(title: string | ICommandActionTitle): string {
	return (typeof title === 'string' ? title : title.value).replace(/&&/g, '');
}

/** Menu bar order: by group, then order, as the menu service sorts them. */
function sortMenuItems(items: (IMenuItem | ISubmenuItem)[]): (IMenuItem | ISubmenuItem)[] {
	return [...items].sort((a, b) => (a.group ?? '').localeCompare(b.group ?? '') || (a.order ?? 0) - (b.order ?? 0));
}
