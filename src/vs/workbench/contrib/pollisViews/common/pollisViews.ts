/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { Event } from '../../../../base/common/event.js';
import { URI } from '../../../../base/common/uri.js';
import { createDecorator } from '../../../../platform/instantiation/common/instantiation.js';

/** The setting that holds the name of the active View. */
export const POLLIS_VIEW_SETTING = 'pollis.view';

/** The View that shows everything. */
export const MAX_VIEW_NAME = 'Max';

/**
 * A Pollis View: a named set of the menu bar items shown. Ids are command ids (for a menu item)
 * or menu ids (for a submenu).
 */
export interface IPollisView {
	readonly name: string;
	/** When set, only these items (and everything below a listed submenu) show in the Pollis menus. */
	readonly show?: readonly string[];
	/** Items hidden anywhere in the menu bar. */
	readonly hide?: readonly string[];
	/** The file the View was read from, `undefined` for a built-in View. */
	readonly resource?: URI;
}

/** An item of the menu bar, as the Views panel shows it. */
export interface IPollisMenuNode {
	/** The command id of a menu item, the menu id of a submenu. */
	readonly id: string;
	readonly title: string;
	/** Whether the node is inside one of the Pollis menus, which a View trims with its `show` list. */
	readonly pollis: boolean;
	/** The items of a submenu, `undefined` for a menu item. */
	readonly children?: readonly IPollisMenuNode[];
}

export const IPollisViewsService = createDecorator<IPollisViewsService>('pollisViewsService');

export interface IPollisViewsService {
	readonly _serviceBrand: undefined;

	/** Fires when the Views or the active View change. */
	readonly onDidChange: Event<void>;

	/** The folder of the user's Views, ~/.pollis/views. */
	readonly folder: URI;

	/** The built-in Views first, then the user's Views by name. */
	getViews(): readonly IPollisView[];

	/** The View in use. */
	getActiveView(): IPollisView;

	/** Makes a View the active one (stored in the user settings). */
	setActiveView(name: string): Promise<void>;

	/**
	 * Writes a new View that starts as a copy of `base`, with every item of the Pollis menus on
	 * its own line (commented out when hidden), and returns its file.
	 */
	createView(name: string, base: IPollisView): Promise<URI>;

	/**
	 * Rewrites one of the user's Views with every item of the Pollis menus on its own line
	 * (commented out when hidden), so any item can be shown or hidden, and returns its file.
	 */
	editView(view: IPollisView): Promise<URI>;

	/**
	 * Saves new `show` and `hide` lists for one of the user's Views, in the form of
	 * {@link editView}.
	 */
	updateView(view: IPollisView, show: readonly string[] | undefined, hide: readonly string[]): Promise<void>;

	/** The menus of the menu bar, in menu bar order, with every item below them. */
	getMenuTree(): readonly IPollisMenuNode[];

	/**
	 * Moves one of the user's Views to the trash (deletes it when there is no trash). Deleting the
	 * View in use switches to Max.
	 */
	deleteView(view: IPollisView): Promise<void>;
}
