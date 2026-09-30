/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { PTPS_METADATA } from './ptps.data.js';
import { buildScaffoldHtml } from './scaffoldParts.js';

export function getPtpsHtml(): string {
	return buildScaffoldHtml('ptps', PTPS_METADATA.ptps, {
		title: 'Point Process Simulation',
		defaultModel: 'poisson',
		decisionFirstColumn: 'Model',
	});
}
