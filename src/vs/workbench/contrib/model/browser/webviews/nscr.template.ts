/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { NSCR_METADATA } from './nscr.data.js';
import { buildScaffoldHtml } from './scaffoldParts.js';

export function getNscrHtml(): string {
	return buildScaffoldHtml('nscr', NSCR_METADATA.nscr, {
		title: 'Net Survival & Competing Risks',
		defaultModel: 'cif',
		decisionFirstColumn: 'Model',
	});
}
