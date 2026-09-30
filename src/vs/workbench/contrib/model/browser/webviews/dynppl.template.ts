/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { DYNPPL_METADATA } from './dynppl.data.js';
import { buildScaffoldHtml } from './scaffoldParts.js';

export function getDynpplHtml(): string {
	return buildScaffoldHtml('dynppl', DYNPPL_METADATA.dynppl, {
		title: 'Probabilistic Programming with Turing.jl',
		defaultModel: 'nuts',
		decisionFirstColumn: 'Method',
	});
}
