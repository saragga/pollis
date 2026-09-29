/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { CMP_METADATA } from './cmp.data.js';
import { buildScaffoldHtml } from './scaffoldParts.js';

export function getCmpHtml(): string {
	return buildScaffoldHtml('cmp', CMP_METADATA.cmp, {
		title: 'Complementarity Problems',
		defaultModel: 'lcp',
		decisionFirstColumn: 'Problem',
	});
}
