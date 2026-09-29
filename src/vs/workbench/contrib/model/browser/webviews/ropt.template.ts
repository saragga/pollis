/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { ROPT_METADATA } from './ropt.data.js';
import { buildScaffoldHtml } from './scaffoldParts.js';

export function getRoptHtml(): string {
	return buildScaffoldHtml('ropt', ROPT_METADATA.ropt, {
		title: 'Uncertainty-Set Robust Optimisation',
		defaultModel: 'box',
		decisionFirstColumn: 'Set',
	});
}
