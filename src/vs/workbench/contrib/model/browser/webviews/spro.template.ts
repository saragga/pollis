/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { SPRO_METADATA } from './spro.data.js';
import { buildScaffoldHtml } from './scaffoldParts.js';

export function getSproHtml(): string {
	return buildScaffoldHtml('spro', SPRO_METADATA.spro, {
		title: 'Stochastic Programming',
		defaultModel: 'ts',
		decisionFirstColumn: 'Model',
	});
}
