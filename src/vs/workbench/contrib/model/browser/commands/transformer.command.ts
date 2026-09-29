/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IScaffoldPanel } from './scaffold.command.js';
import { TRANSFORMER_METADATA } from '../webviews/transformer.data.js';
import { getTransformerHtml } from '../webviews/transformer.template.js';

export const TRANSFORMER_PANEL: IScaffoldPanel = {
	id: 'transformer',
	viewType: 'pollis.transformer',
	title: 'Transformers',
	data: TRANSFORMER_METADATA.transformer,
	html: getTransformerHtml,
};
