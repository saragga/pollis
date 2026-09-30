/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { HPT_METADATA } from './hpt.data.js';
import { buildScaffoldHtml } from './scaffoldParts.js';

export function getHptHtml(): string {
	return buildScaffoldHtml('hpt', HPT_METADATA.hpt, {
		title: 'Hyperparameter Tuning',
		defaultModel: 'grid',
		decisionFirstColumn: 'Model',
	});
}
