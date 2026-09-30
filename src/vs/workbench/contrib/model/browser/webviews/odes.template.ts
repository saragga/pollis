/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { ODES_METADATA } from './odes.data.js';
import { buildScaffoldHtml } from './scaffoldParts.js';

export function getOdesHtml(): string {
	return buildScaffoldHtml('odes', ODES_METADATA.odes, {
		title: 'Ordinary Differential Equations',
		defaultModel: 'scalar',
		decisionFirstColumn: 'Task',
	});
}
