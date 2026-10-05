/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { GLM_METADATA } from './glm.data.js';
import { buildScaffoldHtml } from './scaffoldParts.js';

export function getGlmHtml(): string {
	return buildScaffoldHtml('glm', GLM_METADATA.glm, {
		title: 'Generalized Linear Models',
		defaultModel: 'Bernoulli',
		decisionFirstColumn: 'Family',
	});
}
