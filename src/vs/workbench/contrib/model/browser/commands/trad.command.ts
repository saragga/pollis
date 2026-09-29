/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IScaffoldPanel } from './scaffold.command.js';
import { TRAD_METADATA } from '../webviews/trad.data.js';
import { getTradHtml } from '../webviews/trad.template.js';

export const TRAD_PANEL: IScaffoldPanel = {
	id: 'trad',
	viewType: 'pollis.trad',
	title: 'Trading Agents',
	data: TRAD_METADATA.trad,
	html: getTradHtml,
};
