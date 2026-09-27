/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { LM_METADATA } from './lm.data.js';
import { buildScaffoldHtml } from './scaffoldParts.js';

export function getLmHtml(): string {
	return buildScaffoldHtml('lm', LM_METADATA.lm, {
		title: 'Linear Regression',
		defaultModel: 'ols',
		decisionFirstColumn: 'Estimator',
	});
}
