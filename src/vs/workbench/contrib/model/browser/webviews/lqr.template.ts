/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { LQR_METADATA } from './lqr.data.js';
import { buildScaffoldHtml } from './scaffoldParts.js';

export function getLqrHtml(): string {
	return buildScaffoldHtml('lqr', LQR_METADATA.lqr, {
		title: 'Linear Optimal Control',
		defaultModel: 'sf',
		decisionFirstColumn: 'Controller',
	});
}
