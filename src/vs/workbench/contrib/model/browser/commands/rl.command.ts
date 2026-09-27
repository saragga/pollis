/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IScaffoldPanel } from './scaffold.command.js';
import { RL_METADATA } from '../webviews/rl.data.js';
import { getRlHtml } from '../webviews/rl.template.js';

export const RL_PANEL: IScaffoldPanel = {
	id: 'rl',
	viewType: 'pollis.rl',
	title: 'Recurrent Layers',
	data: RL_METADATA.rl,
	html: getRlHtml,
};
