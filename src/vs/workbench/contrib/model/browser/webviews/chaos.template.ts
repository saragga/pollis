/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { CHAOS_METADATA } from './chaos.data.js';
import { buildScaffoldHtml } from './scaffoldParts.js';

export function getChaosHtml(): string {
	return buildScaffoldHtml('chaos', CHAOS_METADATA.chaos, {
		title: 'Chaos Characterisation',
		defaultModel: 'lyap',
		decisionFirstColumn: 'Model',
	});
}
