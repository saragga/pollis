/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { UP_METADATA } from './up.data.js';
import { buildScaffoldHtml } from './scaffoldParts.js';

export function getUpHtml(): string {
	return buildScaffoldHtml('up', UP_METADATA.up, {
		title: 'Uncertainty Propagation',
		defaultModel: 'main',
		decisionFirstColumn: 'Model',
	});
}
