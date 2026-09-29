/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { CLH_METADATA } from './clh.data.js';
import { buildScaffoldHtml } from './scaffoldParts.js';

export function getClhHtml(): string {
	return buildScaffoldHtml('clh', CLH_METADATA.clh, {
		title: 'Hierarchical Clustering',
		defaultModel: 'ward',
		decisionFirstColumn: 'Linkage',
	});
}
