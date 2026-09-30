/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { DE_METADATA } from './de.data.js';
import { buildScaffoldHtml } from './scaffoldParts.js';

export function getDeHtml(): string {
	return buildScaffoldHtml('de', DE_METADATA.de, {
		title: 'Density Estimation',
		defaultModel: 'histogram',
		decisionFirstColumn: 'Model',
	});
}
