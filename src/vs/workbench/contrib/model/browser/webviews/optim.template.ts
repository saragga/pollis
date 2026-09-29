/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { OPTIM_METADATA } from './optim.data.js';
import { buildScaffoldHtml } from './scaffoldParts.js';

export function getOptimHtml(): string {
	return buildScaffoldHtml('optim', OPTIM_METADATA.optim, {
		title: 'Local Optimisation',
		defaultModel: 'gf',
		decisionFirstColumn: 'Method',
	});
}
