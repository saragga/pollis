/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { SI_METADATA } from './si.data.js';
import { buildScaffoldHtml } from './scaffoldParts.js';

export function getSiHtml(): string {
	return buildScaffoldHtml('si', SI_METADATA.si, {
		title: 'System Identification Methods',
		defaultModel: 'arx',
		decisionFirstColumn: 'Model',
	});
}
