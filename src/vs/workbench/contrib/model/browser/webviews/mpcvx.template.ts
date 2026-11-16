/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { MPCVX_METADATA } from './mpcvx.data.js';
import { buildScaffoldHtml } from './scaffoldParts.js';

export function getMpcvxHtml(): string {
	return buildScaffoldHtml('mpcvx', MPCVX_METADATA.mpcvx, {
		title: 'General Convex Programming',
		defaultModel: 'dcp',
		decisionFirstColumn: 'Tab',
	});
}
