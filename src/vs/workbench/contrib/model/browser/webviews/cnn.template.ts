/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { CNN_METADATA } from './cnn.data.js';
import { buildScaffoldHtml } from './scaffoldParts.js';

export function getCnnHtml(): string {
	return buildScaffoldHtml('cnn', CNN_METADATA.cnn, {
		title: 'Convolutional Neural Networks',
		defaultModel: 'conv1d',
		decisionFirstColumn: 'Architecture',
	});
}
