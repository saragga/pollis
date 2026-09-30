/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { LLMTA_METADATA } from './llmTa.data.js';
import { buildScaffoldHtml } from './scaffoldParts.js';

export function getLlmTaHtml(): string {
	return buildScaffoldHtml('llmTa', LLMTA_METADATA.llmTa, {
		title: 'LLM Text Analysis',
		defaultModel: 'tag',
		decisionFirstColumn: 'Model',
	});
}
