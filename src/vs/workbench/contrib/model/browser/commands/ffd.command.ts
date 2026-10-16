/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IScaffoldPanel } from './scaffold.command.js';
import { FFD_METADATA } from '../webviews/ffd.data.js';
import { getFfdHtml } from '../webviews/ffd.template.js';

export const FFD_PANEL: IScaffoldPanel = {
	id: 'ffd',
	viewType: 'pollis.ffd',
	title: 'Kenneth French Data Library',
	data: FFD_METADATA.ffd,
	html: getFfdHtml,
};
