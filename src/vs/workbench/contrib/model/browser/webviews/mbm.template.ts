/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { MBM_METADATA } from './mbm.data.js';
import { buildScaffoldHtml } from './scaffoldParts.js';

export function getMbmHtml(): string {
	return buildScaffoldHtml('mbm', MBM_METADATA.mbm, {
		title: 'Model-Based Methods',
		defaultModel: 'cobyla',
		decisionFirstColumn: 'Method',
	});
}
