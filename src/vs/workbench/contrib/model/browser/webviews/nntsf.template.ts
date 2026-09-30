/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { NNTSF_METADATA } from './nntsf.data.js';
import { buildScaffoldHtml } from './scaffoldParts.js';

export function getNntsfHtml(): string {
	return buildScaffoldHtml('nntsf', NNTSF_METADATA.nntsf, {
		title: 'Neural Network Time-Series Forecasting',
		defaultModel: 'lstnet',
		decisionFirstColumn: 'Model',
	});
}
