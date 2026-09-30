/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IScaffoldPanel } from './scaffold.command.js';
import { CTSV_METADATA } from '../webviews/ctsv.data.js';
import { getCtsvHtml } from '../webviews/ctsv.template.js';

export const CTSV_PANEL: IScaffoldPanel = {
	id: 'ctsv',
	viewType: 'pollis.ctsv',
	title: 'Continuous-Time Stochastic Volatility',
	data: CTSV_METADATA.ctsv,
	html: getCtsvHtml,
};
