/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IScaffoldPanel } from './scaffold.command.js';
import { EVTDIAG_METADATA } from '../webviews/evtDiag.data.js';
import { getEvtDiagHtml } from '../webviews/evtDiag.template.js';

export const EVTDIAG_PANEL: IScaffoldPanel = {
	id: 'evtDiag',
	viewType: 'pollis.evtDiag',
	title: 'Extreme Value Diagnostics',
	data: EVTDIAG_METADATA.evtDiag,
	html: getEvtDiagHtml,
};
