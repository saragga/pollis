/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { AZERO_METADATA } from './azero.data.js';
import { buildScaffoldHtml } from './scaffoldParts.js';

export function getAzeroHtml(): string {
	return buildScaffoldHtml('azero', AZERO_METADATA.azero, {
		title: 'AlphaZero',
		defaultModel: 'alphazero',
		decisionFirstColumn: 'Method',
	});
}
