/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IScaffoldPanel } from './scaffold.command.js';
import { NETDYN_METADATA } from '../webviews/netdyn.data.js';
import { getNetdynHtml } from '../webviews/netdyn.template.js';

export const NETDYN_PANEL: IScaffoldPanel = {
	id: 'netdyn',
	viewType: 'pollis.netdyn',
	title: 'Network Dynamics',
	data: NETDYN_METADATA.netdyn,
	html: getNetdynHtml,
};
