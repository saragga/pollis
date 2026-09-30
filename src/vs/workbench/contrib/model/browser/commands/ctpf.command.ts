/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IScaffoldPanel } from './scaffold.command.js';
import { CTPF_METADATA } from '../webviews/ctpf.data.js';
import { getCtpfHtml } from '../webviews/ctpf.template.js';

export const CTPF_PANEL: IScaffoldPanel = {
	id: 'ctpf',
	viewType: 'pollis.ctpf',
	title: 'Collaborative Topic Poisson Factorisation',
	data: CTPF_METADATA.ctpf,
	html: getCtpfHtml,
};
