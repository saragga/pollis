/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { RVOL_METADATA } from './rvol.data.js';
import { buildScaffoldHtml } from './scaffoldParts.js';

export function getRvolHtml(): string {
	return buildScaffoldHtml('rvol', RVOL_METADATA.rvol, {
		title: 'Range-Based Volatility Estimation',
		defaultModel: 'yz',
		decisionFirstColumn: 'Estimator',
	});
}
