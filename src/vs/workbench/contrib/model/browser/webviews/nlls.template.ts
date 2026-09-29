/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { NLLS_METADATA } from './nlls.data.js';
import { buildScaffoldHtml } from './scaffoldParts.js';

export function getNllsHtml(): string {
	return buildScaffoldHtml('nlls', NLLS_METADATA.nlls, {
		title: 'Nonlinear Least Squares',
		defaultModel: 'lm',
		decisionFirstColumn: 'Method',
	});
}
