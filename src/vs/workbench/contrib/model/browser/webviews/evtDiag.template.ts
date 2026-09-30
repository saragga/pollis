/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { EVTDIAG_METADATA } from './evtDiag.data.js';
import { buildScaffoldHtml } from './scaffoldParts.js';

export function getEvtDiagHtml(): string {
	return buildScaffoldHtml('evtDiag', EVTDIAG_METADATA.evtDiag, {
		title: 'Extreme Value Diagnostics',
		defaultModel: 'me',
		decisionFirstColumn: 'Model',
	});
}
