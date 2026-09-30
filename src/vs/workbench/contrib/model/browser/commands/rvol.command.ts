/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IScaffoldPanel } from './scaffold.command.js';
import { RVOL_METADATA } from '../webviews/rvol.data.js';
import { getRvolHtml } from '../webviews/rvol.template.js';

export const RVOL_PANEL: IScaffoldPanel = {
	id: 'rvol',
	viewType: 'pollis.rvol',
	title: 'Range-Based Volatility Estimation',
	data: RVOL_METADATA.rvol,
	html: getRvolHtml,
};
