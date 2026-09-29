/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IScaffoldPanel } from './scaffold.command.js';
import { MARL_METADATA } from '../webviews/marl.data.js';
import { getMarlHtml } from '../webviews/marl.template.js';

export const MARL_PANEL: IScaffoldPanel = {
	id: 'marl',
	viewType: 'pollis.marl',
	title: 'Multi-Agent Reinforcement Learning',
	data: MARL_METADATA.marl,
	html: getMarlHtml,
};
