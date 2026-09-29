/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { DSGE_METADATA } from './dsge.data.js';
import { buildScaffoldHtml } from './scaffoldParts.js';

export function getDsgeHtml(): string {
	return buildScaffoldHtml('dsge', DSGE_METADATA.dsge, {
		title: 'DSGE Models',
		defaultModel: 'mom',
		decisionFirstColumn: 'Mode',
	});
}
