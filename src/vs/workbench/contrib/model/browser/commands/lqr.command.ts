/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IScaffoldPanel } from './scaffold.command.js';
import { LQR_METADATA } from '../webviews/lqr.data.js';
import { getLqrHtml } from '../webviews/lqr.template.js';

export const LQR_PANEL: IScaffoldPanel = {
	id: 'lqr',
	viewType: 'pollis.lqr',
	title: 'Linear Optimal Control',
	data: LQR_METADATA.lqr,
	html: getLqrHtml,
};
