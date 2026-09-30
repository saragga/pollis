/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IScaffoldPanel } from './scaffold.command.js';
import { NNLS_METADATA } from '../webviews/nnls.data.js';
import { getNnlsHtml } from '../webviews/nnls.template.js';

export const NNLS_PANEL: IScaffoldPanel = {
	id: 'nnls',
	viewType: 'pollis.nnls',
	title: 'Non-Negative Least Squares (NNLS)',
	data: NNLS_METADATA.nnls,
	html: getNnlsHtml,
};
