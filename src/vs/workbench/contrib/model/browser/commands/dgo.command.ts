/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IScaffoldPanel } from './scaffold.command.js';
import { DGO_METADATA } from '../webviews/dgo.data.js';
import { getDgoHtml } from '../webviews/dgo.template.js';

export const DGO_PANEL: IScaffoldPanel = {
	id: 'dgo',
	viewType: 'pollis.dgo',
	title: 'Deterministic Global Methods',
	data: DGO_METADATA.dgo,
	html: getDgoHtml,
};
