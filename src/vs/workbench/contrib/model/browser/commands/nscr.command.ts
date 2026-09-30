/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IScaffoldPanel } from './scaffold.command.js';
import { NSCR_METADATA } from '../webviews/nscr.data.js';
import { getNscrHtml } from '../webviews/nscr.template.js';

export const NSCR_PANEL: IScaffoldPanel = {
	id: 'nscr',
	viewType: 'pollis.nscr',
	title: 'Net Survival & Competing Risks',
	data: NSCR_METADATA.nscr,
	html: getNscrHtml,
};
