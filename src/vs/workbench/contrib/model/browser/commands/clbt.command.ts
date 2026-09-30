/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IScaffoldPanel } from './scaffold.command.js';
import { CLBT_METADATA } from '../webviews/clbt.data.js';
import { getClbtHtml } from '../webviews/clbt.template.js';

export const CLBT_PANEL: IScaffoldPanel = {
	id: 'clbt',
	viewType: 'pollis.clbt',
	title: 'ColBERT Retrieval',
	data: CLBT_METADATA.clbt,
	html: getClbtHtml,
};
