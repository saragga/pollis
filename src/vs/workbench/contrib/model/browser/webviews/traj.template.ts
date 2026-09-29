/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { TRAJ_METADATA } from './traj.data.js';
import { buildScaffoldHtml } from './scaffoldParts.js';

export function getTrajHtml(): string {
	return buildScaffoldHtml('traj', TRAJ_METADATA.traj, {
		title: 'Trajectory Optimisation',
		defaultModel: 'direct',
		decisionFirstColumn: 'Method',
	});
}
