/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { LMAR_METADATA } from './lmar.data.js';
import { buildScaffoldHtml } from './scaffoldParts.js';

export function getLmarHtml(): string {
	return buildScaffoldHtml('lmar', LMAR_METADATA.lmar, {
		title: 'Linear Models with Autocorrelation',
		defaultModel: 'pw2step',
		decisionFirstColumn: 'Estimator',
	});
}
