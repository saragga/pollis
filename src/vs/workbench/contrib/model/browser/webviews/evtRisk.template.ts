/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { EVTRISK_METADATA } from './evtRisk.data.js';
import { buildScaffoldHtml } from './scaffoldParts.js';

export function getEvtRiskHtml(): string {
	return buildScaffoldHtml('evtRisk', EVTRISK_METADATA.evtRisk, {
		title: 'Extreme Value Risk Measures',
		defaultModel: 'rl',
		decisionFirstColumn: 'Model',
	});
}
