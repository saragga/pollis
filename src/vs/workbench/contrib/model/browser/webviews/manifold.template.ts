/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { MANIFOLD_METADATA } from './manifold.data.js';
import { buildScaffoldHtml } from './scaffoldParts.js';

export function getManifoldHtml(): string {
	return buildScaffoldHtml('manifold', MANIFOLD_METADATA.manifold, {
		title: 'Manifold Learning',
		defaultModel: 'isomap',
		decisionFirstColumn: 'Method',
	});
}
