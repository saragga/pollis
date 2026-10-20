/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { $, addDisposableListener, append, EventHelper, EventType } from '../../../../base/browser/dom.js';
import { StandardKeyboardEvent } from '../../../../base/browser/keyboardEvent.js';
import { IHoverDelegate } from '../../../../base/browser/ui/hover/hoverDelegate.js';
import { renderIcon } from '../../../../base/browser/ui/iconLabel/iconLabels.js';
import { Codicon } from '../../../../base/common/codicons.js';
import { KeyCode } from '../../../../base/common/keyCodes.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { ThemeIcon } from '../../../../base/common/themables.js';
import { localize } from '../../../../nls.js';
import { getFlatContextMenuActions } from '../../../../platform/actions/browser/menuEntryActionViewItem.js';
import { IMenuService, MenuId, MenuRegistry } from '../../../../platform/actions/common/actions.js';
import { IContextKeyService } from '../../../../platform/contextkey/common/contextkey.js';
import { IsMacContext } from '../../../../platform/contextkey/common/contextkeys.js';
import { IContextMenuService } from '../../../../platform/contextview/browser/contextView.js';
import { IHoverService } from '../../../../platform/hover/browser/hover.js';

/**
 * Pollis: the New and Open buttons at the left of the title bar, after the macOS window buttons. They replace the
 * Start section of the Welcome page and, unlike Positron, share the title bar instead of adding a second strip.
 */
const TitleBarNewMenu = new MenuId('PollisTitleBarNew');
const TitleBarOpenMenu = new MenuId('PollisTitleBarOpen');

MenuRegistry.appendMenuItems([
	{ id: TitleBarNewMenu, item: { command: { id: 'workbench.action.files.newUntitledFile', title: localize('pollis.newTextFile', "New Text File") }, group: '1_new', order: 1 } },
	{ id: TitleBarNewMenu, item: { command: { id: 'welcome.showNewFileEntries', title: localize('pollis.newFile', "New File...") }, group: '1_new', order: 2 } },
	{ id: TitleBarNewMenu, item: { command: { id: 'workbench.action.newWindow', title: localize('pollis.newWindow', "New Window") }, group: '2_window', order: 1 } },
	{ id: TitleBarOpenMenu, item: { command: { id: 'workbench.action.files.openFileFolder', title: localize('pollis.open', "Open...") }, group: '1_open', order: 1, when: IsMacContext } },
	{ id: TitleBarOpenMenu, item: { command: { id: 'workbench.action.files.openFile', title: localize('pollis.openFile', "Open File...") }, group: '1_open', order: 2, when: IsMacContext.negate() } },
	{ id: TitleBarOpenMenu, item: { command: { id: 'workbench.action.files.openFolder', title: localize('pollis.openFolder', "Open Folder...") }, group: '1_open', order: 3 } },
	{ id: TitleBarOpenMenu, item: { command: { id: 'workbench.action.openRecent', title: localize('pollis.openRecent', "Open Recent...") }, group: '2_recent', order: 1 } },
]);

/**
 * Pollis: renders the New and Open buttons; each opens its menu below it.
 */
export class PollisTitleBarStart extends Disposable {

	constructor(
		parent: HTMLElement,
		hoverDelegate: IHoverDelegate,
		@IMenuService private readonly menuService: IMenuService,
		@IContextKeyService private readonly contextKeyService: IContextKeyService,
		@IContextMenuService private readonly contextMenuService: IContextMenuService,
		@IHoverService hoverService: IHoverService,
	) {
		super();

		const container = append(parent, $('div.pollis-titlebar-start'));
		this.createButton(container, hoverDelegate, hoverService, Codicon.newFile, localize('pollis.new', "New"), localize('pollis.newTooltip', "New File or Window"), TitleBarNewMenu);
		this.createButton(container, hoverDelegate, hoverService, Codicon.folderOpened, localize('pollis.openButton', "Open"), localize('pollis.openTooltip', "Open a File or Folder"), TitleBarOpenMenu);
	}

	private createButton(container: HTMLElement, hoverDelegate: IHoverDelegate, hoverService: IHoverService, icon: ThemeIcon, label: string, tooltip: string, menuId: MenuId): void {
		const button = append(container, $('a.pollis-titlebar-start-button', { role: 'button', tabIndex: 0, 'aria-haspopup': 'menu', 'aria-label': tooltip }));
		append(button, renderIcon(icon));
		append(button, $('span.label', {}, label));
		append(button, renderIcon(Codicon.chevronDown)).classList.add('chevron');
		this._register(hoverService.setupManagedHover(hoverDelegate, button, tooltip));

		const show = () => {
			const actions = getFlatContextMenuActions(this.menuService.getMenuActions(menuId, this.contextKeyService));
			this.contextMenuService.showContextMenu({
				getAnchor: () => button,
				getActions: () => actions,
			});
		};
		this._register(addDisposableListener(button, EventType.CLICK, e => {
			EventHelper.stop(e, true);
			show();
		}));
		this._register(addDisposableListener(button, EventType.KEY_DOWN, e => {
			const event = new StandardKeyboardEvent(e);
			if (event.equals(KeyCode.Enter) || event.equals(KeyCode.Space)) {
				EventHelper.stop(e, true);
				show();
			}
		}));
	}
}
