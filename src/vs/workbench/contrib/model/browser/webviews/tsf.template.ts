/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { TSF_METADATA } from './tsf.data.js';
import { buildScaffoldHtml } from './scaffoldParts.js';

export function getTsfHtml(): string {
	return buildScaffoldHtml('tsf', TSF_METADATA.tsf, {
		title: 'Time-Series Forecasting',
		defaultModel: 'local',
		decisionFirstColumn: 'Model',
	});
}
