/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { CancellationToken } from '../../../../base/common/cancellation.js';
import { IRequestContext, IRequestOptions } from '../../../../base/parts/request/common/request.js';
import { createDecorator } from '../../../../platform/instantiation/common/instantiation.js';

// The downloads of Article and Data (../browser/articleAndData.ts): an article's PDF, a saved copy of it, the input
// tables at their links and the PollisDatasets catalogue, from the main process, where no server's CORS rules apply.

export const IArticleDownloadService = createDecorator<IArticleDownloadService>('articleDownloadService');

/** Web requests made outside the window, so that a server that allows no other origin, as most journals, still answers. */
export interface IArticleDownloadService {
	readonly _serviceBrand: undefined;
	request(options: IRequestOptions, token: CancellationToken): Promise<IRequestContext>;
}
