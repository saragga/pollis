/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { NETDYN_METADATA } from './netdyn.data.js';
import { buildScaffoldHtml } from './scaffoldParts.js';

export function getNetdynHtml(): string {
	return buildScaffoldHtml('netdyn', NETDYN_METADATA.netdyn, {
		title: 'Network Dynamics',
		defaultModel: 'kuramoto',
		decisionFirstColumn: 'Model',
	});
}
