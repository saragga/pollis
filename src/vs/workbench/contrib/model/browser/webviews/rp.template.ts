/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { RP_METADATA } from './rp.data.js';
import { buildScaffoldHtml } from './scaffoldParts.js';

export function getRpHtml(): string {
	return buildScaffoldHtml('rp', RP_METADATA.rp, {
		title: 'Regression Performance',
		defaultModel: 'main',
		decisionFirstColumn: 'Model',
	});
}
