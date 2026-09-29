/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IScaffoldPanel } from './scaffold.command.js';
import { DS_METADATA } from '../webviews/ds.data.js';
import { getDsHtml } from '../webviews/ds.template.js';

export const DS_PANEL: IScaffoldPanel = {
	id: 'ds',
	viewType: 'pollis.ds',
	title: 'Direct Search Methods',
	data: DS_METADATA.ds,
	html: getDsHtml,
};
