/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { DS_METADATA } from './ds.data.js';
import { buildScaffoldHtml } from './scaffoldParts.js';

export function getDsHtml(): string {
	return buildScaffoldHtml('ds', DS_METADATA.ds, {
		title: 'Direct Search Methods',
		defaultModel: 'nm',
		decisionFirstColumn: 'Method',
	});
}
