/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { Event } from '../../../../base/common/event.js';
import { createDecorator } from '../../../../platform/instantiation/common/instantiation.js';

/** The command that opens the page where the user chooses a toolbox's panels, given the extension id. */
export const CHOOSE_TOOLBOX_PANELS_COMMAND_ID = 'pollis.toolboxes.choosePanels';

/** The start of the id of a toolbox's own menu, which is not offered as a place for panels. */
export const TOOLBOX_SUBMENU_PREFIX = 'pollisToolbox.';

/** The menu of a panel that is in its toolbox's own menu. */
export const TOOLBOX_MENU = 'toolbox';

/** The menu group that puts a toolbox's menu or panel at the end of a menu. */
export const TOOLBOX_END_GROUP = 'z_toolboxes';

/** A panel of an installed toolbox. */
export interface IToolboxPanelInfo {
	readonly id: string;
	/** The command that opens it. */
	readonly command: string;
	/** Its menu item. */
	readonly title: string;
}

/** A place in the menus: a menu, and the group and order in it that set the position. */
export interface IToolboxPlace {
	/** A menu id, or {@link TOOLBOX_MENU} for a panel in its toolbox's own menu. */
	readonly menu: string;
	readonly group: string;
	readonly order: number;
}

/** Where a toolbox's menu and panels go in the menus. */
export interface IToolboxPlacement {
	/** The place of the toolbox's own menu, `undefined` for no toolbox menu. */
	readonly menu: IToolboxPlace | undefined;
	/** The place of each panel, by panel id. A panel left out is not in the menus. */
	readonly panels: Readonly<Record<string, IToolboxPlace>>;
}

/** A toolbox of an installed extension. */
export interface IToolboxInfo {
	/** The extension id, `<publisher>.<name>`, lower case. */
	readonly extensionId: string;
	readonly id: string;
	readonly title: string;
	readonly panels: readonly IToolboxPanelInfo[];
	/** The places the author suggests, with every panel in. */
	readonly suggested: IToolboxPlacement;
	/** The places the user published, `undefined` before the user publishes the toolbox. */
	readonly published: IToolboxPlacement | undefined;
}

export const IToolboxPanelsService = createDecorator<IToolboxPanelsService>('toolboxPanelsService');

/**
 * The toolboxes of the installed extensions. Installing a toolbox does not change the menus: the
 * user publishes the panels they choose, in the toolbox's own menu or straight into another menu,
 * and the toolbox's menu where the author suggests or in another menu.
 */
export interface IToolboxPanelsService {
	readonly _serviceBrand: undefined;

	/** Fires when the installed toolboxes or the published panels change. */
	readonly onDidChange: Event<void>;

	/** The toolboxes of an extension, or of every installed extension. */
	getToolboxes(extensionId?: string): readonly IToolboxInfo[];

	/** Puts a toolbox's menu and panels in the given places; its other panels leave the menus. */
	publish(extensionId: string, toolboxId: string, placement: IToolboxPlacement): void;
}
