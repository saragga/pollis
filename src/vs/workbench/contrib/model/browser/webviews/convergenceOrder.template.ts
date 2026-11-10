/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { CONVERGENCEORDER_METADATA } from './convergenceOrder.data.js';
import { buildScaffoldHtml } from './scaffoldParts.js';

export function getConvergenceOrderHtml(): string {
	return buildScaffoldHtml('convergenceOrder', CONVERGENCEORDER_METADATA.convergenceOrder, {
		title: 'Check a Convergence Order',
		defaultModel: 'ode',
		decisionFirstColumn: 'Order',
	});
}
