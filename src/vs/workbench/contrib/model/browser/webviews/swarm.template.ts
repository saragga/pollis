/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { SWARM_METADATA } from './swarm.data.js';
import { buildScaffoldHtml } from './scaffoldParts.js';

export function getSwarmHtml(): string {
	return buildScaffoldHtml('swarm', SWARM_METADATA.swarm, {
		title: 'Swarm Intelligence',
		defaultModel: 'pso',
		decisionFirstColumn: 'Algorithm',
	});
}
