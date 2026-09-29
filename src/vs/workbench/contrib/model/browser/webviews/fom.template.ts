/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { FOM_METADATA } from './fom.data.js';
import { buildScaffoldHtml } from './scaffoldParts.js';

export function getFomHtml(): string {
	return buildScaffoldHtml('fom', FOM_METADATA.fom, {
		title: 'First-Order Methods',
		defaultModel: 'sgd',
		decisionFirstColumn: 'Rule',
	});
}
