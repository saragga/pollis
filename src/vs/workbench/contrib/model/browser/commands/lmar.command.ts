/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IScaffoldPanel } from './scaffold.command.js';
import { LMAR_METADATA } from '../webviews/lmar.data.js';
import { getLmarHtml } from '../webviews/lmar.template.js';

export const LMAR_PANEL: IScaffoldPanel = {
	id: 'lmar',
	viewType: 'pollis.lmar',
	title: 'Linear Models with Autocorrelation',
	data: LMAR_METADATA.lmar,
	html: getLmarHtml,
};
