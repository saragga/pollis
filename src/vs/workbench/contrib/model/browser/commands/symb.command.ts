/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IScaffoldPanel } from './scaffold.command.js';
import { SYMB_METADATA } from '../webviews/symb.data.js';
import { getSymbHtml } from '../webviews/symb.template.js';

export const SYMB_PANEL: IScaffoldPanel = {
	id: 'symb',
	viewType: 'pollis.symb',
	title: 'Symbolic Math',
	data: SYMB_METADATA.symb,
	html: getSymbHtml,
};
