/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IScaffoldPanel } from './scaffold.command.js';
import { EXP_METADATA } from '../webviews/exp.data.js';
import { getExpHtml } from '../webviews/exp.template.js';

export const EXP_PANEL: IScaffoldPanel = {
	id: 'exp',
	viewType: 'pollis.exp',
	title: 'Expectations',
	data: EXP_METADATA.exp,
	html: getExpHtml,
};
