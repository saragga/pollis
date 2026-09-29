/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { PGO_METADATA } from './pgo.data.js';
import { buildScaffoldHtml } from './scaffoldParts.js';

export function getPgoHtml(): string {
	return buildScaffoldHtml('pgo', PGO_METADATA.pgo, {
		title: 'Principled Global Search with Local Refinement',
		defaultModel: 'ags',
		decisionFirstColumn: 'Method',
	});
}
