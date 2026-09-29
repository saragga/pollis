/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { ACM_METADATA } from './acm.data.js';
import { buildScaffoldHtml } from './scaffoldParts.js';

export function getAcmHtml(): string {
	return buildScaffoldHtml('acm', ACM_METADATA.acm, {
		title: 'Actor-Critic Methods',
		defaultModel: 'a2c',
		decisionFirstColumn: 'Method',
	});
}
