/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { MPC_METADATA } from './mpc.data.js';
import { buildScaffoldHtml } from './scaffoldParts.js';

export function getMpcHtml(): string {
	return buildScaffoldHtml('mpc', MPC_METADATA.mpc, {
		title: 'Model Predictive Control',
		defaultModel: 'linmpc',
		decisionFirstColumn: 'Controller',
	});
}
