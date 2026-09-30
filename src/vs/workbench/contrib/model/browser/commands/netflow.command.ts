/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IScaffoldPanel } from './scaffold.command.js';
import { NETFLOW_METADATA } from '../webviews/netflow.data.js';
import { getNetflowHtml } from '../webviews/netflow.template.js';

export const NETFLOW_PANEL: IScaffoldPanel = {
	id: 'netflow',
	viewType: 'pollis.netflow',
	title: 'Network Flows',
	data: NETFLOW_METADATA.netflow,
	html: getNetflowHtml,
};
