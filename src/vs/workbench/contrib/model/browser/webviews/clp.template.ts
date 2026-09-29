/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { CLP_METADATA } from './clp.data.js';
import { buildScaffoldHtml } from './scaffoldParts.js';

export function getClpHtml(): string {
	return buildScaffoldHtml('clp', CLP_METADATA.clp, {
		title: 'Partitional & Density Clustering',
		defaultModel: 'km',
		decisionFirstColumn: 'Method',
	});
}
