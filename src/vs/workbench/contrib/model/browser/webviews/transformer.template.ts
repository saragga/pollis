/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { TRANSFORMER_METADATA } from './transformer.data.js';
import { buildScaffoldHtml } from './scaffoldParts.js';

export function getTransformerHtml(): string {
	return buildScaffoldHtml('transformer', TRANSFORMER_METADATA.transformer, {
		title: 'Transformers',
		defaultModel: 'encoder',
		decisionFirstColumn: 'Architecture',
	});
}
