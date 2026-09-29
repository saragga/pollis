/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { MPEC_METADATA } from './mpec.data.js';
import { buildScaffoldHtml } from './scaffoldParts.js';

export function getMpecHtml(): string {
	return buildScaffoldHtml('mpec', MPEC_METADATA.mpec, {
		title: 'Mathematical Programming with Equilibrium Constraints',
		defaultModel: 'reg',
		decisionFirstColumn: 'Method',
	});
}
