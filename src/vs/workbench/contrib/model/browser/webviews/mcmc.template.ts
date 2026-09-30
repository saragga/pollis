/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { MCMC_METADATA } from './mcmc.data.js';
import { buildScaffoldHtml } from './scaffoldParts.js';

export function getMcmcHtml(): string {
	return buildScaffoldHtml('mcmc', MCMC_METADATA.mcmc, {
		title: 'Markov Chain Monte Carlo',
		defaultModel: 'nuts',
		decisionFirstColumn: 'Model',
	});
}
