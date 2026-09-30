/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IScaffoldPanel } from './scaffold.command.js';
import { EVTRISK_METADATA } from '../webviews/evtRisk.data.js';
import { getEvtRiskHtml } from '../webviews/evtRisk.template.js';

export const EVTRISK_PANEL: IScaffoldPanel = {
	id: 'evtRisk',
	viewType: 'pollis.evtRisk',
	title: 'Extreme Value Risk Measures',
	data: EVTRISK_METADATA.evtRisk,
	html: getEvtRiskHtml,
};
