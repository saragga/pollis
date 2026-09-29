/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IScaffoldPanel } from './scaffold.command.js';
import { GT_METADATA } from '../webviews/gt.data.js';
import { getGtHtml } from '../webviews/gt.template.js';

export const GT_PANEL: IScaffoldPanel = {
	id: 'gt',
	viewType: 'pollis.gt',
	title: 'Game Theory',
	data: GT_METADATA.gt,
	html: getGtHtml,
};
