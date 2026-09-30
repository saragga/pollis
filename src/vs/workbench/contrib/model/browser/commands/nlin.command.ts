/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IScaffoldPanel } from './scaffold.command.js';
import { NLIN_METADATA } from '../webviews/nlin.data.js';
import { getNlinHtml } from '../webviews/nlin.template.js';

export const NLIN_PANEL: IScaffoldPanel = {
	id: 'nlin',
	viewType: 'pollis.nlin',
	title: 'Nonlinear Systems',
	data: NLIN_METADATA.nlin,
	html: getNlinHtml,
};
