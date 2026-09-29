/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IScaffoldPanel } from './scaffold.command.js';
import { EMBEDDING_METADATA } from '../webviews/embedding.data.js';
import { getEmbeddingHtml } from '../webviews/embedding.template.js';

export const EMBEDDING_PANEL: IScaffoldPanel = {
	id: 'embedding',
	viewType: 'pollis.embedding',
	title: 'Neighbour Embedding',
	data: EMBEDDING_METADATA.embedding,
	html: getEmbeddingHtml,
};
