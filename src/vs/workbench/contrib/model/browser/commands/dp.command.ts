/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IScaffoldPanel } from './scaffold.command.js';
import { DP_METADATA } from '../webviews/dp.data.js';
import { getDpHtml } from '../webviews/dp.template.js';

export const DP_PANEL: IScaffoldPanel = {
	id: 'dp',
	viewType: 'pollis.dp',
	title: 'Dynamic Programming',
	data: DP_METADATA.dp,
	html: getDpHtml,
};
