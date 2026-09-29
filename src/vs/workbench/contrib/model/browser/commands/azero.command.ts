/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IScaffoldPanel } from './scaffold.command.js';
import { AZERO_METADATA } from '../webviews/azero.data.js';
import { getAzeroHtml } from '../webviews/azero.template.js';

export const AZERO_PANEL: IScaffoldPanel = {
	id: 'azero',
	viewType: 'pollis.azero',
	title: 'AlphaZero',
	data: AZERO_METADATA.azero,
	html: getAzeroHtml,
};
