/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { localize } from '../../../../nls.js';
import { Emitter } from '../../../../base/common/event.js';
import { Disposable, DisposableStore, MutableDisposable } from '../../../../base/common/lifecycle.js';
import { joinPath, isEqualOrParent } from '../../../../base/common/resources.js';
import { hasKey } from '../../../../base/common/types.js';
import { URI } from '../../../../base/common/uri.js';
import { isISubmenuItem, MenuId, MenuRegistry } from '../../../../platform/actions/common/actions.js';
import { CommandsRegistry } from '../../../../platform/commands/common/commands.js';
import { ExtensionIdentifier } from '../../../../platform/extensions/common/extensions.js';
import { IFileService } from '../../../../platform/files/common/files.js';
import { InstantiationType, registerSingleton } from '../../../../platform/instantiation/common/extensions.js';
import { ILogService } from '../../../../platform/log/common/log.js';
import { IStorageService, StorageScope, StorageTarget } from '../../../../platform/storage/common/storage.js';
import { IWorkbenchContribution, registerWorkbenchContribution2, WorkbenchPhase } from '../../../common/contributions.js';
import { ExtensionsRegistry, IExtensionPointUser } from '../../../services/extensions/common/extensionsRegistry.js';
import { IModelNotebook, IModelWiki } from '../../model/browser/common/model.types.js';
import { IScaffoldPanel, openScaffoldWebview } from '../../model/browser/commands/scaffold.command.js';
import { registerExternalFolder } from '../../model/browser/common/customCopyFileSystem.js';
import { parseToml, tomlToPanelData } from '../../model/browser/common/tomlPanelData.js';
import { buildScaffoldHtml } from '../../model/browser/webviews/scaffoldParts.js';
import { IToolboxInfo, IToolboxPanelsService, IToolboxPlace, IToolboxPlacement, TOOLBOX_END_GROUP, TOOLBOX_MENU, TOOLBOX_SUBMENU_PREFIX } from '../common/toolboxPanels.js';

/** A panel of a toolbox contributed by an extension. */
interface IToolboxPanelContribution {
	/** Short id, e.g. `symb`: names its wiki and notebook folders and its ~/.pollis folders. */
	readonly id: string;
	/** The command that opens the panel. */
	readonly command: string;
	/** The panel's title. */
	readonly title: string;
	/** The panel's menu item. Default: its title. */
	readonly menuTitle?: string;
	/** The menu group, which separators divide from the others. */
	readonly group: string;
	readonly order: number;
	/** The panel's TOML, relative to the extension folder. */
	readonly data: string;
	/** The model toggle shown first. */
	readonly defaultModel: string;
	/** The first column header of the decision table. Default: "Plot". */
	readonly decisionFirstColumn?: string;
}

/** A toolbox contributed by an extension: a submenu of Explore, Model, Simulate or Optimise, or of one of their submenus. */
interface IToolboxContribution {
	readonly id: string;
	readonly title: string;
	/**
	 * The menu the toolbox goes in: a top-level menu (Explore, Model, Simulate or Optimise) or the
	 * id of an existing submenu of one of them. Any other menu, or none, means the end of Explore.
	 */
	readonly menu?: string;
	/** Put the panels straight into that menu instead of into a submenu of their own. */
	readonly inline?: boolean;
	/** The group in that menu. Default: `9_extensions`. */
	readonly group?: string;
	readonly order?: number;
	readonly panels: IToolboxPanelContribution[];
}

/** The top-level menus a toolbox can go in, by the name the user sees. */
const TOP_LEVEL_MENUS: Record<string, MenuId> = {
	explore: MenuId.MenubarExploreMenu,
	model: MenuId.MenubarModelMenu,
	simulate: MenuId.MenubarSimulateMenu,
	optimise: MenuId.MenubarOptimiseMenu,
};

const toolboxesExtensionPoint = ExtensionsRegistry.registerExtensionPoint<IToolboxContribution[]>({
	extensionPoint: 'pollisToolboxes',
	jsonSchema: {
		description: localize('pollisToolboxes', "Contributes Pollis toolboxes: a submenu of Explore, Model, Simulate or Optimise, or of one of their submenus, with the panels it opens."),
		type: 'array',
		items: {
			type: 'object',
			required: ['id', 'title', 'panels'],
			properties: {
				id: { type: 'string', description: localize('pollisToolboxes.id', "The toolbox id.") },
				title: { type: 'string', description: localize('pollisToolboxes.title', "The toolbox's menu title.") },
				menu: { type: 'string', description: localize('pollisToolboxes.menu', "The menu the toolbox goes in: Explore, Model, Simulate, Optimise or the id of an existing submenu of one of them. Any other menu, or none, means the end of Explore.") },
				inline: { type: 'boolean', description: localize('pollisToolboxes.inline', "Put the panels straight into that menu instead of into a submenu of their own.") },
				group: { type: 'string', description: localize('pollisToolboxes.group', "The group in that menu.") },
				order: { type: 'number', description: localize('pollisToolboxes.order', "The order in that group.") },
				panels: {
					type: 'array',
					items: {
						type: 'object',
						required: ['id', 'command', 'title', 'group', 'order', 'data', 'defaultModel'],
						properties: {
							id: { type: 'string', description: localize('pollisToolboxes.panel.id', "The panel's short id, which names its wiki and notebook folders.") },
							command: { type: 'string', description: localize('pollisToolboxes.panel.command', "The command that opens the panel.") },
							title: { type: 'string', description: localize('pollisToolboxes.panel.title', "The panel's title.") },
							menuTitle: { type: 'string', description: localize('pollisToolboxes.panel.menuTitle', "The panel's menu item. Default: its title.") },
							group: { type: 'string', description: localize('pollisToolboxes.panel.group', "The group in the toolbox menu.") },
							order: { type: 'number', description: localize('pollisToolboxes.panel.order', "The order in that group.") },
							data: { type: 'string', description: localize('pollisToolboxes.panel.data', "The panel's TOML, relative to the extension folder.") },
							defaultModel: { type: 'string', description: localize('pollisToolboxes.panel.defaultModel', "The model toggle shown first.") },
							decisionFirstColumn: { type: 'string', description: localize('pollisToolboxes.panel.decisionFirstColumn', "The first column header of the decision table.") },
						},
					},
				},
			},
		},
	},
});

/** An installed toolbox, with the panels that could be read. */
interface ILoadedToolbox {
	readonly extensionId: string;
	readonly toolbox: IToolboxContribution;
	/** The menu the author puts the toolbox in: the one the toolbox names, else Explore. */
	readonly destination: MenuId;
	/** Whether the destination is the menu the toolbox names; if not, the toolbox goes at the end of Explore. */
	readonly named: boolean;
	readonly location: URI;
	readonly panels: readonly { readonly contribution: IToolboxPanelContribution; readonly panel: IScaffoldPanel }[];
}

/**
 * A published toolbox as stored. Earlier formats named only the menus, as strings: the place of
 * each panel by panel id (the first format, where `author` was the place the author suggests), then
 * `menu` and `panels` as menu ids.
 */
interface IStoredPlacement {
	readonly menu?: string | IToolboxPlace;
	readonly panels: Readonly<Record<string, string | IToolboxPlace>>;
}

/** Where the user published each toolbox, by `<extension id>/<toolbox id>`. */
type PublishedPanels = Record<string, IStoredPlacement | Record<string, string>>;

const PUBLISHED_STORAGE_KEY = 'pollis.toolboxes.published';

/** The menu group of a toolbox's menu, or of an inline toolbox's panels, that names none. */
const DEFAULT_GROUP = '9_extensions';

/** The group of a panel in its toolbox's own menu that names none. */
const DEFAULT_PANEL_GROUP = '1_toolbox';

/**
 * The toolboxes that extensions contribute. A toolbox extension has no code: its panels are TOML
 * files read here and opened on the shared scaffold, and its wikis and notebooks (folders
 * `wiki/<folder>/` and `notebooks/<folder>/`, where the folder is the panel id or the folder the
 * panel's TOML names) are served as if bundled.
 * Installing a toolbox does not change the menus: only the panels the user publishes are added,
 * each in the toolbox's own menu or straight into another menu, and the toolbox's menu goes where
 * the author suggests (the menu the toolbox names, the end of Explore by default) or in the menu the user chose.
 * The toolbox extensions are not built in (their sources are in toolboxes/ at the repository root):
 * the user installs them from the Toolboxes section of the Extensions pane, into the user's
 * extensions folder, and the files are read from wherever the extension is installed.
 */
class ToolboxPanelsService extends Disposable implements IToolboxPanelsService {

	declare readonly _serviceBrand: undefined;

	private readonly _onDidChange = this._register(new Emitter<void>());
	readonly onDidChange = this._onDidChange.event;

	private readonly registrations = this._register(new MutableDisposable<DisposableStore>());
	/** The toolbox submenus by toolbox id: a menu id can be created only once. */
	private readonly submenus = new Map<string, MenuId>();
	/** Counts the loads, so a slower earlier one does not overwrite a later one. */
	private generation = 0;
	private loaded: readonly ILoadedToolbox[] = [];

	constructor(
		@IFileService private readonly fileService: IFileService,
		@ILogService private readonly logService: ILogService,
		@IStorageService private readonly storageService: IStorageService,
	) {
		super();
		toolboxesExtensionPoint.setHandler(extensions => this.load(extensions));
		// Publishing in another window changes the menus here too
		this._register(this.storageService.onDidChangeValue(StorageScope.PROFILE, PUBLISHED_STORAGE_KEY, this._store)(() => this.register()));
	}

	getToolboxes(extensionId?: string): readonly IToolboxInfo[] {
		const published = this.getPublished();
		return this.loaded
			.filter(loaded => !extensionId || loaded.extensionId === extensionId.toLowerCase())
			.map(loaded => {
				const entry = published[publishedKey(loaded)];
				return {
					extensionId: loaded.extensionId,
					id: loaded.toolbox.id,
					title: loaded.toolbox.title,
					panels: loaded.panels.map(({ contribution }) => ({ id: contribution.id, command: contribution.command, title: contribution.menuTitle ?? contribution.title })),
					suggested: suggestedPlacement(loaded),
					published: entry ? placementOf(loaded, entry) : undefined,
				};
			});
	}

	publish(extensionId: string, toolboxId: string, placement: IToolboxPlacement): void {
		const published = this.getPublished();
		published[`${extensionId.toLowerCase()}/${toolboxId}`] = { menu: placement.menu, panels: { ...placement.panels } };
		this.storageService.store(PUBLISHED_STORAGE_KEY, JSON.stringify(published), StorageScope.PROFILE, StorageTarget.USER);
		this.register();
	}

	private getPublished(): PublishedPanels {
		try {
			const value = JSON.parse(this.storageService.get(PUBLISHED_STORAGE_KEY, StorageScope.PROFILE, '{}'));
			return value && typeof value === 'object' ? value : {};
		} catch {
			return {};
		}
	}

	/** Reads the panels of every installed toolbox. */
	private async load(extensions: readonly IExtensionPointUser<IToolboxContribution[]>[]): Promise<void> {
		const generation = ++this.generation;
		const loaded: ILoadedToolbox[] = [];
		const submenus = placeSubmenus();
		for (const extension of extensions) {
			const location = extension.description.extensionLocation;
			for (const toolbox of extension.value) {
				const named = toolbox.menu ? TOP_LEVEL_MENUS[toolbox.menu.toLowerCase()] ?? (submenus.has(toolbox.menu) ? MenuId.for(toolbox.menu) : undefined) : undefined;
				const destination = named ?? MenuId.MenubarExploreMenu;
				const panels: { contribution: IToolboxPanelContribution; panel: IScaffoldPanel }[] = [];
				for (const contribution of toolbox.panels) {
					const toml = joinPath(location, contribution.data);
					if (!isEqualOrParent(toml, location)) {
						extension.collector.error(localize('pollisToolboxes.outside', "The data of panel {0} ({1}) must be inside the extension folder.", contribution.id, contribution.data));
						continue;
					}
					try {
						const data = tomlToPanelData(parseToml((await this.fileService.readFile(toml)).value.toString()));
						panels.push({
							contribution,
							panel: {
								id: contribution.id,
								viewType: `pollis.${contribution.id}`,
								title: contribution.title,
								data,
								html: () => buildScaffoldHtml(contribution.id, data, { title: contribution.title, defaultModel: contribution.defaultModel, decisionFirstColumn: contribution.decisionFirstColumn }),
							},
						});
					} catch (error) {
						this.logService.error(`Pollis toolbox ${toolbox.id}: cannot read panel ${contribution.id} (${toml.toString()})`, error);
					}
				}
				loaded.push({ extensionId: ExtensionIdentifier.toKey(extension.description.identifier), toolbox, destination, named: !!named, location, panels });
			}
		}
		if (generation !== this.generation) {
			return;
		}
		this.loaded = loaded;
		this.register();
	}

	/**
	 * Registers the panels' commands, wikis and notebooks, and adds the published panels to the
	 * menus. The registrations are swapped at once, so the menus never show a half-registered toolbox.
	 */
	private register(): void {
		const published = this.getPublished();
		const store = new DisposableStore();
		for (const loaded of this.loaded) {
			const { toolbox, location } = loaded;
			const entry = published[publishedKey(loaded)];
			const placement: IToolboxPlacement = entry ? placementOf(loaded, entry) : { menu: undefined, panels: {} };
			const submenu = this.submenus.get(toolbox.id) ?? new MenuId(`${TOOLBOX_SUBMENU_PREFIX}${toolbox.id}`);
			this.submenus.set(toolbox.id, submenu);
			if (placement.menu && loaded.panels.some(({ contribution }) => placement.panels[contribution.id]?.menu === TOOLBOX_MENU)) {
				const { menu, group, order } = placement.menu;
				store.add(MenuRegistry.appendMenuItem(MenuId.for(menu), { group, order, submenu, title: toolbox.title }));
			}
			for (const { contribution, panel } of loaded.panels) {
				// The folders the panel's wikis and notebooks are in: its id, or another name (e.g. `game-theory`)
				const folders = (entries: readonly (IModelWiki | IModelNotebook)[]) => new Set([contribution.id, ...entries.map(entry => hasKey(entry, { file: true }) ? entry.file.split('/')[0] : '').filter(folder => folder)]);
				for (const folder of folders(panel.data.wikis)) {
					store.add(registerExternalFolder('wiki', folder, joinPath(location, 'wiki', folder)));
				}
				for (const folder of folders(panel.data.notebooks)) {
					store.add(registerExternalFolder('notebook', folder, joinPath(location, 'notebooks', folder)));
				}
				store.add(CommandsRegistry.registerCommand(contribution.command, accessor => openScaffoldWebview(accessor, panel)));
				const place = placement.panels[contribution.id];
				const command = { id: contribution.command, title: contribution.menuTitle ?? contribution.title };
				if (place?.menu === TOOLBOX_MENU) {
					if (placement.menu) {
						store.add(MenuRegistry.appendMenuItem(submenu, { group: place.group, order: place.order, command }));
					}
				} else if (place) {
					store.add(MenuRegistry.appendMenuItem(MenuId.for(place.menu), { group: place.group, order: place.order, command }));
				}
			}
		}
		this.registrations.value = store;
		this._onDidChange.fire();
	}
}

/** The submenus of Explore, Model, Simulate and Optimise, at any depth, without the toolboxes' own menus. */
function placeSubmenus(): Set<string> {
	const ids = new Set<string>();
	const walk = (menu: MenuId) => {
		for (const item of MenuRegistry.getMenuItems(menu)) {
			if (isISubmenuItem(item) && !item.submenu.id.startsWith(TOOLBOX_SUBMENU_PREFIX) && !ids.has(item.submenu.id)) {
				ids.add(item.submenu.id);
				walk(item.submenu);
			}
		}
	};
	Object.values(TOP_LEVEL_MENUS).forEach(walk);
	return ids;
}

function publishedKey(loaded: ILoadedToolbox): string {
	return `${loaded.extensionId}/${loaded.toolbox.id}`;
}

/**
 * The places the author suggests: the toolbox's menu in the menu the toolbox names, with every
 * panel in it, or every panel straight into that menu when the toolbox is inline, each in the
 * group and order the author gives. A toolbox that names no menu Pollis has goes at the end of Explore.
 */
function suggestedPlacement(loaded: ILoadedToolbox): IToolboxPlacement {
	const { toolbox, destination, named } = loaded;
	const panels: Record<string, IToolboxPlace> = {};
	loaded.panels.forEach(({ contribution }, index) => {
		const order = contribution.order ?? index + 1;
		panels[contribution.id] = toolbox.inline
			? { menu: destination.id, group: named ? contribution.group ?? DEFAULT_GROUP : TOOLBOX_END_GROUP, order }
			: { menu: TOOLBOX_MENU, group: contribution.group ?? DEFAULT_PANEL_GROUP, order };
	});
	return {
		menu: toolbox.inline ? undefined : { menu: destination.id, group: named ? toolbox.group ?? DEFAULT_GROUP : TOOLBOX_END_GROUP, order: toolbox.order ?? 0 },
		panels,
	};
}

/** A published entry, in any format: a menu named as a string keeps the author's place in it, else goes at its end. */
function placementOf(loaded: ILoadedToolbox, entry: IStoredPlacement | Record<string, string>): IToolboxPlacement {
	const suggested = suggestedPlacement(loaded);
	const stored: IStoredPlacement = isStoredPlacement(entry) ? entry : { menu: suggested.menu, panels: entry };
	const placeOf = (value: string | IToolboxPlace, author: IToolboxPlace | undefined, order: number): IToolboxPlace => {
		if (typeof value !== 'string') {
			return value;
		}
		if (author && (value === 'author' || value === author.menu)) {
			return author;
		}
		return { menu: value, group: value === TOOLBOX_MENU ? DEFAULT_PANEL_GROUP : TOOLBOX_END_GROUP, order };
	};
	const panels: Record<string, IToolboxPlace> = {};
	loaded.panels.forEach(({ contribution }, index) => {
		const value = stored.panels[contribution.id];
		if (value !== undefined) {
			panels[contribution.id] = placeOf(value, suggested.panels[contribution.id], index + 1);
		}
	});
	return { menu: stored.menu === undefined ? undefined : placeOf(stored.menu, suggested.menu, loaded.toolbox.order ?? 0), panels };
}

function isStoredPlacement(entry: IStoredPlacement | Record<string, string>): entry is IStoredPlacement {
	return typeof entry.panels === 'object';
}

registerSingleton(IToolboxPanelsService, ToolboxPanelsService, InstantiationType.Delayed);

/** Creates the service at startup, so the published panels are in the menus from the start. */
class ToolboxPanelsContribution implements IWorkbenchContribution {

	static readonly ID = 'workbench.contrib.pollisToolboxPanels';

	constructor(@IToolboxPanelsService _toolboxPanelsService: IToolboxPanelsService) { }
}

registerWorkbenchContribution2(ToolboxPanelsContribution.ID, ToolboxPanelsContribution, WorkbenchPhase.BlockRestore);
