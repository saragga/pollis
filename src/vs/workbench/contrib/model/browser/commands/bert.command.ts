/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IScaffoldPanel } from './scaffold.command.js';
import { BERT_METADATA } from '../webviews/bert.data.js';
import { getBertHtml } from '../webviews/bert.template.js';

export const BERT_PANEL: IScaffoldPanel = {
	id: 'bert',
	viewType: 'pollis.bert',
	title: 'BERT Embeddings',
	data: BERT_METADATA.bert,
	html: getBertHtml,
};
