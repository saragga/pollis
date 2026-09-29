/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { CCDR_METADATA } from './ccdr.data.js';
import { buildScaffoldHtml } from './scaffoldParts.js';

export function getCcdrHtml(): string {
	return buildScaffoldHtml('ccdr', CCDR_METADATA.ccdr, {
		title: 'Chance-Constrained and Distributionally Robust Optimisation',
		defaultModel: 'cc',
		decisionFirstColumn: 'Model',
	});
}
