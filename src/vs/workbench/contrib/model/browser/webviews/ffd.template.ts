/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { FFD_METADATA } from './ffd.data.js';
import { buildScaffoldHtml } from './scaffoldParts.js';

export function getFfdHtml(): string {
	return buildScaffoldHtml('ffd', FFD_METADATA.ffd, {
		title: 'Kenneth French Data Library',
		defaultModel: 'factors3',
		decisionFirstColumn: 'Task',
	});
}
