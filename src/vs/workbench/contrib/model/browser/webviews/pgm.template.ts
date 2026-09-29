/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { PGM_METADATA } from './pgm.data.js';
import { buildScaffoldHtml } from './scaffoldParts.js';

export function getPgmHtml(): string {
	return buildScaffoldHtml('pgm', PGM_METADATA.pgm, {
		title: 'Policy Gradient Methods',
		defaultModel: 'reinforce',
		decisionFirstColumn: 'Method',
	});
}
