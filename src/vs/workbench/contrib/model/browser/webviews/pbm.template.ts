/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { PBM_METADATA } from './pbm.data.js';
import { buildScaffoldHtml } from './scaffoldParts.js';

export function getPbmHtml(): string {
	return buildScaffoldHtml('pbm', PBM_METADATA.pbm, {
		title: 'Pareto-Based Multi-Objective Optimisation',
		defaultModel: 'nsga2',
		decisionFirstColumn: 'Algorithm',
	});
}
