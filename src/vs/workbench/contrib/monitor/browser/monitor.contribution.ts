/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { localize } from '../../../../nls.js';
import { MenuId, MenuRegistry } from '../../../../platform/actions/common/actions.js';
import { RSS_FEEDS_COMMAND_ID } from './rssFeedsPage.js';
import './rssFeedsService.js';

// Explore > Monitor: what Pollis watches for the user, after Access Files and Databases. Alerts will join RSS Feeds.
const MonitorSubmenuId = new MenuId('menubarMonitorSubmenu');

MenuRegistry.appendMenuItem(MenuId.MenubarExploreMenu, {
	group: '1_explore',
	submenu: MonitorSubmenuId,
	title: localize('monitor.submenu', "Monitor"),
	order: 4,
});

MenuRegistry.appendMenuItem(MonitorSubmenuId, {
	group: '1_monitor',
	command: { id: RSS_FEEDS_COMMAND_ID, title: localize('monitor.rssFeeds', "RSS Feeds") },
	order: 1,
});
