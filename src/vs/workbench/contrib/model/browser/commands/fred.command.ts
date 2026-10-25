/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IScaffoldPanel } from './scaffold.command.js';
import { CREDENTIALS } from '../common/credentials.js';
import { FRED_METADATA } from '../webviews/fred.data.js';
import { getFredHtml } from '../webviews/fred.template.js';

export const FRED_PANEL: IScaffoldPanel = {
	id: 'fred',
	viewType: 'pollis.fred',
	title: 'FRED',
	data: FRED_METADATA.fred,
	html: () => getFredHtml(FRED_METADATA),
	apiKey: { label: 'FRED', fields: [{ ...CREDENTIALS.fred, prompt: 'FRED API key' }] },
};
