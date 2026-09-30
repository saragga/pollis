/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { SGO_METADATA } from './sgo.data.js';
import { buildScaffoldHtml } from './scaffoldParts.js';

export function getSgoHtml(): string {
	return buildScaffoldHtml('sgo', SGO_METADATA.sgo, {
		title: 'Stochastic Global Methods',
		defaultModel: 'crs',
		decisionFirstColumn: 'Model',
	});
}
