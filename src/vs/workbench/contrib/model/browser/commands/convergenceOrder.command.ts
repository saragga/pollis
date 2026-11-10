/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IScaffoldPanel } from './scaffold.command.js';
import { CONVERGENCEORDER_METADATA } from '../webviews/convergenceOrder.data.js';
import { getConvergenceOrderHtml } from '../webviews/convergenceOrder.template.js';

export const CONVERGENCEORDER_PANEL: IScaffoldPanel = {
	id: 'convergenceOrder',
	viewType: 'pollis.convergenceOrder',
	title: 'Check a Convergence Order',
	data: CONVERGENCEORDER_METADATA.convergenceOrder,
	html: getConvergenceOrderHtml,
};
