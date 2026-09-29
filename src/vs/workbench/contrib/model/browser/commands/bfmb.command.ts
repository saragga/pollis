/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IScaffoldPanel } from './scaffold.command.js';
import { BFMB_METADATA } from '../webviews/bfmb.data.js';
import { getBfmbHtml } from '../webviews/bfmb.template.js';

export const BFMB_PANEL: IScaffoldPanel = {
	id: 'bfmb',
	viewType: 'pollis.bfmb',
	title: 'Fama-MacBeth Regression',
	data: BFMB_METADATA.bfmb,
	html: getBfmbHtml,
};
