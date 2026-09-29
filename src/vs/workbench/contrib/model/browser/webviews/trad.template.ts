/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { TRAD_METADATA } from './trad.data.js';
import { buildScaffoldHtml } from './scaffoldParts.js';

export function getTradHtml(): string {
	return buildScaffoldHtml('trad', TRAD_METADATA.trad, {
		title: 'Trading Agents',
		defaultModel: 'agents',
		decisionFirstColumn: 'Model',
	});
}
