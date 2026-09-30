/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IScaffoldPanel } from './scaffold.command.js';
import { DTSV_METADATA } from '../webviews/dtsv.data.js';
import { getDtsvHtml } from '../webviews/dtsv.template.js';

export const DTSV_PANEL: IScaffoldPanel = {
	id: 'dtsv',
	viewType: 'pollis.dtsv',
	title: 'Discrete-Time Stochastic Volatility Models',
	data: DTSV_METADATA.dtsv,
	html: getDtsvHtml,
};
