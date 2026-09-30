/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { SYMB_METADATA } from './symb.data.js';
import { buildScaffoldHtml } from './scaffoldParts.js';

export function getSymbHtml(): string {
	return buildScaffoldHtml('symb', SYMB_METADATA.symb, {
		title: 'Symbolic Math',
		defaultModel: 'alg',
		decisionFirstColumn: 'Task',
	});
}
