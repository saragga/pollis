/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

// POLLIS: a webview's own menus (the menus of the PDF Viewer) shown as the workbench's menus: native where Pollis' menus
// are native (macOS), with check marks and greyed-out items.

import { AnchorAlignment } from '../../../../base/browser/ui/contextview/contextview.js';
import { IAction, Separator, toAction } from '../../../../base/common/actions.js';
import { hasKey } from '../../../../base/common/types.js';
import { CommandsRegistry } from '../../../../platform/commands/common/commands.js';
import { IContextMenuService } from '../../../../platform/contextview/browser/contextView.js';
import { OverlayWebview } from './overlayWebview.js';
import { IWebviewService } from './webview.js';

/** An item of the menu: what the webview gets back when it is chosen, and how it shows. */
interface IWebviewMenuItem {
	readonly id: string;
	readonly label: string;
	readonly checked?: boolean;
	readonly enabled?: boolean;
}

/** A line between the groups of the menu. */
interface IWebviewMenuSeparator {
	readonly separator: true;
}

/**
 * The menu a webview asks for: its items, and the button it opens from, in the pixels of the webview; the menu opens
 * below the button.
 */
interface IWebviewMenu {
	readonly items: readonly (IWebviewMenuItem | IWebviewMenuSeparator)[];
	readonly anchor: { readonly x: number; readonly y: number; readonly width: number; readonly height: number };
}

/**
 * Shows the menu over the active webview and resolves to the id of the chosen item, or to undefined when the menu is
 * closed without a choice.
 */
CommandsRegistry.registerCommand('_pollis.webview.showMenu', (accessor, menu: IWebviewMenu): Promise<string | undefined> => {
	const contextMenuService = accessor.get(IContextMenuService);
	const webview = accessor.get(IWebviewService).activeWebview;
	const container = webview instanceof OverlayWebview ? webview.container : undefined;
	if (!container || !Array.isArray(menu?.items)) {
		return Promise.resolve(undefined);
	}
	const frame = container.getBoundingClientRect();
	return new Promise<string | undefined>(resolve => {
		const actions: IAction[] = menu.items.map(item => hasKey(item, { separator: true })
			? new Separator()
			: toAction({ id: item.id, label: item.label, checked: item.checked, enabled: item.enabled ?? true, run: () => resolve(item.id) }));
		contextMenuService.showContextMenu({
			// The bottom left of the button: where a native menu starts, and the right edge for the custom menu
			getAnchor: () => ({ x: frame.x + menu.anchor.x, y: frame.y + menu.anchor.y + menu.anchor.height, width: menu.anchor.width, height: 0 }),
			anchorAlignment: AnchorAlignment.RIGHT,
			getActions: () => actions,
			// A choice runs right after the menu hides; without one, nothing is chosen
			onHide: () => setTimeout(() => resolve(undefined)),
		});
	});
});
