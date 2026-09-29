/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { HNS_METADATA } from './hns.data.js';
import { buildScaffoldHtml } from './scaffoldParts.js';

export function getHnsHtml(): string {
	return buildScaffoldHtml('hns', HNS_METADATA.hns, {
		title: 'Neighbourhood Search',
		defaultModel: 'crs',
		decisionFirstColumn: 'Method',
	});
}
