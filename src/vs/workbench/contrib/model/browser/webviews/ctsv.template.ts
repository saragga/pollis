/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { CTSV_METADATA } from './ctsv.data.js';
import { buildScaffoldHtml } from './scaffoldParts.js';

export function getCtsvHtml(): string {
	return buildScaffoldHtml('ctsv', CTSV_METADATA.ctsv, {
		title: 'Continuous-Time Stochastic Volatility',
		defaultModel: 'heston',
		decisionFirstColumn: 'Model',
	});
}
