/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { ROUGE_METADATA } from './rouge.data.js';
import { buildScaffoldHtml } from './scaffoldParts.js';

export function getRougeHtml(): string {
	return buildScaffoldHtml('rouge', ROUGE_METADATA.rouge, {
		title: 'ROUGE Evaluation',
		defaultModel: 'rouge1',
		decisionFirstColumn: 'Model',
	});
}
