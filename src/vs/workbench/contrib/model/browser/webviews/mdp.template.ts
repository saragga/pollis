/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { MDP_METADATA } from './mdp.data.js';
import { buildScaffoldHtml } from './scaffoldParts.js';

export function getMdpHtml(): string {
	return buildScaffoldHtml('mdp', MDP_METADATA.mdp, {
		title: 'Single-Agent Decision Processes',
		defaultModel: 'mdp',
		decisionFirstColumn: 'Process',
	});
}
