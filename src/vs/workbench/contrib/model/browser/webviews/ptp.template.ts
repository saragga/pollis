/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { PTP_METADATA } from './ptp.data.js';
import { buildScaffoldHtml } from './scaffoldParts.js';

export function getPtpHtml(): string {
	return buildScaffoldHtml('ptp', PTP_METADATA.ptp, {
		title: 'Point Processes',
		defaultModel: 'poisson',
		decisionFirstColumn: 'Model',
	});
}
