/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IScaffoldPanel } from './scaffold.command.js';
import { MDP_METADATA } from '../webviews/mdp.data.js';
import { getMdpHtml } from '../webviews/mdp.template.js';

export const MDP_PANEL: IScaffoldPanel = {
	id: 'mdp',
	viewType: 'pollis.mdp',
	title: 'Single-Agent Decision Processes',
	data: MDP_METADATA.mdp,
	html: getMdpHtml,
};
