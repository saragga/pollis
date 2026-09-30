/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IScaffoldPanel } from './scaffold.command.js';
import { TSF_METADATA } from '../webviews/tsf.data.js';
import { getTsfHtml } from '../webviews/tsf.template.js';

export const TSF_PANEL: IScaffoldPanel = {
	id: 'tsf',
	viewType: 'pollis.tsf',
	title: 'Time-Series Forecasting',
	data: TSF_METADATA.tsf,
	html: getTsfHtml,
};
