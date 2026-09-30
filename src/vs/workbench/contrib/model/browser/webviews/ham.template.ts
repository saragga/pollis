/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { HAM_METADATA } from './ham.data.js';
import { buildScaffoldHtml } from './scaffoldParts.js';

export function getHamHtml(): string {
	return buildScaffoldHtml('ham', HAM_METADATA.ham, {
		title: 'Heterogeneous-Agent Models',
		defaultModel: 'main',
		decisionFirstColumn: 'Model',
	});
}
