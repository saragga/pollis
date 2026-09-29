/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IScaffoldPanel } from './scaffold.command.js';
import { MPC_METADATA } from '../webviews/mpc.data.js';
import { getMpcHtml } from '../webviews/mpc.template.js';

export const MPC_PANEL: IScaffoldPanel = {
	id: 'mpc',
	viewType: 'pollis.mpc',
	title: 'Model Predictive Control',
	data: MPC_METADATA.mpc,
	html: getMpcHtml,
};
