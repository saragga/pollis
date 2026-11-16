/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { WBD_METADATA } from './wbd.data.js';
import { buildScaffoldHtml } from './scaffoldParts.js';

export function getWbdHtml(): string {
	return buildScaffoldHtml('wbd', WBD_METADATA.wbd, {
		title: 'World Bank Indicators',
		defaultModel: 'indicator',
		decisionFirstColumn: 'Task',
	});
}
