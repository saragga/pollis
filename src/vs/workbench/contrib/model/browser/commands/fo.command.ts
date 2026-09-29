/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IScaffoldPanel } from './scaffold.command.js';
import { FO_METADATA } from '../webviews/fo.data.js';
import { getFoHtml } from '../webviews/fo.template.js';

export const FO_PANEL: IScaffoldPanel = {
	id: 'fo',
	viewType: 'pollis.fo',
	title: 'First-Order Methods',
	data: FO_METADATA.fo,
	html: getFoHtml,
};
