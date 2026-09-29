/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IScaffoldPanel } from './scaffold.command.js';
import { AUTOENCODER_METADATA } from '../webviews/autoencoder.data.js';
import { getAutoencoderHtml } from '../webviews/autoencoder.template.js';

export const AUTOENCODER_PANEL: IScaffoldPanel = {
	id: 'autoencoder',
	viewType: 'pollis.autoencoder',
	title: 'Autoencoders',
	data: AUTOENCODER_METADATA.autoencoder,
	html: getAutoencoderHtml,
};
