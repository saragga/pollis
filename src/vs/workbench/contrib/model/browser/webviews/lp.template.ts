/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { LP_METADATA } from './lp.data.js';
import { buildScaffoldHtml } from './scaffoldParts.js';

export function getLpHtml(): string {
	return buildScaffoldHtml('lp', LP_METADATA.lp, {
		title: 'Linear Programming',
		defaultModel: 'lp',
		decisionFirstColumn: 'Problem',
	});
}
