/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { CancellationToken } from '../../../../base/common/cancellation.js';
import { IRequestContext, IRequestOptions } from '../../../../base/parts/request/common/request.js';
import { ProxyChannel } from '../../../../base/parts/ipc/common/ipc.js';
import { ALERTS_MAILBOX_CHANNEL, IAlertEmail, IAlertsMailbox, IAlertsMailboxPosition, IAlertsMailboxService } from '../../../../platform/alertsMailbox/common/alertsMailbox.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { IFileService } from '../../../../platform/files/common/files.js';
import { InstantiationType, registerSingleton } from '../../../../platform/instantiation/common/extensions.js';
import { IMainProcessService } from '../../../../platform/ipc/common/mainProcessService.js';
import { IRequestService } from '../../../../platform/request/common/request.js';
import { ISecretStorageService } from '../../../../platform/secrets/common/secrets.js';
import { RequestChannelClient } from '../../../../platform/request/common/requestIpc.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
import { IPathService } from '../../../services/path/common/pathService.js';
import { IRssFeedsService, RssFeedsService } from '../browser/rssFeedsService.js';

/**
 * Pollis: reads the RSS feeds, and talks to Zotero, from the main process, which CORS does not restrict: most feeds
 * (Discourse, arXiv) and Zotero's connector do not allow the window to read them; it also reads the alerts mailbox.
 */
class NativeRssFeedsService extends RssFeedsService {

	private readonly mainRequestService: IRequestService;
	private readonly alertsMailboxService: IAlertsMailboxService;

	constructor(
		@IRequestService requestService: IRequestService,
		@IStorageService storageService: IStorageService,
		@IConfigurationService configurationService: IConfigurationService,
		@IFileService fileService: IFileService,
		@IPathService pathService: IPathService,
		@ISecretStorageService secretStorageService: ISecretStorageService,
		@IMainProcessService mainProcessService: IMainProcessService,
	) {
		super(requestService, storageService, configurationService, fileService, pathService, secretStorageService);
		this.mainRequestService = new RequestChannelClient(mainProcessService.getChannel('request'));
		this.alertsMailboxService = ProxyChannel.toService<IAlertsMailboxService>(mainProcessService.getChannel(ALERTS_MAILBOX_CHANNEL));
	}

	protected override readAlertsMailbox(mailbox: IAlertsMailbox, password: string, position: IAlertsMailboxPosition | undefined): Promise<{ readonly position: IAlertsMailboxPosition; readonly emails: readonly IAlertEmail[] }> {
		return this.alertsMailboxService.read(mailbox, password, position);
	}

	protected override request(options: IRequestOptions): Promise<IRequestContext> {
		return this.mainRequestService.request(options, CancellationToken.None);
	}
}

registerSingleton(IRssFeedsService, NativeRssFeedsService, InstantiationType.Delayed);
