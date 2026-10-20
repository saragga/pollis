/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { localize } from '../../../../nls.js';
import { MenuId, MenuRegistry } from '../../../../platform/actions/common/actions.js';
import { ICommandService } from '../../../../platform/commands/common/commands.js';
import { INotificationService, Severity } from '../../../../platform/notification/common/notification.js';
import { IStorageService, StorageScope } from '../../../../platform/storage/common/storage.js';
import { IWorkbenchContribution, registerWorkbenchContribution2, WorkbenchPhase } from '../../../common/contributions.js';
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

/** At the first launch of a fresh install, not after an update: Pollis follows only the Julia news, and the catalogue offers the rest. */
class RssCatalogueNotice implements IWorkbenchContribution {

	static readonly ID = 'workbench.contrib.rssCatalogueNotice';

	constructor(
		@INotificationService notificationService: INotificationService,
		@IStorageService storageService: IStorageService,
		@ICommandService commandService: ICommandService,
	) {
		if (!storageService.isNew(StorageScope.APPLICATION)) {
			return;
		}
		notificationService.prompt(Severity.Info, localize('rss.catalogueNotice', "Pollis follows the Julia news. Its catalogue has about 370 feed sources in 34 categories: choose yours in RSS Feeds."), [{
			label: localize('rss.openRssFeeds', "Open RSS Feeds"),
			run: () => commandService.executeCommand(RSS_FEEDS_COMMAND_ID),
		}]);
	}
}

registerWorkbenchContribution2(RssCatalogueNotice.ID, RssCatalogueNotice, WorkbenchPhase.Eventually);
