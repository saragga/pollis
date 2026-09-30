/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { SDEA_METADATA } from './sdea.data.js';
import { buildScaffoldHtml } from './scaffoldParts.js';

export function getSdeaHtml(): string {
	return buildScaffoldHtml('sdea', SDEA_METADATA.sdea, {
		title: 'SDE Ensemble Analysis',
		defaultModel: 'paths',
		decisionFirstColumn: 'Analysis',
	});
}
