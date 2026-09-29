/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { COVSHRINKAGE_METADATA } from './covShrinkage.data.js';
import { buildScaffoldHtml } from './scaffoldParts.js';

export function getCovShrinkageHtml(): string {
	return buildScaffoldHtml('covShrinkage', COVSHRINKAGE_METADATA.covShrinkage, {
		title: 'Regularised Covariance Estimation',
		defaultModel: 'linear',
		decisionFirstColumn: 'Estimator',
	});
}
