/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { ODEBAYES_METADATA } from './odebayes.data.js';
import { buildScaffoldHtml } from './scaffoldParts.js';

export function getOdebayesHtml(): string {
	return buildScaffoldHtml('odebayes', ODEBAYES_METADATA.odebayes, {
		title: 'Bayesian Inference for ODEs',
		defaultModel: 'nuts',
		decisionFirstColumn: 'Sampler',
	});
}
