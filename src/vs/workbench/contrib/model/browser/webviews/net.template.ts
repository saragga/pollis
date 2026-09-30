/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { NET_METADATA } from './net.data.js';
import { buildScaffoldHtml } from './scaffoldParts.js';

export function getNetHtml(): string {
	return buildScaffoldHtml('net', NET_METADATA.net, {
		title: 'Network Analysis',
		defaultModel: 'erdos',
		decisionFirstColumn: 'Model',
	});
}
