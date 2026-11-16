/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { MPMINLP_METADATA } from './mpminlp.data.js';
import { buildScaffoldHtml } from './scaffoldParts.js';

export function getMpminlpHtml(): string {
	return buildScaffoldHtml('mpminlp', MPMINLP_METADATA.mpminlp, {
		title: 'Mixed-Integer Nonlinear Programming',
		defaultModel: 'scip',
		decisionFirstColumn: 'Solver',
	});
}
