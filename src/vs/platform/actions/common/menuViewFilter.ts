/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { Emitter, Event } from '../../../base/common/event.js';
import { MenuId } from './actions.js';

/**
 * The part of the menu bar a menu belongs to: `pollis` for the Explore, Toolboxes, Model,
 * Simulate and Optimise menus (and everything below them), `menubar` for the other menu bar
 * menus, `none` for every other menu (context menus, toolbars, ...) and for the Help menu (with
 * the licenses and notices), which are never filtered.
 */
export type MenuViewScope = 'pollis' | 'menubar' | 'none';

/**
 * A Pollis View, as the menu service applies it. Ids are command ids (for a menu item) or
 * menu ids (for a submenu).
 */
export interface IMenuViewFilter {
	/** When set, only these items (and everything below a listed submenu) show in the Pollis menus. */
	readonly show?: ReadonlySet<string>;
	/** Items hidden anywhere in the menu bar. */
	readonly hide: ReadonlySet<string>;
}

const pollisMenus: ReadonlySet<string> = new Set([
	MenuId.MenubarExploreMenu.id,
	MenuId.MenubarToolboxesMenu.id,
	MenuId.MenubarModelMenu.id,
	MenuId.MenubarSimulateMenu.id,
	MenuId.MenubarOptimiseMenu.id,
]);

/**
 * Holds the active Pollis View. The menu service asks it which menu bar items to show and
 * rebuilds every menu when it changes.
 */
export const MenuViewFilter = new class {

	private _filter: IMenuViewFilter | undefined;

	private readonly _onDidChange = new Emitter<void>();
	readonly onDidChange: Event<void> = this._onDidChange.event;

	/**
	 * Sets the active View; `undefined` shows everything.
	 */
	set(filter: IMenuViewFilter | undefined): void {
		this._filter = filter;
		this._onDidChange.fire();
	}

	/**
	 * The scope of a menu, given the scope of the menu it was opened from (if any).
	 */
	scopeOf(menu: MenuId, parentScope: MenuViewScope | undefined): MenuViewScope {
		if (menu.id === MenuId.MenubarHelpMenu.id) {
			return 'none';
		}
		if (pollisMenus.has(menu.id)) {
			return 'pollis';
		}
		if (parentScope) {
			return parentScope;
		}
		return menu.id === MenuId.MenubarMainMenu.id || menu.id.startsWith('Menubar') ? 'menubar' : 'none';
	}

	/**
	 * Whether an item is hidden by the `hide` list of the active View.
	 */
	isHidden(id: string, scope: MenuViewScope): boolean {
		return !!this._filter && scope !== 'none' && id !== MenuId.MenubarHelpMenu.id && this._filter.hide.has(id);
	}

	/**
	 * Whether the `show` list of the active View lets an item show in a menu of the given scope.
	 * For a submenu, pass the scope of the submenu itself: the answer then says whether everything
	 * below it shows; when it doesn't, the submenu still shows if something below it does.
	 */
	isShown(id: string, scope: MenuViewScope, shownByAncestor: boolean): boolean {
		const show = this._filter?.show;
		return !show || scope !== 'pollis' || shownByAncestor || show.has(id);
	}
};
