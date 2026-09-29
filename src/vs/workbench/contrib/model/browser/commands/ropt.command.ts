/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IScaffoldPanel } from './scaffold.command.js';
import { ROPT_METADATA } from '../webviews/ropt.data.js';
import { getRoptHtml } from '../webviews/ropt.template.js';

export const ROPT_PANEL: IScaffoldPanel = {
	id: 'ropt',
	viewType: 'pollis.ropt',
	title: 'Uncertainty-Set Robust Optimisation',
	data: ROPT_METADATA.ropt,
	html: getRoptHtml,
};
