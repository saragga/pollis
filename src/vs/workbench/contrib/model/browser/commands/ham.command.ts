/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IScaffoldPanel } from './scaffold.command.js';
import { HAM_METADATA } from '../webviews/ham.data.js';
import { getHamHtml } from '../webviews/ham.template.js';

export const HAM_PANEL: IScaffoldPanel = {
	id: 'ham',
	viewType: 'pollis.ham',
	title: 'Heterogeneous-Agent Models',
	data: HAM_METADATA.ham,
	html: getHamHtml,
};
