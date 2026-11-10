/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IScaffoldPanel } from './scaffold.command.js';
import { FINDALLOCS_METADATA } from '../webviews/findAllocs.data.js';
import { getFindAllocsHtml } from '../webviews/findAllocs.template.js';

export const FINDALLOCS_PANEL: IScaffoldPanel = {
	id: 'findAllocs',
	viewType: 'pollis.findAllocs',
	title: 'Find Allocations',
	data: FINDALLOCS_METADATA.findAllocs,
	html: getFindAllocsHtml,
};
