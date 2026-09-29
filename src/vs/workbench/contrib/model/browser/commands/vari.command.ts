/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IScaffoldPanel } from './scaffold.command.js';
import { VARI_METADATA } from '../webviews/vari.data.js';
import { getVariHtml } from '../webviews/vari.template.js';

export const VARI_PANEL: IScaffoldPanel = {
	id: 'vari',
	viewType: 'pollis.vari',
	title: 'Variational Inequalities',
	data: VARI_METADATA.vari,
	html: getVariHtml,
};
