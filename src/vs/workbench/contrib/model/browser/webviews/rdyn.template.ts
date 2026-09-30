/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { RDYN_METADATA } from './rdyn.data.js';
import { buildScaffoldHtml } from './scaffoldParts.js';

export function getRdynHtml(): string {
	return buildScaffoldHtml('rdyn', RDYN_METADATA.rdyn, {
		title: 'Robot Dynamics',
		defaultModel: 'rot',
		decisionFirstColumn: 'Model',
	});
}
