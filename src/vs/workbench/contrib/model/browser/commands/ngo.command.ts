/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IScaffoldPanel } from './scaffold.command.js';
import { NGO_METADATA } from '../webviews/ngo.data.js';
import { getNgoHtml } from '../webviews/ngo.template.js';

export const NGO_PANEL: IScaffoldPanel = {
	id: 'ngo',
	viewType: 'pollis.ngo',
	title: 'Network and Graph Optimisation',
	data: NGO_METADATA.ngo,
	html: getNgoHtml,
};
