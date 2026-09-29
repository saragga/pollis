/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IScaffoldPanel } from './scaffold.command.js';
import { GNN_METADATA } from '../webviews/gnn.data.js';
import { getGnnHtml } from '../webviews/gnn.template.js';

export const GNN_PANEL: IScaffoldPanel = {
	id: 'gnn',
	viewType: 'pollis.gnn',
	title: 'Graph Neural Networks',
	data: GNN_METADATA.gnn,
	html: getGnnHtml,
};
