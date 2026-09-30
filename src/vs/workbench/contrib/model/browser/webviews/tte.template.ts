/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { TTE_METADATA } from './tte.data.js';
import { buildScaffoldHtml } from './scaffoldParts.js';

export function getTteHtml(): string {
	return buildScaffoldHtml('tte', TTE_METADATA.tte, {
		title: 'Time-to-Event Analysis',
		defaultModel: 'km',
		decisionFirstColumn: 'Model',
	});
}
