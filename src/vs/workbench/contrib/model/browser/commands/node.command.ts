/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IScaffoldPanel } from './scaffold.command.js';
import { NODE_METADATA } from '../webviews/node.data.js';
import { getNodeHtml } from '../webviews/node.template.js';

export const NODE_PANEL: IScaffoldPanel = {
	id: 'node',
	viewType: 'pollis.node',
	title: 'Neural ODEs for System Identification',
	data: NODE_METADATA.node,
	html: getNodeHtml,
};
