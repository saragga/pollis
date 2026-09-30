/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { MC_METADATA } from './mc.data.js';
import { buildScaffoldHtml } from './scaffoldParts.js';

export function getMcHtml(): string {
	return buildScaffoldHtml('mc', MC_METADATA.mc, {
		title: 'Model Calibration',
		defaultModel: 'platt',
		decisionFirstColumn: 'Model',
	});
}
