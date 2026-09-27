/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IScaffoldPanel } from './scaffold.command.js';
import { BOPT_METADATA } from '../webviews/bopt.data.js';
import { getBoptHtml } from '../webviews/bopt.template.js';

export const BOPT_PANEL: IScaffoldPanel = {
	id: 'bopt',
	viewType: 'pollis.bopt',
	title: 'Bayesian Optimisation',
	data: BOPT_METADATA.bopt,
	html: getBoptHtml,
};
