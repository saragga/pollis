/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IScaffoldPanel } from './scaffold.command.js';
import { MLMC_METADATA } from '../webviews/mlmc.data.js';
import { getMlmcHtml } from '../webviews/mlmc.template.js';

export const MLMC_PANEL: IScaffoldPanel = {
	id: 'mlmc',
	viewType: 'pollis.mlmc',
	title: 'Multilevel Monte Carlo',
	data: MLMC_METADATA.mlmc,
	html: getMlmcHtml,
};
