/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IScaffoldPanel } from './scaffold.command.js';
import { AUTOTSF_METADATA } from '../webviews/autotsf.data.js';
import { getAutotsfHtml } from '../webviews/autotsf.template.js';

export const AUTOTSF_PANEL: IScaffoldPanel = {
	id: 'autotsf',
	viewType: 'pollis.autotsf',
	title: 'Automatic Time-Series Forecasting',
	data: AUTOTSF_METADATA.autotsf,
	html: getAutotsfHtml,
};
