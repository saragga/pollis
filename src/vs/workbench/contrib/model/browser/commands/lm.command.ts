/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IScaffoldPanel } from './scaffold.command.js';
import { LM_METADATA } from '../webviews/lm.data.js';
import { getLmHtml } from '../webviews/lm.template.js';

export const LM_PANEL: IScaffoldPanel = {
	id: 'lm',
	viewType: 'pollis.lm',
	title: 'Linear Regression',
	data: LM_METADATA.lm,
	html: getLmHtml,
};
