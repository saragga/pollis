/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { GALG_METADATA } from './galg.data.js';
import { buildScaffoldHtml } from './scaffoldParts.js';

export function getGalgHtml(): string {
	return buildScaffoldHtml('galg', GALG_METADATA.galg, {
		title: 'Genetic Algorithms',
		defaultModel: 'ga',
		decisionFirstColumn: 'Variant',
	});
}
