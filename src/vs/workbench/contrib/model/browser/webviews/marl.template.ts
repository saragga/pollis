/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { MARL_METADATA } from './marl.data.js';
import { buildScaffoldHtml } from './scaffoldParts.js';

export function getMarlHtml(): string {
	return buildScaffoldHtml('marl', MARL_METADATA.marl, {
		title: 'Multi-Agent Reinforcement Learning',
		defaultModel: 'cooperative',
		decisionFirstColumn: 'Setting',
	});
}
