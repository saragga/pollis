/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IScaffoldPanel } from './scaffold.command.js';
import { DCO_METADATA } from '../webviews/dco.data.js';
import { getDcoHtml } from '../webviews/dco.template.js';

export const DCO_PANEL: IScaffoldPanel = {
	id: 'dco',
	viewType: 'pollis.dco',
	title: 'Discrete and Combinatorial Optimisation',
	data: DCO_METADATA.dco,
	html: getDcoHtml,
};
