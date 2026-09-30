/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { DISTSAMPLING_METADATA } from './distSampling.data.js';
import { buildScaffoldHtml } from './scaffoldParts.js';

export function getDistSamplingHtml(): string {
	return buildScaffoldHtml('distSampling', DISTSAMPLING_METADATA.distSampling, {
		title: 'Distribution Sampling',
		defaultModel: 'discrete',
		decisionFirstColumn: 'Model',
	});
}
