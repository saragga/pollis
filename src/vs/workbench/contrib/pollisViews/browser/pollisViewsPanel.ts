/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as dom from '../../../../base/browser/dom.js';
import { Button } from '../../../../base/browser/ui/button/button.js';
import { IListVirtualDelegate } from '../../../../base/browser/ui/list/list.js';
import { TriStateCheckbox } from '../../../../base/browser/ui/toggle/toggle.js';
import { IObjectTreeElement, ITreeNode, ITreeRenderer } from '../../../../base/browser/ui/tree/tree.js';
import { DisposableStore } from '../../../../base/common/lifecycle.js';
import { localize } from '../../../../nls.js';
import { ICommandService } from '../../../../platform/commands/common/commands.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { IContextKeyService } from '../../../../platform/contextkey/common/contextkey.js';
import { IContextMenuService } from '../../../../platform/contextview/browser/contextView.js';
import { IHoverService } from '../../../../platform/hover/browser/hover.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { IKeybindingService } from '../../../../platform/keybinding/common/keybinding.js';
import { WorkbenchObjectTree } from '../../../../platform/list/browser/listService.js';
import { INotificationService } from '../../../../platform/notification/common/notification.js';
import { IOpenerService } from '../../../../platform/opener/common/opener.js';
import { defaultButtonStyles, defaultCheckboxStyles } from '../../../../platform/theme/browser/defaultStyles.js';
import { IThemeService } from '../../../../platform/theme/common/themeService.js';
import { IViewPaneOptions, ViewPane } from '../../../browser/parts/views/viewPane.js';
import { IViewDescriptorService } from '../../../common/views.js';
import { IPollisMenuNode, IPollisView, IPollisViewsService } from '../common/pollisViews.js';

/** A menu or menu item in the tree, with its place in the menu bar (the same command can be in several menus). */
interface IMenuElement {
	node: IPollisMenuNode;
	/** The ids from the menu bar down to the node, which identify it in the tree. */
	readonly path: string;
	/** Whether the node shows in the menus with the active View. Menus: whether all, some or none of their items do. */
	state: boolean | 'mixed';
	/** Menus only: how many of the items below show, and how many there are. */
	shown: number;
	total: number;
}

class MenuElementDelegate implements IListVirtualDelegate<IMenuElement> {
	getHeight(): number {
		return 22;
	}

	getTemplateId(): string {
		return MenuElementRenderer.TEMPLATE_ID;
	}
}

interface IMenuElementTemplate {
	readonly checkbox: TriStateCheckbox;
	readonly title: HTMLElement;
	readonly description: HTMLElement;
	element: IMenuElement | undefined;
	readonly disposables: DisposableStore;
}

class MenuElementRenderer implements ITreeRenderer<IMenuElement, void, IMenuElementTemplate> {

	static readonly TEMPLATE_ID = 'pollisMenuElement';
	readonly templateId = MenuElementRenderer.TEMPLATE_ID;

	constructor(
		private readonly isEditable: () => boolean,
		private readonly onToggle: (element: IMenuElement, visible: boolean) => void,
	) { }

	renderTemplate(container: HTMLElement): IMenuElementTemplate {
		const row = dom.append(container, dom.$('.pollis-views-item'));
		const disposables = new DisposableStore();
		const checkbox = disposables.add(new TriStateCheckbox(localize('pollisViewsPanel.toggle', "Show in the Menus"), false, defaultCheckboxStyles));
		row.appendChild(checkbox.domNode);
		const title = dom.append(row, dom.$('span.title'));
		const description = dom.append(row, dom.$('span.description'));
		const template: IMenuElementTemplate = { checkbox, title, description, element: undefined, disposables };
		disposables.add(checkbox.onChange(() => {
			if (template.element) {
				this.onToggle(template.element, checkbox.checked === true);
			}
		}));
		// The tree would otherwise take the click on the box for a click on the row and toggle the menu open
		disposables.add(dom.addDisposableListener(checkbox.domNode, dom.EventType.MOUSE_DOWN, e => e.stopPropagation()));
		return template;
	}

	renderElement(node: ITreeNode<IMenuElement, void>, _index: number, template: IMenuElementTemplate): void {
		const element = node.element;
		template.element = element;
		template.checkbox.checked = element.state;
		if (this.isEditable()) {
			template.checkbox.enable();
		} else {
			template.checkbox.disable();
		}
		template.title.textContent = element.node.title;
		template.title.classList.toggle('hidden-item', element.state === false);
		template.description.textContent = element.node.children ? `${element.shown}/${element.total}` : '';
	}

	disposeElement(_node: ITreeNode<IMenuElement, void>, _index: number, template: IMenuElementTemplate): void {
		template.element = undefined;
	}

	disposeTemplate(template: IMenuElementTemplate): void {
		template.disposables.dispose();
	}
}

/**
 * The Views panel: every menu and menu item of the menu bar (but Help) with a tick, ticked when
 * it shows with the View in use. Ticking or unticking saves the View at once.
 */
export class PollisViewsView extends ViewPane {

	static readonly ID = 'pollis.views.panel';

	private tree: WorkbenchObjectTree<IMenuElement> | undefined;
	private messageHeader: HTMLElement | undefined;
	private headerMessage: HTMLElement | undefined;
	private saveViewAsButton: Button | undefined;
	private menus: readonly IPollisMenuNode[] = [];
	/** The elements of the tree by path, kept so the tree keeps its expanded menus across refreshes. */
	private readonly elements = new Map<string, IMenuElement>();
	private readonly expanded = new Set<string>();
	private lastSize: { height: number; width: number } | undefined;

	constructor(
		options: IViewPaneOptions,
		@IPollisViewsService private readonly viewsService: IPollisViewsService,
		@ICommandService private readonly commandService: ICommandService,
		@INotificationService private readonly notificationService: INotificationService,
		@IKeybindingService keybindingService: IKeybindingService,
		@IContextMenuService contextMenuService: IContextMenuService,
		@IConfigurationService configurationService: IConfigurationService,
		@IContextKeyService contextKeyService: IContextKeyService,
		@IViewDescriptorService viewDescriptorService: IViewDescriptorService,
		@IInstantiationService instantiationService: IInstantiationService,
		@IOpenerService openerService: IOpenerService,
		@IThemeService themeService: IThemeService,
		@IHoverService hoverService: IHoverService,
	) {
		super(options, keybindingService, contextMenuService, configurationService, contextKeyService, viewDescriptorService, instantiationService, openerService, themeService, hoverService);
		this._register(this.viewsService.onDidChange(() => this.refresh(false)));
	}

	protected override renderBody(container: HTMLElement): void {
		super.renderBody(container);
		const root = dom.append(container, dom.$('.pollis-views-panel'));

		this.messageHeader = dom.append(root, dom.$('.pollis-views-header'));
		this.headerMessage = dom.append(this.messageHeader, dom.$('.message'));
		this.saveViewAsButton = this._register(new Button(this.messageHeader, { ...defaultButtonStyles, secondary: true }));
		this.saveViewAsButton.label = localize('pollisViewsPanel.saveAs', "Save View As...");
		this._register(this.saveViewAsButton.onDidClick(() => this.commandService.executeCommand('pollis.views.saveAs')));

		this.tree = this._register(this.instantiationService.createInstance(
			WorkbenchObjectTree<IMenuElement>,
			'PollisViews',
			dom.append(root, dom.$('.pollis-views-tree')),
			new MenuElementDelegate(),
			[new MenuElementRenderer(() => !!this.viewsService.getActiveView().resource, (element, visible) => this.toggle(element, visible))],
			{
				identityProvider: { getId: (element: IMenuElement) => element.path },
				accessibilityProvider: {
					getAriaLabel: (element: IMenuElement) => element.state === false
						? localize('pollisViewsPanel.aria.hidden', "{0}, hidden", element.node.title)
						: localize('pollisViewsPanel.aria.shown', "{0}, shown", element.node.title),
					getWidgetAriaLabel: () => localize('pollisViewsPanel.aria', "Menu Items of the View"),
				},
			},
		));
		this._register(this.tree.onDidChangeCollapseState(e => {
			const element = e.node.element;
			if (element) {
				if (e.node.collapsed) {
					this.expanded.delete(element.path);
				} else {
					this.expanded.add(element.path);
				}
			}
		}));
		// Extensions add menu items as they start, so read the menus again whenever the panel shows
		this._register(this.onDidChangeBodyVisibility(visible => {
			if (visible) {
				this.refresh(true);
			}
		}));
		this.refresh(true);
	}

	/** Renders the active View; `readMenus` reads the menus of the menu bar again first. */
	private refresh(readMenus: boolean): void {
		if (!this.tree || !this.messageHeader || !this.headerMessage || !this.saveViewAsButton) {
			return;
		}
		if (readMenus || !this.menus.length) {
			this.menus = this.viewsService.getMenuTree();
		}
		const view = this.viewsService.getActiveView();
		this.headerMessage.textContent = view.resource
			? localize('pollisViewsPanel.editable', "View \"{0}\": tick an item to show it in the menus, untick it to hide it. Changes apply at once.", view.name)
			: localize('pollisViewsPanel.builtin', "View \"{0}\" is built in, so it cannot be changed. Save it as a View of your own to choose its menu items.", view.name);
		this.saveViewAsButton.element.classList.toggle('hidden', !!view.resource);

		const show = view.show && new Set(view.show);
		const hide = new Set(view.hide);
		const toTreeElements = (nodes: readonly IPollisMenuNode[], parentPath: string, shownByMenu: boolean, hiddenByMenu: boolean): IObjectTreeElement<IMenuElement>[] => nodes.map(node => {
			const path = parentPath ? `${parentPath}/${node.id}` : node.id;
			const hidden = hiddenByMenu || hide.has(node.id);
			const element = this.elements.get(path) ?? { node, path, state: false, shown: 0, total: 0 };
			element.node = node;
			this.elements.set(path, element);
			if (!node.children) {
				element.state = !hidden && (!node.pollis || !show || shownByMenu || show.has(node.id));
				element.shown = element.state ? 1 : 0;
				element.total = 1;
				return { element };
			}
			const children = toTreeElements(node.children, path, shownByMenu || (node.pollis && !!show?.has(node.id)), hidden);
			element.shown = children.reduce((sum, child) => sum + child.element.shown, 0);
			element.total = children.reduce((sum, child) => sum + child.element.total, 0);
			element.state = element.shown === element.total ? true : element.shown === 0 ? false : 'mixed';
			return { element, children, collapsible: true, collapsed: !this.expanded.has(path) };
		});
		this.tree.setChildren(null, toTreeElements(this.menus, '', false, false));
		// The tree keeps the rows of elements it already has, so draw their new ticks
		this.tree.rerender();
		this.layoutTree();
	}

	/** Shows or hides a menu item, or everything in a menu, and saves the View. */
	private toggle(element: IMenuElement, visible: boolean): void {
		const view = this.viewsService.getActiveView();
		if (!view.resource) {
			return;
		}
		// What shows after the change, item by item
		const visibleItems = new Map<string, boolean>();
		const collect = (nodes: readonly IPollisMenuNode[], parentPath: string, inToggled: boolean) => {
			for (const node of nodes) {
				const path = parentPath ? `${parentPath}/${node.id}` : node.id;
				const toggled = inToggled || path === element.path;
				if (node.children) {
					collect(node.children, path, toggled);
				} else {
					visibleItems.set(path, toggled ? visible : this.elements.get(path)?.state === true);
				}
			}
		};
		collect(this.menus, '', false);

		// The shortest lists that give it: a whole menu where all of it shows (or none of it, for hide)
		const show: string[] = [];
		const hide: string[] = [];
		const inTree = new Set<string>();
		let everythingShown = true;
		const count = (node: IPollisMenuNode, path: string): { shown: number; total: number } => {
			if (!node.children) {
				return { shown: visibleItems.get(path) ? 1 : 0, total: 1 };
			}
			let shown = 0;
			let total = 0;
			for (const child of node.children) {
				const result = count(child, `${path}/${child.id}`);
				shown += result.shown;
				total += result.total;
			}
			return { shown, total };
		};
		const derive = (nodes: readonly IPollisMenuNode[], parentPath: string) => {
			for (const node of nodes) {
				const path = parentPath ? `${parentPath}/${node.id}` : node.id;
				inTree.add(node.id);
				const { shown, total } = count(node, path);
				if (node.pollis) {
					everythingShown &&= shown === total;
					if (shown === total && node.children) {
						show.push(node.id);
						node.children.forEach(child => markInTree(child));
						continue;
					}
					if (!node.children) {
						if (shown) {
							show.push(node.id);
						}
						continue;
					}
				} else {
					if (shown === 0) {
						hide.push(node.id);
						node.children?.forEach(child => markInTree(child));
						continue;
					}
					if (!node.children) {
						continue;
					}
				}
				derive(node.children, path);
			}
		};
		const markInTree = (node: IPollisMenuNode) => {
			inTree.add(node.id);
			node.children?.forEach(child => markInTree(child));
		};
		derive(this.menus, '');

		// Ids the menus don't have now (an extension not installed, say) stay as they were
		const keptShow = (view.show ?? []).filter(id => !inTree.has(id));
		const keptHide = (view.hide ?? []).filter(id => !inTree.has(id));
		const newShow = everythingShown && !keptShow.length ? undefined : [...new Set([...show, ...keptShow])];
		this.save(view, newShow, [...new Set([...hide, ...keptHide])]);
	}

	private async save(view: IPollisView, show: readonly string[] | undefined, hide: readonly string[]): Promise<void> {
		try {
			await this.viewsService.updateView(view, show, hide);
		} catch (error) {
			this.notificationService.error(localize('pollisViewsPanel.saveFailed', "Could not save the View \"{0}\": {1}", view.name, String(error)));
			this.refresh(false);
		}
	}

	override focus(): void {
		super.focus();
		this.tree?.domFocus();
	}

	protected override layoutBody(height: number, width: number): void {
		super.layoutBody(height, width);
		this.lastSize = { height, width };
		this.layoutTree();
	}

	private layoutTree(): void {
		if (this.lastSize && this.messageHeader) {
			this.tree?.layout(Math.max(0, this.lastSize.height - this.messageHeader.offsetHeight), this.lastSize.width);
		}
	}
}
