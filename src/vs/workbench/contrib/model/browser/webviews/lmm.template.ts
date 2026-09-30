/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { LMM_METADATA } from './lmm.data.js';
import { buildScaffoldHtml } from './scaffoldParts.js';

export function getLmmHtml(): string {
	return buildScaffoldHtml('lmm', LMM_METADATA.lmm, {
		title: 'Linear Mixed-Effects Models',
		defaultModel: 'lmm',
		decisionFirstColumn: 'Model',
	});
}
