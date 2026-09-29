/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IScaffoldPanel } from './scaffold.command.js';
import { TRAJ_METADATA } from '../webviews/traj.data.js';
import { getTrajHtml } from '../webviews/traj.template.js';

export const TRAJ_PANEL: IScaffoldPanel = {
	id: 'traj',
	viewType: 'pollis.traj',
	title: 'Trajectory Optimisation',
	data: TRAJ_METADATA.traj,
	html: getTrajHtml,
};
