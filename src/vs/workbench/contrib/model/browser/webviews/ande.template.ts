/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { ANDE_METADATA } from './ande.data.js';
import { buildScaffoldHtml } from './scaffoldParts.js';

export function getAndeHtml(): string {
	return buildScaffoldHtml('ande', ANDE_METADATA.ande, {
		title: 'Learning-Based Anomaly Detection',
		defaultModel: 'ae',
	});
}
