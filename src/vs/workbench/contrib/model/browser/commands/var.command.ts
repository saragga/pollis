/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IScaffoldPanel } from './scaffold.command.js';
import { VAR_METADATA } from '../webviews/var.data.js';
import { getVarHtml } from '../webviews/var.template.js';

export const VAR_PANEL: IScaffoldPanel = {
	id: 'var',
	viewType: 'pollis.var',
	title: 'VAR Models',
	data: VAR_METADATA.var,
	html: getVarHtml,
};
