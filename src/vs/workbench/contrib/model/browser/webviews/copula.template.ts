/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { COPULA_METADATA } from './copula.data.js';
import { buildScaffoldHtml } from './scaffoldParts.js';

export function getCopulaHtml(): string {
	return buildScaffoldHtml('copula', COPULA_METADATA.copula, {
		title: 'Copula Estimation',
		defaultModel: 'main',
		decisionFirstColumn: 'Model',
	});
}
