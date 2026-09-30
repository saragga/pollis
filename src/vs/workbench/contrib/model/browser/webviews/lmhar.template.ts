/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { LMHAR_METADATA } from './lmhar.data.js';
import { buildScaffoldHtml } from './scaffoldParts.js';

export function getLmharHtml(): string {
	return buildScaffoldHtml('lmhar', LMHAR_METADATA.lmhar, {
		title: 'Linear Models with Heteroskedasticity + AR(1)',
		defaultModel: 'sequential',
		decisionFirstColumn: 'Model',
	});
}
