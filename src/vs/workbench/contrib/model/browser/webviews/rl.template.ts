/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { RL_METADATA } from './rl.data.js';
import { buildScaffoldHtml } from './scaffoldParts.js';

export function getRlHtml(): string {
	return buildScaffoldHtml('rl', RL_METADATA.rl, {
		title: 'Recurrent Layers',
		defaultModel: 'flux',
		decisionFirstColumn: 'Backend',
	});
}
