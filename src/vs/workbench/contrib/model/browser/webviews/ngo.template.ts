/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { NGO_METADATA } from './ngo.data.js';
import { buildScaffoldHtml } from './scaffoldParts.js';

export function getNgoHtml(): string {
	return buildScaffoldHtml('ngo', NGO_METADATA.ngo, {
		title: 'Network and Graph Optimisation',
		defaultModel: 'sp',
		decisionFirstColumn: 'Problem',
	});
}
