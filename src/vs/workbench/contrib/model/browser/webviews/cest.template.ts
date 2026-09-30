/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { CEST_METADATA } from './cest.data.js';
import { buildScaffoldHtml } from './scaffoldParts.js';

export function getCestHtml(): string {
	return buildScaffoldHtml('cest', CEST_METADATA.cest, {
		title: 'Contagion Models',
		defaultModel: 'rt',
		decisionFirstColumn: 'Model',
	});
}
