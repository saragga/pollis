/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { DGO_METADATA } from './dgo.data.js';
import { buildScaffoldHtml } from './scaffoldParts.js';

export function getDgoHtml(): string {
	return buildScaffoldHtml('dgo', DGO_METADATA.dgo, {
		title: 'Deterministic Global Methods',
		defaultModel: 'direct',
		decisionFirstColumn: 'Method',
	});
}
