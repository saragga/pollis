/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IScaffoldPanel } from './scaffold.command.js';
import { ATSF_METADATA } from '../webviews/atsf.data.js';
import { getAtsfHtml } from '../webviews/atsf.template.js';

export const ATSF_PANEL: IScaffoldPanel = {
	id: 'atsf',
	viewType: 'pollis.atsf',
	title: 'Advanced Time-Series Forecasting',
	data: ATSF_METADATA.atsf,
	html: getAtsfHtml,
};
