/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { DP_METADATA } from './dp.data.js';
import { buildScaffoldHtml } from './scaffoldParts.js';

export function getDpHtml(): string {
	return buildScaffoldHtml('dp', DP_METADATA.dp, {
		title: 'Dynamic Programming',
		defaultModel: 'det',
		decisionFirstColumn: 'Model',
	});
}
