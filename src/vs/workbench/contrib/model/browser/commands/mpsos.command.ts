/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IScaffoldPanel } from './scaffold.command.js';
import { MPSOS_METADATA } from '../webviews/mpsos.data.js';
import { getMpsosHtml } from '../webviews/mpsos.template.js';

export const MPSOS_PANEL: IScaffoldPanel = {
	id: 'mpsos',
	viewType: 'pollis.mpsos',
	title: 'Polynomial Programming',
	data: MPSOS_METADATA.mpsos,
	html: getMpsosHtml,
};
