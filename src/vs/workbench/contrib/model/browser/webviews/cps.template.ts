/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { CPS_METADATA } from './cps.data.js';
import { buildScaffoldHtml } from './scaffoldParts.js';

export function getCpsHtml(): string {
	return buildScaffoldHtml('cps', CPS_METADATA.cps, {
		title: 'Copula Sampling',
		defaultModel: 'main',
		decisionFirstColumn: 'Model',
	});
}
