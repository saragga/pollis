/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { DMAP_METADATA } from './dmap.data.js';
import { buildScaffoldHtml } from './scaffoldParts.js';

export function getDmapHtml(): string {
	return buildScaffoldHtml('dmap', DMAP_METADATA.dmap, {
		title: 'Discrete Maps',
		defaultModel: 'main',
		decisionFirstColumn: 'Model',
	});
}
