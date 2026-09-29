/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { KNN_METADATA } from './knn.data.js';
import { buildScaffoldHtml } from './scaffoldParts.js';

export function getKnnHtml(): string {
	return buildScaffoldHtml('knn', KNN_METADATA.knn, {
		title: 'k-Nearest Neighbours',
		defaultModel: 'knn',
		decisionFirstColumn: 'Search',
	});
}
