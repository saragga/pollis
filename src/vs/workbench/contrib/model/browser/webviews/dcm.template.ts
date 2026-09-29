/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { DCM_METADATA } from './dcm.data.js';
import { buildScaffoldHtml } from './scaffoldParts.js';

export function getDcmHtml(): string {
	return buildScaffoldHtml('dcm', DCM_METADATA.dcm, {
		title: 'Decomposition and Constrained Multi-Objective Optimisation',
		defaultModel: 'moead',
		decisionFirstColumn: 'Algorithm',
	});
}
