/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { LASSO_METADATA } from './lasso.data.js';
import { buildScaffoldHtml } from './scaffoldParts.js';

export function getLassoHtml(): string {
	return buildScaffoldHtml('lasso', LASSO_METADATA.lasso, {
		title: 'Penalised & Projection Regression',
		defaultModel: 'lasso',
		decisionFirstColumn: 'Model',
	});
}
