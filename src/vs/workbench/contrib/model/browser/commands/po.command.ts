/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IScaffoldPanel } from './scaffold.command.js';
import { PO_METADATA } from '../webviews/po.data.js';
import { getPoHtml } from '../webviews/po.template.js';

export const PO_PANEL: IScaffoldPanel = {
	id: 'po',
	viewType: 'pollis.po',
	title: 'Portfolio Optimisation',
	data: PO_METADATA.po,
	html: getPoHtml,
};
