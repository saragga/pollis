/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IScaffoldPanel } from './scaffold.command.js';
import { NLLS_METADATA } from '../webviews/nlls.data.js';
import { getNllsHtml } from '../webviews/nlls.template.js';

export const NLLS_PANEL: IScaffoldPanel = {
	id: 'nlls',
	viewType: 'pollis.nlls',
	title: 'Nonlinear Least Squares',
	data: NLLS_METADATA.nlls,
	html: getNllsHtml,
};
