/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { ES_METADATA } from './es.data.js';
import { buildScaffoldHtml } from './scaffoldParts.js';

export function getEsHtml(): string {
	return buildScaffoldHtml('es', ES_METADATA.es, {
		title: 'Evolution Strategies',
		defaultModel: 'cmaes',
		decisionFirstColumn: 'Method',
	});
}
