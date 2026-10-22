/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { localize } from '../../../../nls.js';
import { ICommandService } from '../../../../platform/commands/common/commands.js';
import { INotificationService, Severity } from '../../../../platform/notification/common/notification.js';
import { IStorageService, StorageScope } from '../../../../platform/storage/common/storage.js';
import { IWorkbenchContribution, registerWorkbenchContribution2, WorkbenchPhase } from '../../../common/contributions.js';
import { Disposable, MutableDisposable } from '../../../../base/common/lifecycle.js';
import { IStatusbarEntryAccessor, IStatusbarService, StatusbarAlignment } from '../../../services/statusbar/browser/statusbar.js';
import { RSS_FEEDS_COMMAND_ID } from './rssFeedsPage.js';
import './addFeedPage.js';
import './rssFeedsService.js';
import { SHOW_FIRED_ALERTS_COMMAND_ID } from './alertsPage.js';
import { IAlertsService } from './alertsService.js';
import { IEventStudiesService } from './eventStudiesService.js';
import './eventStudiesPage.js';
import './mediaCoveragePage.js';
import './mediaCoverageService.js';

/** A bell in the status bar with the number of fired alerts not read yet, shown while there are any; it lists them. */
class AlertsStatusBar extends Disposable implements IWorkbenchContribution {

	static readonly ID = 'workbench.contrib.pollisAlertsStatusBar';

	private readonly entry = this._register(new MutableDisposable<IStatusbarEntryAccessor>());

	constructor(
		@IAlertsService private readonly alertsService: IAlertsService,
		@IStatusbarService private readonly statusbarService: IStatusbarService,
	) {
		super();
		this._register(this.alertsService.onDidChange(() => this.update()));
		this.update();
	}

	private update(): void {
		const unread = this.alertsService.getFired().filter(fired => !this.alertsService.isRead(fired.id)).length;
		if (!unread) {
			this.entry.clear();
			return;
		}
		const tooltip = unread === 1 ? localize('alerts.unreadOne', "1 alert fired, not read yet") : localize('alerts.unreadMany', "{0} alerts fired, not read yet", unread);
		const properties = {
			name: localize('alerts.statusName', "Pollis Alerts"),
			text: `$(bell-dot) ${unread}`,
			ariaLabel: tooltip,
			tooltip,
			command: SHOW_FIRED_ALERTS_COMMAND_ID,
		};
		if (this.entry.value) {
			this.entry.value.update(properties);
		} else {
			this.entry.value = this.statusbarService.addEntry(properties, AlertsStatusBar.ID, StatusbarAlignment.RIGHT, -Number.MAX_VALUE + 1);
		}
	}
}

registerWorkbenchContribution2(AlertsStatusBar.ID, AlertsStatusBar, WorkbenchPhase.AfterRestored);

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

/** Starts the event studies, which record the filings their alerts fire and capture the prices around them. */
class EventStudiesStarter implements IWorkbenchContribution {

	static readonly ID = 'workbench.contrib.pollisEventStudies';

	constructor(@IEventStudiesService _eventStudiesService: IEventStudiesService) { }
}

registerWorkbenchContribution2(EventStudiesStarter.ID, EventStudiesStarter, WorkbenchPhase.Eventually);
