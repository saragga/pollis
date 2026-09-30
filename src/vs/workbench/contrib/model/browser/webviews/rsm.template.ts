/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { RSM_METADATA } from './rsm.data.js';
import { buildScaffoldHtml } from './scaffoldParts.js';

export function getRsmHtml(): string {
	return buildScaffoldHtml('rsm', RSM_METADATA.rsm, {
		title: 'Regime Switching Models',
		defaultModel: 'msm',
		decisionFirstColumn: 'Model',
	});
}
