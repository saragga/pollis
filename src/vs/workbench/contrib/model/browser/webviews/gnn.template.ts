/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { GNN_METADATA } from './gnn.data.js';
import { buildScaffoldHtml } from './scaffoldParts.js';

export function getGnnHtml(): string {
	return buildScaffoldHtml('gnn', GNN_METADATA.gnn, {
		title: 'Graph Neural Networks',
		defaultModel: 'gcn',
		decisionFirstColumn: 'Architecture',
	});
}
