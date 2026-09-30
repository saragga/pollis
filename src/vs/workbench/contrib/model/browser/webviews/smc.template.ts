/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { SMC_METADATA } from './smc.data.js';
import { buildScaffoldHtml } from './scaffoldParts.js';

export function getSmcHtml(): string {
	return buildScaffoldHtml('smc', SMC_METADATA.smc, {
		title: 'Sequential Monte Carlo',
		defaultModel: 'filter',
		decisionFirstColumn: 'Model',
	});
}
