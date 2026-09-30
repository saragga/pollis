/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { ATSF_METADATA } from './atsf.data.js';
import { buildScaffoldHtml } from './scaffoldParts.js';

export function getAtsfHtml(): string {
	return buildScaffoldHtml('atsf', ATSF_METADATA.atsf, {
		title: 'Advanced Time-Series Forecasting',
		defaultModel: 'bats',
		decisionFirstColumn: 'Model',
	});
}
