/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { HT_METADATA } from './ht.data.js';
import { buildScaffoldHtml } from './scaffoldParts.js';

export function getHtHtml(): string {
	return buildScaffoldHtml('ht', HT_METADATA.ht, {
		title: 'Hypothesis Testing',
		defaultModel: 'parametric',
		decisionFirstColumn: 'Model',
	});
}
