/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { GMM_METADATA } from './gmm.data.js';
import { buildScaffoldHtml } from './scaffoldParts.js';

export function getGmmHtml(): string {
	return buildScaffoldHtml('gmm', GMM_METADATA.gmm, {
		title: 'Generalized Method of Moments (GMM)',
		defaultModel: 'main',
		decisionFirstColumn: 'Model',
	});
}
