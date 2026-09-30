/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IScaffoldPanel } from './scaffold.command.js';
import { LLMTA_METADATA } from '../webviews/llmTa.data.js';
import { getLlmTaHtml } from '../webviews/llmTa.template.js';

export const LLMTA_PANEL: IScaffoldPanel = {
	id: 'llmTa',
	viewType: 'pollis.llmTa',
	title: 'LLM Text Analysis',
	data: LLMTA_METADATA.llmTa,
	html: getLlmTaHtml,
};
