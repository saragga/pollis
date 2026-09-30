/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { BERT_METADATA } from './bert.data.js';
import { buildScaffoldHtml } from './scaffoldParts.js';

export function getBertHtml(): string {
	return buildScaffoldHtml('bert', BERT_METADATA.bert, {
		title: 'BERT Embeddings',
		defaultModel: 'embed',
		decisionFirstColumn: 'Model',
	});
}
