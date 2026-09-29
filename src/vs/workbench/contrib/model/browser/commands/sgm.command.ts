/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IScaffoldPanel } from './scaffold.command.js';
import { SGM_METADATA } from '../webviews/sgm.data.js';
import { getSgmHtml } from '../webviews/sgm.template.js';

export const SGM_PANEL: IScaffoldPanel = {
	id: 'sgm',
	viewType: 'pollis.sgm',
	title: 'Stochastic Gradient Methods',
	data: SGM_METADATA.sgm,
	html: getSgmHtml,
};
