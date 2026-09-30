/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { ADLP_METADATA } from './adlp.data.js';
import { buildScaffoldHtml } from './scaffoldParts.js';

export function getAdlpHtml(): string {
	return buildScaffoldHtml('adlp', ADLP_METADATA.adlp, {
		title: 'AD Log-Likelihood',
		defaultModel: 'dist',
		decisionFirstColumn: 'Model',
	});
}
