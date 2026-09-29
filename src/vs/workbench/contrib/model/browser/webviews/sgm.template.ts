/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { SGM_METADATA } from './sgm.data.js';
import { buildScaffoldHtml } from './scaffoldParts.js';

export function getSgmHtml(): string {
	return buildScaffoldHtml('sgm', SGM_METADATA.sgm, {
		title: 'Stochastic Gradient Methods',
		defaultModel: 'sgd',
		decisionFirstColumn: 'Method',
	});
}
