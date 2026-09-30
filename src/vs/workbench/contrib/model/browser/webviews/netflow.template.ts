/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { NETFLOW_METADATA } from './netflow.data.js';
import { buildScaffoldHtml } from './scaffoldParts.js';

export function getNetflowHtml(): string {
	return buildScaffoldHtml('netflow', NETFLOW_METADATA.netflow, {
		title: 'Network Flows',
		defaultModel: 'maxflow',
		decisionFirstColumn: 'Model',
	});
}
