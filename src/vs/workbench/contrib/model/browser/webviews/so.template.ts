/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { SO_METADATA } from './so.data.js';
import { buildScaffoldHtml } from './scaffoldParts.js';

export function getSoHtml(): string {
	return buildScaffoldHtml('so', SO_METADATA.so, {
		title: 'Second Order Methods',
		defaultModel: 'newton',
		decisionFirstColumn: 'Method',
	});
}
