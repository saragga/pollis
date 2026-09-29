/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { DT_METADATA } from './dt.data.js';
import { buildScaffoldHtml } from './scaffoldParts.js';

export function getDtHtml(): string {
	return buildScaffoldHtml('dt', DT_METADATA.dt, {
		title: 'Decision Tree Models',
		defaultModel: 'dt',
		decisionFirstColumn: 'Model',
	});
}
