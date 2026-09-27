/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { BOPT_METADATA } from './bopt.data.js';
import { buildScaffoldHtml } from './scaffoldParts.js';

export function getBoptHtml(): string {
	return buildScaffoldHtml('bopt', BOPT_METADATA.bopt, {
		title: 'Bayesian Optimisation',
		defaultModel: 'ei',
		decisionFirstColumn: 'Acquisition',
	});
}
