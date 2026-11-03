/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IScaffoldPanel } from './scaffold.command.js';
import { NLMM_METADATA } from '../webviews/nlmm.data.js';
import { getNlmmHtml } from '../webviews/nlmm.template.js';

export const NLMM_PANEL: IScaffoldPanel = {
	id: 'nlmm',
	viewType: 'pollis.nlmm',
	title: 'Nonlinear Mixed Models',
	data: NLMM_METADATA.nlmm,
	html: getNlmmHtml,
};
