/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { MPLAB_METADATA } from './mplab.data.js';
import { buildScaffoldHtml } from './scaffoldParts.js';

export function getMplabHtml(): string {
	return buildScaffoldHtml('mplab', MPLAB_METADATA.mplab, {
		title: 'Mathematical Programming Lab',
		defaultModel: 'filtersqp',
		decisionFirstColumn: 'Method',
	});
}
