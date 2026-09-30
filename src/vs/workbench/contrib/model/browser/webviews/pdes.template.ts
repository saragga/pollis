/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { PDES_METADATA } from './pdes.data.js';
import { buildScaffoldHtml } from './scaffoldParts.js';

export function getPdesHtml(): string {
	return buildScaffoldHtml('pdes', PDES_METADATA.pdes, {
		title: 'Partial Differential Equations',
		defaultModel: 'heat',
		decisionFirstColumn: 'Task',
	});
}
