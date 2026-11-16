/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IScaffoldPanel } from './scaffold.command.js';
import { MPGNLP_METADATA } from '../webviews/mpgnlp.data.js';
import { getMpgnlpHtml } from '../webviews/mpgnlp.template.js';

export const MPGNLP_PANEL: IScaffoldPanel = {
	id: 'mpgnlp',
	viewType: 'pollis.mpgnlp',
	title: 'Global Nonlinear Programming',
	data: MPGNLP_METADATA.mpgnlp,
	html: getMpgnlpHtml,
};
