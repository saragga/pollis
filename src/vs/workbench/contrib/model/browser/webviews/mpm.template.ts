/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { MPM_METADATA } from './mpm.data.js';
import { buildScaffoldHtml } from './scaffoldParts.js';

export function getMpmHtml(): string {
	return buildScaffoldHtml('mpm', MPM_METADATA.mpm, {
		title: 'Multi-Objective Optimisation Performance Metrics',
		defaultModel: 'hv',
		decisionFirstColumn: 'Metric',
	});
}
