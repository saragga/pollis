/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import './media/pollisViews.css';
import { $, append, getActiveDocument, getDomNodePagePosition, getDomNodeZoomLevel } from '../../../../base/browser/dom.js';
import { BaseActionViewItem, IBaseActionViewItemOptions } from '../../../../base/browser/ui/actionbar/actionViewItems.js';
import { IAction, Separator, toAction } from '../../../../base/common/actions.js';
import { Codicon } from '../../../../base/common/codicons.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { ThemeIcon } from '../../../../base/common/themables.js';
import { localize, localize2 } from '../../../../nls.js';
import { IActionViewItemService } from '../../../../platform/actions/browser/actionViewItemService.js';
import { Action2, MenuId, registerAction2 } from '../../../../platform/actions/common/actions.js';
import { ICommandService } from '../../../../platform/commands/common/commands.js';
import { ContextKeyExpr } from '../../../../platform/contextkey/common/contextkey.js';
import { IContextMenuService } from '../../../../platform/contextview/browser/contextView.js';
import { ConfigurationScope, Extensions as ConfigurationExtensions, IConfigurationRegistry } from '../../../../platform/configuration/common/configurationRegistry.js';
import { IDialogService } from '../../../../platform/dialogs/common/dialogs.js';
import { IFileService } from '../../../../platform/files/common/files.js';
import { SyncDescriptor } from '../../../../platform/instantiation/common/descriptors.js';
import { InstantiationType, registerSingleton } from '../../../../platform/instantiation/common/extensions.js';
import { IInstantiationService, ServicesAccessor } from '../../../../platform/instantiation/common/instantiation.js';
import { INotificationService } from '../../../../platform/notification/common/notification.js';
import { IOpenerService } from '../../../../platform/opener/common/opener.js';
import { IQuickInputService, IQuickPickItem } from '../../../../platform/quickinput/common/quickInput.js';
import { Registry } from '../../../../platform/registry/common/platform.js';
import { registerIcon } from '../../../../platform/theme/common/iconRegistry.js';
import { ViewPaneContainer } from '../../../browser/parts/views/viewPaneContainer.js';
import { IsAuxiliaryWindowContext } from '../../../common/contextkeys.js';
import { IWorkbenchContribution, registerWorkbenchContribution2, WorkbenchPhase } from '../../../common/contributions.js';
import { IViewContainersRegistry, IViewsRegistry, ViewContainerLocation, Extensions as ViewExtensions } from '../../../common/views.js';
import { IEditorService } from '../../../services/editor/common/editorService.js';
import { IViewsService } from '../../../services/views/common/viewsService.js';
import { IPollisViewsService, MAX_VIEW_NAME, POLLIS_VIEW_SETTING } from '../common/pollisViews.js';
import { PollisViewsView } from './pollisViewsPanel.js';
import { PollisViewsService } from './pollisViewsService.js';

registerSingleton(IPollisViewsService, PollisViewsService, InstantiationType.Delayed);

const SELECT_VIEW_COMMAND_ID = 'pollis.views.select';
const SHOW_VIEWS_MENU_COMMAND_ID = 'pollis.views.showMenu';
const CREATE_VIEW_COMMAND_ID = 'pollis.views.create';
const SAVE_VIEW_AS_COMMAND_ID = 'pollis.views.saveAs';
const EDIT_VIEW_COMMAND_ID = 'pollis.views.edit';
const DELETE_VIEW_COMMAND_ID = 'pollis.views.delete';
const OPEN_VIEWS_FOLDER_COMMAND_ID = 'pollis.views.openFolder';
const OPEN_VIEW_FILE_COMMAND_ID = 'pollis.views.openFile';

const category = localize2('pollisViews.category', "Pollis");

Registry.as<IConfigurationRegistry>(ConfigurationExtensions.Configuration).registerConfiguration({
	id: 'pollisViews',
	title: localize('pollisViews.configurationTitle', "Pollis Views"),
	type: 'object',
	properties: {
		[POLLIS_VIEW_SETTING]: {
			type: 'string',
			default: MAX_VIEW_NAME,
			scope: ConfigurationScope.APPLICATION,
			markdownDescription: localize('pollisViews.view', "The View in use: the menu items Pollis shows. `Max` shows everything and `Min` a short selection; your own Views are the JSON files in `~/.pollis/views`. Use the **Pollis: Select View…** command to switch."),
		},
	},
});

// --- Views panel (secondary side bar): the menu items with a tick each

const VIEWS_VIEW_CONTAINER_ID = 'workbench.view.pollis.views';

const viewsViewIcon = registerIcon('pollis-views-view-icon', Codicon.listTree, localize('pollisViews.viewIcon', "View icon of the Views panel."));

const viewsViewContainer = Registry.as<IViewContainersRegistry>(ViewExtensions.ViewContainersRegistry).registerViewContainer({
	id: VIEWS_VIEW_CONTAINER_ID,
	title: localize2('pollisViews.viewContainer.label', "Views"),
	icon: viewsViewIcon,
	ctorDescriptor: new SyncDescriptor(ViewPaneContainer, [VIEWS_VIEW_CONTAINER_ID, { mergeViewWithContainerWhenSingleView: true }]),
	storageId: VIEWS_VIEW_CONTAINER_ID,
	// After Databases
	order: 1001,
}, ViewContainerLocation.AuxiliaryBar);

Registry.as<IViewsRegistry>(ViewExtensions.ViewsRegistry).registerViews([{
	id: PollisViewsView.ID,
	name: localize2('pollisViews.panel', "Menu Items"),
	containerIcon: viewsViewIcon,
	singleViewPaneContainerTitle: viewsViewContainer.title.value,
	ctorDescriptor: new SyncDescriptor(PollisViewsView),
	canToggleVisibility: false,
	canMoveView: true,
}], viewsViewContainer);

const viewsPanelTitle = ContextKeyExpr.equals('view', PollisViewsView.ID);

/** Makes a View the one in use and shows its menu items in the Views panel. */
async function editInPanel(viewsService: IPollisViewsService, viewsViewService: IViewsService, name: string): Promise<void> {
	await viewsService.setActiveView(name);
	await viewsViewService.openView(PollisViewsView.ID, true);
}

/** Asks for the name of a new View, which must differ from the names of the existing Views. */
async function askViewName(viewsService: IPollisViewsService, quickInputService: IQuickInputService, prompt: string): Promise<string | undefined> {
	const names = new Set(viewsService.getViews().map(view => view.name));
	const name = await quickInputService.input({
		prompt,
		validateInput: async value => names.has(value.trim()) ? localize('pollisViews.create.exists', "A View with this name already exists.") : undefined,
	});
	return name?.trim() || undefined;
}

/**
 * Shows the Views menu under (or above) an element: the Views, with a tick on the one in use, then
 * the commands to create, edit and delete Views and to open their folder.
 */
function showViewsMenu(anchor: HTMLElement, viewsService: IPollisViewsService, contextMenuService: IContextMenuService, commandService: ICommandService): void {
	const active = viewsService.getActiveView().name;
	const views = viewsService.getViews();
	const command = (id: string, label: string) => toAction({ id, label, run: () => commandService.executeCommand(id) });
	// A point a little below the element, so the menu leaves the bottom of the button visible
	const position = getDomNodePagePosition(anchor);
	const zoom = getDomNodeZoomLevel(anchor);
	contextMenuService.showContextMenu({
		getAnchor: () => ({ x: position.left * zoom, y: (position.top + position.height) * zoom + 8 }),
		getActions: () => [
			...views.map(view => toAction({ id: `pollis.views.use.${view.name}`, label: view.name, checked: view.name === active, run: () => viewsService.setActiveView(view.name) })),
			new Separator(),
			command(CREATE_VIEW_COMMAND_ID, localize('pollisViews.createItem', "Create View...")),
			command(SAVE_VIEW_AS_COMMAND_ID, localize('pollisViews.saveAsItem', "Save View As...")),
			...(views.some(view => view.resource) ? [
				command(EDIT_VIEW_COMMAND_ID, localize('pollisViews.editItem', "Edit View...")),
				command(DELETE_VIEW_COMMAND_ID, localize('pollisViews.deleteItem', "Delete View...")),
			] : []),
			command(OPEN_VIEWS_FOLDER_COMMAND_ID, localize('pollisViews.openFolderItem', "Open Views Folder")),
		],
	});
}

/**
 * The View button in the title bar: the name of the View in use in a box. Clicking it shows the
 * Views menu.
 */
class PollisViewButton extends BaseActionViewItem {

	private label: HTMLElement | undefined;

	constructor(
		action: IAction,
		options: IBaseActionViewItemOptions,
		@IPollisViewsService private readonly viewsService: IPollisViewsService,
		@IContextMenuService private readonly contextMenuService: IContextMenuService,
		@ICommandService private readonly commandService: ICommandService,
	) {
		super(undefined, action, options);
		this._register(this.viewsService.onDidChange(() => this.update()));
	}

	override render(container: HTMLElement): void {
		super.render(container);
		container.classList.add('pollis-view-button');
		append(container, $(ThemeIcon.asCSSSelector(Codicon.listTree)));
		append(container, $('span.pollis-view-prefix')).textContent = localize('pollisViews.button.prefix', "View:");
		this.label = append(container, $('span.pollis-view-name'));
		this.update();
	}

	override onClick(): void {
		if (this.element) {
			showViewsMenu(this.element, this.viewsService, this.contextMenuService, this.commandService);
		}
	}

	protected override getTooltip(): string {
		return localize('pollisViews.button.tooltip', "Menu View: the menus show the {0} View. Click to switch, create or edit Views.", this.viewsService.getActiveView().name);
	}

	private update(): void {
		const name = this.viewsService.getActiveView().name;
		if (this.label) {
			this.label.textContent = name;
		}
		this.element?.setAttribute('aria-label', localize('pollisViews.button.ariaLabel', "Pollis View: {0}", name));
		this.updateTooltip();
	}
}

/**
 * Applies the active View from startup on, and shows its name in the title bar, before the
 * layout controls.
 */
class PollisViewsTitleBarContribution extends Disposable implements IWorkbenchContribution {

	static readonly ID = 'workbench.contrib.pollisViewsTitleBar';

	constructor(
		@IPollisViewsService viewsService: IPollisViewsService,
		@IActionViewItemService actionViewItemService: IActionViewItemService,
		@IInstantiationService instantiationService: IInstantiationService,
	) {
		super();
		viewsService.getActiveView();
		this._register(actionViewItemService.register(MenuId.LayoutControlMenu, SHOW_VIEWS_MENU_COMMAND_ID, (action, options) => instantiationService.createInstance(PollisViewButton, action, options)));
	}
}

registerWorkbenchContribution2(PollisViewsTitleBarContribution.ID, PollisViewsTitleBarContribution, WorkbenchPhase.BlockStartup);

registerAction2(class ShowViewsMenuAction extends Action2 {
	constructor() {
		super({
			id: SHOW_VIEWS_MENU_COMMAND_ID,
			title: localize2('pollisViews.showMenu', "Show Views Menu"),
			category,
			icon: Codicon.listTree,
			menu: {
				id: MenuId.LayoutControlMenu,
				group: '0_pollis_view',
				when: IsAuxiliaryWindowContext.negate(),
			},
		});
	}

	run(accessor: ServicesAccessor): void {
		// The View button is a title-bar action whose element this command cannot reach otherwise.
		// eslint-disable-next-line no-restricted-syntax
		const anchor = getActiveDocument().querySelector<HTMLElement>('.pollis-view-button');
		if (anchor) {
			showViewsMenu(anchor, accessor.get(IPollisViewsService), accessor.get(IContextMenuService), accessor.get(ICommandService));
		}
	}
});

interface IViewPickItem extends IQuickPickItem {
	readonly viewName?: string;
	readonly command?: string;
}

registerAction2(class SelectViewAction extends Action2 {
	constructor() {
		super({
			id: SELECT_VIEW_COMMAND_ID,
			icon: Codicon.eye,
			menu: { id: MenuId.ViewTitle, when: viewsPanelTitle, group: 'navigation', order: 1 },
			title: localize2('pollisViews.select', "Select View..."),
			category,
			f1: true,
		});
	}

	async run(accessor: ServicesAccessor): Promise<void> {
		const viewsService = accessor.get(IPollisViewsService);
		const quickInputService = accessor.get(IQuickInputService);
		const commandService = accessor.get(ICommandService);

		const active = viewsService.getActiveView().name;
		const items: (IViewPickItem | { type: 'separator'; label?: string })[] = [];
		const views = viewsService.getViews();
		const builtinCount = views.filter(view => !view.resource).length;
		views.forEach((view, index) => {
			if (index === builtinCount) {
				items.push({ type: 'separator' });
			}
			const inUse = view.name === active;
			items.push({
				label: view.name,
				description: !view.resource
					? (inUse ? localize('pollisViews.builtinActive', "built-in, in use") : localize('pollisViews.builtin', "built-in"))
					: (inUse ? localize('pollisViews.active', "in use") : undefined),
				viewName: view.name,
			});
		});
		items.push({ type: 'separator' });
		items.push({ label: `$(add) ${localize('pollisViews.createPick', "Create View...")}`, command: CREATE_VIEW_COMMAND_ID });
		items.push({ label: `$(save-as) ${localize('pollisViews.saveAsPick', "Save View As...")}`, command: SAVE_VIEW_AS_COMMAND_ID });
		if (builtinCount < views.length) {
			items.push({ label: `$(edit) ${localize('pollisViews.editPick', "Edit View...")}`, command: EDIT_VIEW_COMMAND_ID });
			items.push({ label: `$(trash) ${localize('pollisViews.deletePick', "Delete View...")}`, command: DELETE_VIEW_COMMAND_ID });
		}
		items.push({ label: `$(folder-opened) ${localize('pollisViews.openFolderPick', "Open Views Folder")}`, command: OPEN_VIEWS_FOLDER_COMMAND_ID });

		const pick = await quickInputService.pick<IViewPickItem>(items, {
			placeHolder: localize('pollisViews.placeholder', "Select the View the menus show"),
			activeItem: items.find((item): item is IViewPickItem => 'viewName' in item && item.viewName === active),
		});
		if (pick?.viewName) {
			await viewsService.setActiveView(pick.viewName);
		} else if (pick?.command) {
			await commandService.executeCommand(pick.command);
		}
	}
});

registerAction2(class CreateViewAction extends Action2 {
	constructor() {
		super({
			id: CREATE_VIEW_COMMAND_ID,
			title: localize2('pollisViews.create', "Create View..."),
			category,
			icon: Codicon.add,
			menu: { id: MenuId.ViewTitle, when: viewsPanelTitle, group: 'navigation', order: 2 },
			f1: true,
		});
	}

	async run(accessor: ServicesAccessor): Promise<void> {
		const viewsService = accessor.get(IPollisViewsService);
		const quickInputService = accessor.get(IQuickInputService);
		const viewsViewService = accessor.get(IViewsService);

		const name = await askViewName(viewsService, quickInputService, localize('pollisViews.create.prompt', "Name of the new View"));
		if (!name) {
			return;
		}
		const active = viewsService.getActiveView().name;
		const items = viewsService.getViews().map(view => ({ label: view.name, description: view.name === active ? localize('pollisViews.active', "in use") : undefined, view }));
		const base = await quickInputService.pick(items, {
			placeHolder: localize('pollisViews.create.base', "Start from which View? {0} starts with every menu item.", MAX_VIEW_NAME),
			activeItem: items[0],
		});
		if (!base) {
			return;
		}
		await viewsService.createView(name, base.view);
		await editInPanel(viewsService, viewsViewService, name);
	}
});

registerAction2(class SaveViewAsAction extends Action2 {
	constructor() {
		super({
			id: SAVE_VIEW_AS_COMMAND_ID,
			title: localize2('pollisViews.saveAs', "Save View As..."),
			category,
			icon: Codicon.saveAs,
			menu: { id: MenuId.ViewTitle, when: viewsPanelTitle, group: 'navigation', order: 3 },
			f1: true,
		});
	}

	async run(accessor: ServicesAccessor): Promise<void> {
		const viewsService = accessor.get(IPollisViewsService);
		const quickInputService = accessor.get(IQuickInputService);
		const viewsViewService = accessor.get(IViewsService);

		const active = viewsService.getActiveView();
		const name = await askViewName(viewsService, quickInputService, localize('pollisViews.saveAs.prompt', "Save the View \"{0}\" as a new View, which you can edit. Its name:", active.name));
		if (!name) {
			return;
		}
		await viewsService.createView(name, active);
		await editInPanel(viewsService, viewsViewService, name);
	}
});

registerAction2(class OpenViewsFolderAction extends Action2 {
	constructor() {
		super({
			id: OPEN_VIEWS_FOLDER_COMMAND_ID,
			title: localize2('pollisViews.openFolder', "Open Views Folder"),
			category,
			f1: true,
		});
	}

	async run(accessor: ServicesAccessor): Promise<void> {
		const viewsService = accessor.get(IPollisViewsService);
		const fileService = accessor.get(IFileService);
		const openerService = accessor.get(IOpenerService);

		// Open the folder itself in Finder or Explorer, rather than select it in its parent
		await fileService.createFolder(viewsService.folder).catch(() => undefined);
		await openerService.open(viewsService.folder, { openExternal: true });
	}
});

registerAction2(class EditViewAction extends Action2 {
	constructor() {
		super({
			id: EDIT_VIEW_COMMAND_ID,
			title: localize2('pollisViews.edit', "Edit View..."),
			category,
			f1: true,
		});
	}

	async run(accessor: ServicesAccessor): Promise<void> {
		const viewsService = accessor.get(IPollisViewsService);
		const quickInputService = accessor.get(IQuickInputService);
		const viewsViewService = accessor.get(IViewsService);
		const notificationService = accessor.get(INotificationService);

		const views = viewsService.getViews().filter(view => view.resource);
		if (!views.length) {
			notificationService.info(localize('pollisViews.edit.none', "The built-in Views cannot be edited. Create a View first, starting from one of them."));
			return;
		}
		const active = viewsService.getActiveView().name;
		const items = views.map(view => ({ label: view.name, description: view.name === active ? localize('pollisViews.active', "in use") : undefined, view }));
		const pick = await quickInputService.pick(items, {
			placeHolder: localize('pollisViews.edit.placeholder', "Select the View to edit. It becomes the View in use, and the Views panel shows its menu items."),
			activeItem: items.find(item => item.view.name === active),
		});
		if (!pick) {
			return;
		}
		await editInPanel(viewsService, viewsViewService, pick.view.name);
	}
});

registerAction2(class OpenViewFileAction extends Action2 {
	constructor() {
		super({
			id: OPEN_VIEW_FILE_COMMAND_ID,
			title: localize2('pollisViews.openFile', "Open View File"),
			category,
			f1: true,
			icon: Codicon.goToFile,
			menu: { id: MenuId.ViewTitle, when: viewsPanelTitle, group: 'navigation', order: 3 },
		});
	}

	async run(accessor: ServicesAccessor): Promise<void> {
		const viewsService = accessor.get(IPollisViewsService);
		const editorService = accessor.get(IEditorService);
		const notificationService = accessor.get(INotificationService);

		// The View in use, as a JSON file with every menu item on its own line
		const view = viewsService.getActiveView();
		if (!view.resource) {
			notificationService.info(localize('pollisViews.openFile.builtin', "The View \"{0}\" is built in, so it has no file. Create a View first, starting from it.", view.name));
			return;
		}
		const resource = await viewsService.editView(view);
		await editorService.openEditor({ resource });
	}
});

registerAction2(class DeleteViewAction extends Action2 {
	constructor() {
		super({
			id: DELETE_VIEW_COMMAND_ID,
			title: localize2('pollisViews.delete', "Delete View..."),
			category,
			f1: true,
		});
	}

	async run(accessor: ServicesAccessor): Promise<void> {
		const viewsService = accessor.get(IPollisViewsService);
		const quickInputService = accessor.get(IQuickInputService);
		const dialogService = accessor.get(IDialogService);
		const notificationService = accessor.get(INotificationService);

		const views = viewsService.getViews().filter(view => view.resource);
		if (!views.length) {
			notificationService.info(localize('pollisViews.delete.none', "There are no Views of your own to delete. The built-in Views cannot be deleted."));
			return;
		}
		const active = viewsService.getActiveView().name;
		const items = views.map(view => ({ label: view.name, description: view.name === active ? localize('pollisViews.active', "in use") : undefined, view }));
		const pick = await quickInputService.pick(items, {
			placeHolder: localize('pollisViews.delete.placeholder', "Select the View to delete"),
		});
		if (!pick) {
			return;
		}
		const { confirmed } = await dialogService.confirm({
			type: 'warning',
			message: localize('pollisViews.delete.confirm', "Delete the View \"{0}\"?", pick.view.name),
			detail: pick.view.name === active
				? localize('pollisViews.delete.detailActive', "Its file moves to the Trash, so it can be restored. The menus switch to the {0} View.", MAX_VIEW_NAME)
				: localize('pollisViews.delete.detail', "Its file moves to the Trash, so it can be restored."),
			primaryButton: localize({ key: 'pollisViews.delete.button', comment: ['&& denotes a mnemonic'] }, "&&Delete"),
		});
		if (confirmed) {
			await viewsService.deleteView(pick.view);
		}
	}
});
