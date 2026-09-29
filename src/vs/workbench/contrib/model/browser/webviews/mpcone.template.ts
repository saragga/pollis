/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { MPCONE_METADATA } from './mpcone.data.js';
import { buildScaffoldHtml } from './scaffoldParts.js';

export function getMpconeHtml(): string {
	return buildScaffoldHtml('mpcone', MPCONE_METADATA.mpcone, {
		title: 'Conic Programming',
		defaultModel: 'convex',
		decisionFirstColumn: 'Problem',
	});
}
