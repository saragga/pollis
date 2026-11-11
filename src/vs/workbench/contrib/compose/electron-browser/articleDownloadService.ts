/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { CancellationToken } from '../../../../base/common/cancellation.js';
import { IRequestContext, IRequestOptions } from '../../../../base/parts/request/common/request.js';
import { InstantiationType, registerSingleton } from '../../../../platform/instantiation/common/extensions.js';
import { IMainProcessService } from '../../../../platform/ipc/common/mainProcessService.js';
import { RequestChannelClient } from '../../../../platform/request/common/requestIpc.js';
import { IArticleDownloadService } from '../common/articleDownload.js';

/** The downloads of Article and Data, made by the request service of the main process. */
class ArticleDownloadService implements IArticleDownloadService {

	declare readonly _serviceBrand: undefined;

	private readonly mainRequestService: RequestChannelClient;

	constructor(
		@IMainProcessService mainProcessService: IMainProcessService,
	) {
		this.mainRequestService = new RequestChannelClient(mainProcessService.getChannel('request'));
	}

	request(options: IRequestOptions, token: CancellationToken): Promise<IRequestContext> {
		return this.mainRequestService.request(options, token);
	}
}

registerSingleton(IArticleDownloadService, ArticleDownloadService, InstantiationType.Delayed);
