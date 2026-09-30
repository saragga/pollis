/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { BLSDF_METADATA } from './blsdf.data.js';
import { buildScaffoldHtml } from './scaffoldParts.js';

export function getBlsdfHtml(): string {
	return buildScaffoldHtml('blsdf', BLSDF_METADATA.blsdf, {
		title: 'Bayesian Linear Stochastic Discount Factor',
		defaultModel: 'sdf',
		decisionFirstColumn: 'Model',
	});
}
