/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IScaffoldPanel } from './scaffold.command.js';
import { CREDENTIALS } from '../common/credentials.js';
import { ALPV_METADATA } from '../webviews/alpv.data.js';
import { getAlpvHtml } from '../webviews/alpv.template.js';

export const ALPV_PANEL: IScaffoldPanel = {
	id: 'alpv',
	viewType: 'pollis.alpv',
	title: 'Alpha Vantage',
	data: ALPV_METADATA.alpv,
	html: () => getAlpvHtml(ALPV_METADATA),
	apiKey: { label: 'Alpha Vantage', fields: [{ ...CREDENTIALS.alphaVantage, prompt: 'Alpha Vantage API key' }] },
};
