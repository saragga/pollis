/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { GLMM_METADATA } from './glmm.data.js';
import { buildScaffoldHtml } from './scaffoldParts.js';

export function getGlmmHtml(): string {
	return buildScaffoldHtml('glmm', GLMM_METADATA.glmm, {
		title: 'Generalized Linear Mixed-Effects Models',
		defaultModel: 'main',
		decisionFirstColumn: 'Model',
	});
}
