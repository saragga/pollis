/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { FINDALLOCS_METADATA } from './findAllocs.data.js';
import { buildScaffoldHtml } from './scaffoldParts.js';

export function getFindAllocsHtml(): string {
	return buildScaffoldHtml('findAllocs', FINDALLOCS_METADATA.findAllocs, {
		title: 'Find Allocations',
		defaultModel: 'lines',
		decisionFirstColumn: 'Report',
	});
}
