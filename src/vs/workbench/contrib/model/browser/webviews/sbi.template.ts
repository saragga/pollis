/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { SBI_METADATA } from './sbi.data.js';
import { buildScaffoldHtml } from './scaffoldParts.js';

export function getSbiHtml(): string {
	return buildScaffoldHtml('sbi', SBI_METADATA.sbi, {
		title: 'Simulation-Based Inference',
		defaultModel: 'point',
		decisionFirstColumn: 'Estimator',
	});
}
