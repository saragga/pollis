/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IScaffoldPanel } from './scaffold.command.js';
import { MPMINLP_METADATA } from '../webviews/mpminlp.data.js';
import { getMpminlpHtml } from '../webviews/mpminlp.template.js';

export const MPMINLP_PANEL: IScaffoldPanel = {
	id: 'mpminlp',
	viewType: 'pollis.mpminlp',
	title: 'Mixed-Integer Nonlinear Programming',
	data: MPMINLP_METADATA.mpminlp,
	html: getMpminlpHtml,
};
