/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IScaffoldPanel } from './scaffold.command.js';
import { IDAT_METADATA } from '../webviews/idat.data.js';
import { getIdatHtml } from '../webviews/idat.template.js';

export const IDAT_PANEL: IScaffoldPanel = {
	id: 'idat',
	viewType: 'pollis.idat',
	title: 'Interpolate Data',
	data: IDAT_METADATA.idat,
	html: getIdatHtml,
};
