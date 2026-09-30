/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { RNG_METADATA } from './rng.data.js';
import { buildScaffoldHtml } from './scaffoldParts.js';

export function getRngHtml(): string {
	return buildScaffoldHtml('rng', RNG_METADATA.rng, {
		title: 'Random Numbers Generation',
		defaultModel: 'stable',
		decisionFirstColumn: 'Model',
	});
}
