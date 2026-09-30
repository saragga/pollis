/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IScaffoldPanel } from './scaffold.command.js';
import { TSLS_METADATA } from '../webviews/tsls.data.js';
import { getTslsHtml } from '../webviews/tsls.template.js';

export const TSLS_PANEL: IScaffoldPanel = {
	id: 'tsls',
	viewType: 'pollis.tsls',
	title: 'Two-Stage Least Squares (2SLS)',
	data: TSLS_METADATA.tsls,
	html: getTslsHtml,
};
