/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { BFMB_METADATA } from './bfmb.data.js';
import { buildScaffoldHtml } from './scaffoldParts.js';

export function getBfmbHtml(): string {
	return buildScaffoldHtml('bfmb', BFMB_METADATA.bfmb, {
		title: 'Fama-MacBeth Regression',
		defaultModel: 'bayesian',
		decisionFirstColumn: 'Approach',
	});
}
