/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IScaffoldPanel } from './scaffold.command.js';
import { SWARM_METADATA } from '../webviews/swarm.data.js';
import { getSwarmHtml } from '../webviews/swarm.template.js';

export const SWARM_PANEL: IScaffoldPanel = {
	id: 'swarm',
	viewType: 'pollis.swarm',
	title: 'Swarm Intelligence',
	data: SWARM_METADATA.swarm,
	html: getSwarmHtml,
};
