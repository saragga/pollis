/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IScaffoldPanel } from './scaffold.command.js';
import { HT_METADATA } from '../webviews/ht.data.js';
import { getHtHtml } from '../webviews/ht.template.js';

export const HT_PANEL: IScaffoldPanel = {
	id: 'ht',
	viewType: 'pollis.ht',
	title: 'Hypothesis Testing',
	data: HT_METADATA.ht,
	html: getHtHtml,
};
