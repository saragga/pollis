/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IScaffoldPanel } from './scaffold.command.js';
import { NOD_METADATA } from '../webviews/nod.data.js';
import { getNodHtml } from '../webviews/nod.template.js';

export const NOD_PANEL: IScaffoldPanel = {
	id: 'nod',
	viewType: 'pollis.nod',
	title: 'Proximity-Based Outlier Detection',
	data: NOD_METADATA.nod,
	html: getNodHtml,
};
