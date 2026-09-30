/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { MLMC_METADATA } from './mlmc.data.js';
import { buildScaffoldHtml } from './scaffoldParts.js';

export function getMlmcHtml(): string {
	return buildScaffoldHtml('mlmc', MLMC_METADATA.mlmc, {
		title: 'Multilevel Monte Carlo',
		defaultModel: 'mlmc',
		decisionFirstColumn: 'Model',
	});
}
