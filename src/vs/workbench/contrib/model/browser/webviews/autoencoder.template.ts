/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { AUTOENCODER_METADATA } from './autoencoder.data.js';
import { buildScaffoldHtml } from './scaffoldParts.js';

export function getAutoencoderHtml(): string {
	return buildScaffoldHtml('autoencoder', AUTOENCODER_METADATA.autoencoder, {
		title: 'Autoencoders',
		defaultModel: 'ae',
		decisionFirstColumn: 'Method',
	});
}
