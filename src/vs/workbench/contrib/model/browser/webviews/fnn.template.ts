/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { FNN_METADATA } from './fnn.data.js';
import { buildScaffoldHtml } from './scaffoldParts.js';

export function getFnnHtml(): string {
	return buildScaffoldHtml('fnn', FNN_METADATA.fnn, {
		title: 'Feedforward Neural Networks',
		defaultModel: 'mlp',
		decisionFirstColumn: 'Architecture',
	});
}
