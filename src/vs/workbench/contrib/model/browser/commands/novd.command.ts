/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IScaffoldPanel } from './scaffold.command.js';
import { NOVD_METADATA } from '../webviews/novd.data.js';
import { getNovdHtml } from '../webviews/novd.template.js';

export const NOVD_PANEL: IScaffoldPanel = {
	id: 'novd',
	viewType: 'pollis.novd',
	title: 'Novelty Detection',
	data: NOVD_METADATA.novd,
	html: getNovdHtml,
};
