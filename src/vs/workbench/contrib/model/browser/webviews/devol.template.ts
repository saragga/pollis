/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { DEVOL_METADATA } from './devol.data.js';
import { buildScaffoldHtml } from './scaffoldParts.js';

export function getDevolHtml(): string {
	return buildScaffoldHtml('devol', DEVOL_METADATA.devol, {
		title: 'Differential Evolution',
		defaultModel: 'de',
		decisionFirstColumn: 'Variant',
	});
}
