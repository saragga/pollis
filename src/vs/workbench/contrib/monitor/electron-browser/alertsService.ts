/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { CancellationToken } from '../../../../base/common/cancellation.js';
import { IRequestContext, IRequestOptions } from '../../../../base/parts/request/common/request.js';
import { IFileService } from '../../../../platform/files/common/files.js';
import { InstantiationType, registerSingleton } from '../../../../platform/instantiation/common/extensions.js';
import { IMainProcessService } from '../../../../platform/ipc/common/mainProcessService.js';
import { INotificationService } from '../../../../platform/notification/common/notification.js';
import { IRequestService } from '../../../../platform/request/common/request.js';
import { RequestChannelClient } from '../../../../platform/request/common/requestIpc.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
import { IPathService } from '../../../services/path/common/pathService.js';
import { AlertsService, IAlertsService } from '../browser/alertsService.js';

/** Pollis: looks up the alerts' quotes from the main process, which CORS does not restrict and which may name its User-Agent. */
class NativeAlertsService extends AlertsService {

	private readonly mainRequestService: IRequestService;

	constructor(
		@IRequestService requestService: IRequestService,
		@IStorageService storageService: IStorageService,
		@IFileService fileService: IFileService,
		@IPathService pathService: IPathService,
		@INotificationService notificationService: INotificationService,
		@IMainProcessService mainProcessService: IMainProcessService,
	) {
		super(requestService, storageService, fileService, pathService, notificationService);
		this.mainRequestService = new RequestChannelClient(mainProcessService.getChannel('request'));
	}

	protected override request(options: IRequestOptions): Promise<IRequestContext> {
		return this.mainRequestService.request(options, CancellationToken.None);
	}
}

registerSingleton(IAlertsService, NativeAlertsService, InstantiationType.Delayed);
