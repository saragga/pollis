/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IScaffoldPanel } from './scaffold.command.js';
import { GEV_METADATA } from '../webviews/gev.data.js';
import { getGevHtml } from '../webviews/gev.template.js';

export const GEV_PANEL: IScaffoldPanel = {
	id: 'gev',
	viewType: 'pollis.gev',
	title: 'Generalized Extreme Value Distribution',
	data: GEV_METADATA.gev,
	html: getGevHtml,
};
