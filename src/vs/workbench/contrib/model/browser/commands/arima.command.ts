/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IScaffoldPanel } from './scaffold.command.js';
import { ARIMA_METADATA } from '../webviews/arima.data.js';
import { getArimaHtml } from '../webviews/arima.template.js';

export const ARIMA_PANEL: IScaffoldPanel = {
	id: 'arima',
	viewType: 'pollis.arima',
	title: 'ARIMA Models',
	data: ARIMA_METADATA.arima,
	html: getArimaHtml,
};
