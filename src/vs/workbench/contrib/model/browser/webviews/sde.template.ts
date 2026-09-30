/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { SDE_METADATA } from './sde.data.js';
import { buildScaffoldHtml } from './scaffoldParts.js';

export function getSdeHtml(): string {
	return buildScaffoldHtml('sde', SDE_METADATA.sde, {
		title: 'Diffusion Processes',
		defaultModel: 'add',
		decisionFirstColumn: 'Method',
	});
}
