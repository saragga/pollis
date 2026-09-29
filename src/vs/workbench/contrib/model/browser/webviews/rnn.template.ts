/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { RNN_METADATA } from './rnn.data.js';
import { buildScaffoldHtml } from './scaffoldParts.js';

export function getRnnHtml(): string {
	return buildScaffoldHtml('rnn', RNN_METADATA.rnn, {
		title: 'Recurrent Neural Networks',
		defaultModel: 'lstm',
		decisionFirstColumn: 'Cell',
	});
}
