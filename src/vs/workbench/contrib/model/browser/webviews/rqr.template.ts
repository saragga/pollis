/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { RQR_METADATA } from './rqr.data.js';
import { buildScaffoldHtml } from './scaffoldParts.js';

export function getRqrHtml(): string {
	return buildScaffoldHtml('rqr', RQR_METADATA.rqr, {
		title: 'Robust and Quantile Regression',
		defaultModel: 'robust',
		decisionFirstColumn: 'Model',
	});
}
