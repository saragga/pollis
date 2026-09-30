/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IScaffoldPanel } from './scaffold.command.js';
import { LMHAR_METADATA } from '../webviews/lmhar.data.js';
import { getLmharHtml } from '../webviews/lmhar.template.js';

export const LMHAR_PANEL: IScaffoldPanel = {
	id: 'lmhar',
	viewType: 'pollis.lmhar',
	title: 'Linear Models with Heteroskedasticity + AR(1)',
	data: LMHAR_METADATA.lmhar,
	html: getLmharHtml,
};
