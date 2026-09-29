/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { EMBEDDING_METADATA } from './embedding.data.js';
import { buildScaffoldHtml } from './scaffoldParts.js';

export function getEmbeddingHtml(): string {
	return buildScaffoldHtml('embedding', EMBEDDING_METADATA.embedding, {
		title: 'Neighbour Embedding',
		defaultModel: 'tsne',
		decisionFirstColumn: 'Method',
	});
}
