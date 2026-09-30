/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { GEV_METADATA } from './gev.data.js';
import { buildScaffoldHtml } from './scaffoldParts.js';

export function getGevHtml(): string {
	return buildScaffoldHtml('gev', GEV_METADATA.gev, {
		title: 'Generalized Extreme Value Distribution',
		defaultModel: 'fit',
		decisionFirstColumn: 'Model',
	});
}
