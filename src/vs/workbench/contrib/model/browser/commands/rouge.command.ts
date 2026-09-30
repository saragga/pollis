/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IScaffoldPanel } from './scaffold.command.js';
import { ROUGE_METADATA } from '../webviews/rouge.data.js';
import { getRougeHtml } from '../webviews/rouge.template.js';

export const ROUGE_PANEL: IScaffoldPanel = {
	id: 'rouge',
	viewType: 'pollis.rouge',
	title: 'ROUGE Evaluation',
	data: ROUGE_METADATA.rouge,
	html: getRougeHtml,
};
