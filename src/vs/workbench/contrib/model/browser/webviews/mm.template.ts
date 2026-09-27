/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { MM_METADATA } from './mm.data.js';
import { buildScaffoldHtml } from './scaffoldParts.js';

export function getMmHtml(): string {
	return buildScaffoldHtml('mm', MM_METADATA.mm, {
		title: 'Mixed-Effects Models',
		defaultModel: 'lmm',
		decisionFirstColumn: 'Model',
	});
}
