/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IScaffoldPanel } from './scaffold.command.js';
import { SPRO_METADATA } from '../webviews/spro.data.js';
import { getSproHtml } from '../webviews/spro.template.js';

export const SPRO_PANEL: IScaffoldPanel = {
	id: 'spro',
	viewType: 'pollis.spro',
	title: 'Stochastic Programming',
	data: SPRO_METADATA.spro,
	html: getSproHtml,
};
