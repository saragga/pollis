/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IDO_METADATA } from './ido.data.js';
import { buildScaffoldHtml } from './scaffoldParts.js';

export function getIdoHtml(): string {
	return buildScaffoldHtml('ido', IDO_METADATA.ido, {
		title: 'Infinite-Dimensional Optimisation',
		defaultModel: 'ocp',
		decisionFirstColumn: 'Problem',
	});
}
