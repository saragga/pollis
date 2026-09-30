/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { RXINFER_METADATA } from './rxinfer.data.js';
import { buildScaffoldHtml } from './scaffoldParts.js';

export function getRxinferHtml(): string {
	return buildScaffoldHtml('rxinfer', RXINFER_METADATA.rxinfer, {
		title: 'Fast Variational Bayesian Inference',
		defaultModel: 'gaussian',
		decisionFirstColumn: 'Model',
	});
}
