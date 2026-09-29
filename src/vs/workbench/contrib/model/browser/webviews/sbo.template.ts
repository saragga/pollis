/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { SBO_METADATA } from './sbo.data.js';
import { buildScaffoldHtml } from './scaffoldParts.js';

export function getSboHtml(): string {
	return buildScaffoldHtml('sbo', SBO_METADATA.sbo, {
		title: 'Surrogate-Based Optimisation',
		defaultModel: 'kriging',
		decisionFirstColumn: 'Surrogate',
	});
}
