/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { DTSV_METADATA } from './dtsv.data.js';
import { buildScaffoldHtml } from './scaffoldParts.js';

export function getDtsvHtml(): string {
	return buildScaffoldHtml('dtsv', DTSV_METADATA.dtsv, {
		title: 'Discrete-Time Stochastic Volatility Models',
		defaultModel: 'basic',
		decisionFirstColumn: 'Model',
	});
}
