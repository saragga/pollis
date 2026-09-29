/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { localize } from '../../../../nls.js';
import { $, addDisposableListener, EventHelper, EventType, getWindow, isHTMLElement } from '../../../../base/browser/dom.js';
import { StandardMouseEvent } from '../../../../base/browser/mouseEvent.js';
import { EventType as TouchEventType, GestureEvent } from '../../../../base/browser/touch.js';
import { ActionBar, ActionsOrientation } from '../../../../base/browser/ui/actionbar/actionbar.js';
import { IAction, Separator, toAction } from '../../../../base/common/actions.js';
import { Emitter } from '../../../../base/common/event.js';
import { Disposable, DisposableMap, DisposableStore } from '../../../../base/common/lifecycle.js';
import { ThemeIcon } from '../../../../base/common/themables.js';
import { URI } from '../../../../base/common/uri.js';
import { IContextMenuService } from '../../../../platform/contextview/browser/contextView.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { IStorageService, StorageScope, StorageTarget } from '../../../../platform/storage/common/storage.js';
import { IColorTheme } from '../../../../platform/theme/common/themeService.js';
import { IViewDescriptorService, ViewContainer, ViewContainerLocation } from '../../../common/views.js';
import { IWorkbenchLayoutService, Parts } from '../../../services/layout/browser/layoutService.js';
import { IViewsService } from '../../../services/views/common/viewsService.js';
import { CompositeBarAction, CompositeBarActionViewItem, IActivityHoverOptions, ICompositeBarActionItem, ICompositeBarColors } from '../compositeBarActions.js';

/**
 * Opens a secondary side bar container from the activity bar, or hides the secondary side bar
 * when that container is already showing.
 */
class AuxiliaryBarShortcutAction extends CompositeBarAction {

	constructor(
		item: ICompositeBarActionItem,
		@IViewsService private readonly viewsService: IViewsService,
		@IWorkbenchLayoutService private readonly layoutService: IWorkbenchLayoutService,
	) {
		super(item);
	}

	override async run(): Promise<void> {
		if (this.viewsService.isViewContainerVisible(this.id)) {
			this.layoutService.setPartHidden(true, Parts.AUXILIARYBAR_PART);
		} else {
			await this.viewsService.openViewContainer(this.id, true);
		}
	}
}

/**
 * Shows the checked state of a shortcut with the activity bar's active indicator and colours.
 */
class AuxiliaryBarShortcutViewItem extends CompositeBarActionViewItem {

	override render(container: HTMLElement): void {
		super.render(container);
		this.updateChecked();
	}

	protected override updateChecked(): void {
		this.container.classList.toggle('checked', !!this.action.checked);
		this.container.setAttribute('aria-pressed', String(!!this.action.checked));
		this.updateStyles();
	}
}

/**
 * Activity bar icons, below the view containers, for the secondary side bar containers other
 * than its default one (Chat): each one shows or hides its container in the secondary side bar.
 * Like the view container icons, each one can be hidden from the activity bar context menu.
 */
export class AuxiliaryBarShortcuts extends Disposable {

	/** Height of the separator above the shortcuts, including its margins (see activityaction.css). */
	private static readonly SEPARATOR_HEIGHT = 9;

	private static readonly HIDDEN_SHORTCUTS_KEY = 'workbench.activity.hiddenAuxiliaryBarShortcuts';

	readonly element: HTMLElement;

	private readonly actionBar: ActionBar;
	private readonly actions = this._register(new DisposableStore());
	private shortcutActions: AuxiliaryBarShortcutAction[] = [];
	private readonly modelListeners = this._register(new DisposableMap<string>());

	private readonly _onDidChangeSize = this._register(new Emitter<void>());
	readonly onDidChangeSize = this._onDidChangeSize.event;

	constructor(
		private readonly toActionItem: (id: string, name: string, icon: URI | ThemeIcon | undefined, keybindingId: string | undefined) => ICompositeBarActionItem,
		private readonly colors: (theme: IColorTheme) => ICompositeBarColors,
		private readonly hoverOptions: IActivityHoverOptions,
		private readonly contextMenuActionsProvider: () => IAction[],
		@IViewDescriptorService private readonly viewDescriptorService: IViewDescriptorService,
		@IViewsService private readonly viewsService: IViewsService,
		@IInstantiationService private readonly instantiationService: IInstantiationService,
		@IStorageService private readonly storageService: IStorageService,
		@IContextMenuService private readonly contextMenuService: IContextMenuService,
	) {
		super();

		this.element = $('.auxiliarybar-shortcuts');
		this.actionBar = this._register(new ActionBar(this.element, {
			actionViewItemProvider: (action, options) => this.instantiationService.createInstance(AuxiliaryBarShortcutViewItem, action as CompositeBarAction, { ...options, icon: true, colors: this.colors, hoverOptions: this.hoverOptions }, () => false),
			orientation: ActionsOrientation.VERTICAL,
			ariaLabel: localize('auxiliaryBarShortcuts', "Secondary Side Bar Views"),
			preventLoopNavigation: true
		}));

		this._register(this.viewDescriptorService.onDidChangeViewContainers(() => this.update()));
		this._register(this.viewDescriptorService.onDidChangeContainerLocation(() => this.update()));
		this._register(this.viewsService.onDidChangeViewContainerVisibility(({ location }) => {
			if (location === ViewContainerLocation.AuxiliaryBar) {
				this.updateChecked();
			}
		}));
		this._register(this.storageService.onDidChangeValue(StorageScope.PROFILE, AuxiliaryBarShortcuts.HIDDEN_SHORTCUTS_KEY, this._store)(() => this.update()));
		this._register(addDisposableListener(this.element, EventType.CONTEXT_MENU, e => this.showContextMenu(e)));
		this._register(addDisposableListener(this.element, TouchEventType.Contextmenu, e => this.showContextMenu(e)));
		this.update();
	}

	/** One entry per shortcut, checked while it shows, for the activity bar context menu. */
	getContextMenuActions(): IAction[] {
		const hidden = this.getHiddenIds();
		return this.getContainers().filter(container => this.hasViews(container)).map(container => {
			const title = this.viewDescriptorService.getViewContainerModel(container).title;
			return toAction({ id: container.id, label: title, checked: !hidden.includes(container.id), run: () => this.setHidden(container.id, !hidden.includes(container.id)) });
		});
	}

	private showContextMenu(e: MouseEvent | GestureEvent): void {
		EventHelper.stop(e, true);

		const actions: IAction[] = [];
		const target = e.target;
		const action = isHTMLElement(target) ? this.actionBar.getAction(target) : undefined;
		if (action) {
			actions.push(toAction({ id: 'hideAuxiliaryBarShortcut', label: localize('hide', "Hide '{0}'", action.label), run: () => this.setHidden(action.id, true) }), new Separator());
		}
		actions.push(...this.contextMenuActionsProvider());

		const event = new StandardMouseEvent(getWindow(this.element), e);
		this.contextMenuService.showContextMenu({
			getAnchor: () => event,
			getActions: () => actions
		});
	}

	private getHiddenIds(): string[] {
		try {
			const ids = JSON.parse(this.storageService.get(AuxiliaryBarShortcuts.HIDDEN_SHORTCUTS_KEY, StorageScope.PROFILE, '[]'));
			return Array.isArray(ids) ? ids.filter((id): id is string => typeof id === 'string') : [];
		} catch {
			return [];
		}
	}

	private setHidden(id: string, hidden: boolean): void {
		const ids = this.getHiddenIds().filter(hiddenId => hiddenId !== id);
		if (hidden) {
			ids.push(id);
		}
		this.storageService.store(AuxiliaryBarShortcuts.HIDDEN_SHORTCUTS_KEY, JSON.stringify(ids), StorageScope.PROFILE, StorageTarget.USER);
	}

	private hasViews(container: ViewContainer): boolean {
		return !container.hideIfEmpty || this.viewDescriptorService.getViewContainerModel(container).activeViewDescriptors.length > 0;
	}

	create(parent: HTMLElement): void {
		parent.appendChild(this.element);
	}

	size(): number {
		return this.actionBar.viewItems.length;
	}

	/** The height of the shortcuts and, when there are any, the separator above them. */
	height(actionHeight: number): number {
		return this.size() ? this.size() * actionHeight + AuxiliaryBarShortcuts.SEPARATOR_HEIGHT : 0;
	}

	private getContainers(): ViewContainer[] {
		const defaultContainer = this.viewDescriptorService.getDefaultViewContainer(ViewContainerLocation.AuxiliaryBar);
		return this.viewDescriptorService.getViewContainersByLocation(ViewContainerLocation.AuxiliaryBar)
			.filter(container => container !== defaultContainer)
			.sort((a, b) => (a.order ?? Number.MAX_VALUE) - (b.order ?? Number.MAX_VALUE));
	}

	private update(): void {
		const containers = this.getContainers();

		// Track the views and title/icon of each container, as its icon shows only while it has views
		for (const id of [...this.modelListeners.keys()]) {
			if (!containers.some(container => container.id === id)) {
				this.modelListeners.deleteAndDispose(id);
			}
		}
		for (const container of containers) {
			if (!this.modelListeners.has(container.id)) {
				const model = this.viewDescriptorService.getViewContainerModel(container);
				const listeners = new DisposableStore();
				listeners.add(model.onDidChangeActiveViewDescriptors(() => this.update()));
				listeners.add(model.onDidChangeContainerInfo(() => this.update()));
				this.modelListeners.set(container.id, listeners);
			}
		}

		const previousSize = this.size();
		this.actionBar.clear();
		this.actions.clear();
		this.shortcutActions = [];
		const hidden = this.getHiddenIds();
		for (const container of containers) {
			if (!this.hasViews(container) || hidden.includes(container.id)) {
				continue;
			}
			const model = this.viewDescriptorService.getViewContainerModel(container);
			const action = this.actions.add(this.instantiationService.createInstance(AuxiliaryBarShortcutAction, this.toActionItem(container.id, model.title, model.icon, model.keybindingId)));
			this.shortcutActions.push(action);
			this.actionBar.push(action, { label: true, icon: true });
		}
		this.updateChecked();
		this.element.classList.toggle('empty', this.size() === 0);

		if (this.size() !== previousSize) {
			this._onDidChangeSize.fire();
		}
	}

	private updateChecked(): void {
		for (const action of this.shortcutActions) {
			if (this.viewsService.isViewContainerVisible(action.id)) {
				action.activate();
			} else {
				action.deactivate();
			}
		}
	}
}
