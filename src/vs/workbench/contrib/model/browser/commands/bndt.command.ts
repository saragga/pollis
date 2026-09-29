/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IScaffoldPanel } from './scaffold.command.js';
import { BNDT_METADATA } from '../webviews/bndt.data.js';
import { getBndtHtml } from '../webviews/bndt.template.js';

export const BNDT_PANEL: IScaffoldPanel = {
	id: 'bndt',
	viewType: 'pollis.bndt',
	title: 'Bandit Problems',
	data: BNDT_METADATA.bndt,
	html: getBndtHtml,
};
