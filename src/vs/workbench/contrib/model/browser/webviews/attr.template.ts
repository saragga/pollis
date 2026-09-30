/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { ATTR_METADATA } from './attr.data.js';
import { buildScaffoldHtml } from './scaffoldParts.js';

export function getAttrHtml(): string {
	return buildScaffoldHtml('attr', ATTR_METADATA.attr, {
		title: 'Attractor & Basin Analysis',
		defaultModel: 'attract',
		decisionFirstColumn: 'Model',
	});
}
