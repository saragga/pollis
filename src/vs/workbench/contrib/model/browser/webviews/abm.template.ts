/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { ABM_METADATA } from './abm.data.js';
import { buildScaffoldHtml } from './scaffoldParts.js';

export function getAbmHtml(): string {
	return buildScaffoldHtml('abm', ABM_METADATA.abm, {
		title: 'Agent-Based Models',
		defaultModel: 'grid',
		decisionFirstColumn: 'Model',
	});
}
