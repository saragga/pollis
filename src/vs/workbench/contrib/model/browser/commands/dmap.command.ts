/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IScaffoldPanel } from './scaffold.command.js';
import { DMAP_METADATA } from '../webviews/dmap.data.js';
import { getDmapHtml } from '../webviews/dmap.template.js';

export const DMAP_PANEL: IScaffoldPanel = {
	id: 'dmap',
	viewType: 'pollis.dmap',
	title: 'Discrete Maps',
	data: DMAP_METADATA.dmap,
	html: getDmapHtml,
};
