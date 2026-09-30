/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { EXP_METADATA } from './exp.data.js';
import { buildScaffoldHtml } from './scaffoldParts.js';

export function getExpHtml(): string {
	return buildScaffoldHtml('exp', EXP_METADATA.exp, {
		title: 'Expectations',
		defaultModel: 'main',
		decisionFirstColumn: 'Model',
	});
}
