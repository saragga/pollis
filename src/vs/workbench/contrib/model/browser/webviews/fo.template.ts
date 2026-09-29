/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { FO_METADATA } from './fo.data.js';
import { buildScaffoldHtml } from './scaffoldParts.js';

export function getFoHtml(): string {
	return buildScaffoldHtml('fo', FO_METADATA.fo, {
		title: 'First-Order Methods',
		defaultModel: 'gd',
		decisionFirstColumn: 'Method',
	});
}
