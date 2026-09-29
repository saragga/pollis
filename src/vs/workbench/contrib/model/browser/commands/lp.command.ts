/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IScaffoldPanel } from './scaffold.command.js';
import { LP_METADATA } from '../webviews/lp.data.js';
import { getLpHtml } from '../webviews/lp.template.js';

export const LP_PANEL: IScaffoldPanel = {
	id: 'lp',
	viewType: 'pollis.lp',
	title: 'Linear Programming',
	data: LP_METADATA.lp,
	html: getLpHtml,
};
