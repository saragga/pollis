/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { DIST_METADATA } from './dist.data.js';
import { buildScaffoldHtml } from './scaffoldParts.js';

export function getDistHtml(): string {
	return buildScaffoldHtml('dist', DIST_METADATA.dist, {
		title: 'Distribution Functions',
		defaultModel: 'discrete',
		decisionFirstColumn: 'Type',
	});
}
