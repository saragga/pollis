/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { MMN_METADATA } from './mmn.data.js';
import { buildScaffoldHtml } from './scaffoldParts.js';

export function getMmnHtml(): string {
	return buildScaffoldHtml('mmn', MMN_METADATA.mmn, {
		title: 'Market Microstructure Noise',
		defaultModel: 'main',
		decisionFirstColumn: 'Model',
	});
}
