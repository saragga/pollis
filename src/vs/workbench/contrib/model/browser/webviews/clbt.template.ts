/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { CLBT_METADATA } from './clbt.data.js';
import { buildScaffoldHtml } from './scaffoldParts.js';

export function getClbtHtml(): string {
	return buildScaffoldHtml('clbt', CLBT_METADATA.clbt, {
		title: 'ColBERT Retrieval',
		defaultModel: 'main',
		decisionFirstColumn: 'Model',
	});
}
