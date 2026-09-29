/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { LCA_METADATA } from './lca.data.js';
import { buildScaffoldHtml } from './scaffoldParts.js';

export function getLcaHtml(): string {
	return buildScaffoldHtml('lca', LCA_METADATA.lca, {
		title: 'Latent Component Analysis',
		defaultModel: 'pca',
		decisionFirstColumn: 'Method',
	});
}
