/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IScaffoldPanel } from './scaffold.command.js';
import { HARE_METADATA } from '../webviews/hare.data.js';
import { getHareHtml } from '../webviews/hare.template.js';

export const HARE_PANEL: IScaffoldPanel = {
	id: 'hare',
	viewType: 'pollis.hare',
	title: 'Linear Models with Heteroskedasticity',
	data: HARE_METADATA.hare,
	html: getHareHtml,
};
