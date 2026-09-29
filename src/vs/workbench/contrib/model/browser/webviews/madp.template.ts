/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { MADP_METADATA } from './madp.data.js';
import { buildScaffoldHtml } from './scaffoldParts.js';

export function getMadpHtml(): string {
	return buildScaffoldHtml('madp', MADP_METADATA.madp, {
		title: 'Multi-Agent Decision Processes',
		defaultModel: 'dec',
		decisionFirstColumn: 'Process',
	});
}
