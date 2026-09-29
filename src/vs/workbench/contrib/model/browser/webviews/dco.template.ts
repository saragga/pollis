/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { DCO_METADATA } from './dco.data.js';
import { buildScaffoldHtml } from './scaffoldParts.js';

export function getDcoHtml(): string {
	return buildScaffoldHtml('dco', DCO_METADATA.dco, {
		title: 'Discrete and Combinatorial Optimisation',
		defaultModel: 'grasp',
		decisionFirstColumn: 'Method',
	});
}
