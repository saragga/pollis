/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IScaffoldPanel } from './scaffold.command.js';
import { CPS_METADATA } from '../webviews/cps.data.js';
import { getCpsHtml } from '../webviews/cps.template.js';

export const CPS_PANEL: IScaffoldPanel = {
	id: 'cps',
	viewType: 'pollis.cps',
	title: 'Copula Sampling',
	data: CPS_METADATA.cps,
	html: getCpsHtml,
};
