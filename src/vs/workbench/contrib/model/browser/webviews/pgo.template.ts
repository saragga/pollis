/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { PGO_METADATA } from './pgo.data.js';
import { buildScaffoldHtml } from './scaffoldParts.js';

export function getPgoHtml(): string {
	return buildScaffoldHtml('pgo', PGO_METADATA.pgo, {
		title: 'Stochastic Search with Local Refinement',
		defaultModel: 'mlsl',
		decisionFirstColumn: 'Method',
	});
}
