/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { BNDT_METADATA } from './bndt.data.js';
import { buildScaffoldHtml } from './scaffoldParts.js';

export function getBndtHtml(): string {
	return buildScaffoldHtml('bndt', BNDT_METADATA.bndt, {
		title: 'Bandit Problems',
		defaultModel: 'egreedy',
		decisionFirstColumn: 'Algorithm',
	});
}
