/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { LSA_METADATA } from './lsa.data.js';
import { buildScaffoldHtml } from './scaffoldParts.js';

export function getLsaHtml(): string {
	return buildScaffoldHtml('lsa', LSA_METADATA.lsa, {
		title: 'Latent Semantic Analysis',
		defaultModel: 'main',
		decisionFirstColumn: 'Model',
	});
}
