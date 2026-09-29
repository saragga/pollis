/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { COPT_METADATA } from './copt.data.js';
import { buildScaffoldHtml } from './scaffoldParts.js';

export function getCoptHtml(): string {
	return buildScaffoldHtml('copt', COPT_METADATA.copt, {
		title: 'Constrained Optimisation',
		defaultModel: 'slsqp',
		decisionFirstColumn: 'Method',
	});
}
