/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { DSTATS_METADATA } from './dstats.data.js';
import { buildScaffoldHtml } from './scaffoldParts.js';

export function getDstatsHtml(): string {
	return buildScaffoldHtml('dstats', DSTATS_METADATA.dstats, {
		title: 'Descriptive Statistics',
		defaultModel: 'summ',
		decisionFirstColumn: 'Method',
	});
}
