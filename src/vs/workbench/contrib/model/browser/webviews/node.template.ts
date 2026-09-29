/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { NODE_METADATA } from './node.data.js';
import { buildScaffoldHtml } from './scaffoldParts.js';

export function getNodeHtml(): string {
	return buildScaffoldHtml('node', NODE_METADATA.node, {
		title: 'Neural ODEs for System Identification',
		defaultModel: 'node',
		decisionFirstColumn: 'Model',
	});
}
