/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { LDA_METADATA } from './lda.data.js';
import { buildScaffoldHtml } from './scaffoldParts.js';

export function getLdaHtml(): string {
	return buildScaffoldHtml('lda', LDA_METADATA.lda, {
		title: 'Latent Dirichlet Allocation',
		defaultModel: 'lda',
		decisionFirstColumn: 'Model',
	});
}
