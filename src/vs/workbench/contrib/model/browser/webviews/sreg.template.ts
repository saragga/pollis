/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { SREG_METADATA } from './sreg.data.js';
import { buildScaffoldHtml } from './scaffoldParts.js';

export function getSregHtml(): string {
	return buildScaffoldHtml('sreg', SREG_METADATA.sreg, {
		title: 'Symbolic Regression',
		defaultModel: 'main',
		decisionFirstColumn: 'Model',
	});
}
