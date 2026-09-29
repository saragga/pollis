/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IScaffoldPanel } from './scaffold.command.js';
import { CCDR_METADATA } from '../webviews/ccdr.data.js';
import { getCcdrHtml } from '../webviews/ccdr.template.js';

export const CCDR_PANEL: IScaffoldPanel = {
	id: 'ccdr',
	viewType: 'pollis.ccdr',
	title: 'Chance-Constrained and Distributionally Robust Optimisation',
	data: CCDR_METADATA.ccdr,
	html: getCcdrHtml,
};
