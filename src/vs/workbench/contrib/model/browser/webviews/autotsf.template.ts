/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { AUTOTSF_METADATA } from './autotsf.data.js';
import { buildScaffoldHtml } from './scaffoldParts.js';

export function getAutotsfHtml(): string {
	return buildScaffoldHtml('autotsf', AUTOTSF_METADATA.autotsf, {
		title: 'Automatic Time-Series Forecasting',
		defaultModel: 'arima',
		decisionFirstColumn: 'Model',
	});
}
