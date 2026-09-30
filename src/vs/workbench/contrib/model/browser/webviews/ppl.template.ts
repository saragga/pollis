/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { PPL_METADATA } from './ppl.data.js';
import { buildScaffoldHtml } from './scaffoldParts.js';

export function getPplHtml(): string {
	return buildScaffoldHtml('ppl', PPL_METADATA.ppl, {
		title: 'Sampling-Based Bayesian Inference',
		defaultModel: 'gaussian',
		decisionFirstColumn: 'Model',
	});
}
