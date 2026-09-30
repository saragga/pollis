/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IScaffoldPanel } from './scaffold.command.js';
import { MCMC_METADATA } from '../webviews/mcmc.data.js';
import { getMcmcHtml } from '../webviews/mcmc.template.js';

export const MCMC_PANEL: IScaffoldPanel = {
	id: 'mcmc',
	viewType: 'pollis.mcmc',
	title: 'Markov Chain Monte Carlo',
	data: MCMC_METADATA.mcmc,
	html: getMcmcHtml,
};
