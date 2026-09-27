/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IScaffoldPanel } from './scaffold.command.js';
import { MM_METADATA } from '../webviews/mm.data.js';
import { getMmHtml } from '../webviews/mm.template.js';

export const MM_PANEL: IScaffoldPanel = {
	id: 'mm',
	viewType: 'pollis.mm',
	title: 'Mixed-Effects Models',
	data: MM_METADATA.mm,
	html: getMmHtml,
};
