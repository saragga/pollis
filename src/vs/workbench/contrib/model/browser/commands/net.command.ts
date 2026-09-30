/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IScaffoldPanel } from './scaffold.command.js';
import { NET_METADATA } from '../webviews/net.data.js';
import { getNetHtml } from '../webviews/net.template.js';

export const NET_PANEL: IScaffoldPanel = {
	id: 'net',
	viewType: 'pollis.net',
	title: 'Network Analysis',
	data: NET_METADATA.net,
	html: getNetHtml,
};
