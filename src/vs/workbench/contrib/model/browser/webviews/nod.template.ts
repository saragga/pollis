/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { NOD_METADATA } from './nod.data.js';
import { buildScaffoldHtml } from './scaffoldParts.js';

export function getNodHtml(): string {
	return buildScaffoldHtml('nod', NOD_METADATA.nod, {
		title: 'Proximity-Based Outlier Detection',
		defaultModel: 'knn',
	});
}
