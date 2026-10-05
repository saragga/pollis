/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { localize } from '../../../../nls.js';
import { Disposable, DisposableStore, MutableDisposable } from '../../../../base/common/lifecycle.js';
import { joinPath, isEqualOrParent } from '../../../../base/common/resources.js';
import { MenuId, MenuRegistry } from '../../../../platform/actions/common/actions.js';
import { CommandsRegistry } from '../../../../platform/commands/common/commands.js';
import { IFileService } from '../../../../platform/files/common/files.js';
import { ILogService } from '../../../../platform/log/common/log.js';
import { IWorkbenchContribution, registerWorkbenchContribution2, WorkbenchPhase } from '../../../common/contributions.js';
import { ExtensionsRegistry, IExtensionPointUser } from '../../../services/extensions/common/extensionsRegistry.js';
import { IScaffoldPanel, openScaffoldWebview } from '../../model/browser/commands/scaffold.command.js';
import { registerExternalFolder } from '../../model/browser/common/customCopyFileSystem.js';
import { parseToml, tomlToPanelData } from '../../model/browser/common/tomlPanelData.js';
import { buildScaffoldHtml } from '../../model/browser/webviews/scaffoldParts.js';

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

/** A toolbox contributed by an extension: a submenu of the Toolboxes menu. */
interface IToolboxContribution {
	readonly id: string;
	readonly title: string;
	/** The group in the Toolboxes menu. */
	readonly group: string;
	readonly order: number;
	readonly panels: IToolboxPanelContribution[];
}

const toolboxesExtensionPoint = ExtensionsRegistry.registerExtensionPoint<IToolboxContribution[]>({
	extensionPoint: 'pollisToolboxes',
	jsonSchema: {
		description: localize('pollisToolboxes', "Contributes Pollis toolboxes: a submenu of the Toolboxes menu with the panels it opens."),
		type: 'array',
		items: {
			type: 'object',
			required: ['id', 'title', 'group', 'order', 'panels'],
			properties: {
				id: { type: 'string', description: localize('pollisToolboxes.id', "The toolbox id.") },
				title: { type: 'string', description: localize('pollisToolboxes.title', "The toolbox's menu title.") },
				group: { type: 'string', description: localize('pollisToolboxes.group', "The group in the Toolboxes menu.") },
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

/**
 * Adds the toolboxes that extensions contribute to the Toolboxes menu. A toolbox extension has no
 * code: its panels are TOML files read here and opened on the shared scaffold, and its wikis and
 * notebooks (folders `wiki/<panel id>/` and `notebooks/<panel id>/`) are served as if bundled.
 * The toolbox extensions are not built in (their sources are in toolboxes/ at the repository root):
 * the user installs them from the Toolboxes section of the Extensions pane, into the user's
 * extensions folder, and the files are read from wherever the extension is installed.
 */
class ToolboxExtensionsContribution extends Disposable implements IWorkbenchContribution {

	static readonly ID = 'workbench.contrib.pollisToolboxExtensions';

	private readonly registrations = this._register(new MutableDisposable<DisposableStore>());
	/** The toolbox submenus by toolbox id: a menu id can be created only once. */
	private readonly submenus = new Map<string, MenuId>();
	/** Counts the registrations, so a slower earlier one does not overwrite a later one. */
	private generation = 0;

	constructor(
		@IFileService private readonly fileService: IFileService,
		@ILogService private readonly logService: ILogService,
	) {
		super();
		toolboxesExtensionPoint.setHandler(extensions => this.register(extensions));
	}

	private async register(extensions: readonly IExtensionPointUser<IToolboxContribution[]>[]): Promise<void> {
		const generation = ++this.generation;
		const items: ((store: DisposableStore) => void)[] = [];
		for (const extension of extensions) {
			const location = extension.description.extensionLocation;
			for (const toolbox of extension.value) {
				const toolboxMenu = this.submenus.get(toolbox.id) ?? new MenuId(`pollisToolbox.${toolbox.id}`);
				this.submenus.set(toolbox.id, toolboxMenu);
				items.push(store => store.add(MenuRegistry.appendMenuItem(MenuId.MenubarToolboxesMenu, { group: toolbox.group, order: toolbox.order, submenu: toolboxMenu, title: toolbox.title })));
				for (const contribution of toolbox.panels) {
					const toml = joinPath(location, contribution.data);
					if (!isEqualOrParent(toml, location)) {
						extension.collector.error(localize('pollisToolboxes.outside', "The data of panel {0} ({1}) must be inside the extension folder.", contribution.id, contribution.data));
						continue;
					}
					let panel: IScaffoldPanel;
					try {
						const data = tomlToPanelData(parseToml((await this.fileService.readFile(toml)).value.toString()));
						panel = {
							id: contribution.id,
							viewType: `pollis.${contribution.id}`,
							title: contribution.title,
							data,
							html: () => buildScaffoldHtml(contribution.id, data, { title: contribution.title, defaultModel: contribution.defaultModel, decisionFirstColumn: contribution.decisionFirstColumn }),
						};
					} catch (error) {
						this.logService.error(`Pollis toolbox ${toolbox.id}: cannot read panel ${contribution.id} (${toml.toString()})`, error);
						continue;
					}
					items.push(store => {
						store.add(registerExternalFolder('wiki', contribution.id, joinPath(location, 'wiki', contribution.id)));
						store.add(registerExternalFolder('notebook', contribution.id, joinPath(location, 'notebooks', contribution.id)));
						store.add(CommandsRegistry.registerCommand(contribution.command, accessor => openScaffoldWebview(accessor, panel)));
						store.add(MenuRegistry.appendMenuItem(toolboxMenu, { group: contribution.group, order: contribution.order, command: { id: contribution.command, title: contribution.menuTitle ?? contribution.title } }));
					});
				}
			}
		}
		if (generation !== this.generation) {
			return;
		}
		// Swap the registrations at once, so the menus never show a half-registered toolbox
		const store = new DisposableStore();
		this.registrations.value = store;
		for (const add of items) {
			add(store);
		}
	}
}

registerWorkbenchContribution2(ToolboxExtensionsContribution.ID, ToolboxExtensionsContribution, WorkbenchPhase.BlockRestore);
