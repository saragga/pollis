/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { ARIMA_METADATA } from './arima.data.js';
import { buildScaffoldHtml } from './scaffoldParts.js';

export function getArimaHtml(): string {
	return buildScaffoldHtml('arima', ARIMA_METADATA.arima, {
		title: 'ARIMA Models',
		defaultModel: 'arima',
		decisionFirstColumn: 'Model',
	});
}
