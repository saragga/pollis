/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IScaffoldPanel } from './scaffold.command.js';
import { MPNLP_METADATA } from '../webviews/mpnlp.data.js';
import { getMpnlpHtml } from '../webviews/mpnlp.template.js';

export const MPNLP_PANEL: IScaffoldPanel = {
	id: 'mpnlp',
	viewType: 'pollis.mpnlp',
	title: 'Nonlinear Programming',
	data: MPNLP_METADATA.mpnlp,
	html: getMpnlpHtml,
};
