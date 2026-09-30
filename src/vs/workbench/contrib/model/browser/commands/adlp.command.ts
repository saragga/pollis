/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IScaffoldPanel } from './scaffold.command.js';
import { ADLP_METADATA } from '../webviews/adlp.data.js';
import { getAdlpHtml } from '../webviews/adlp.template.js';

export const ADLP_PANEL: IScaffoldPanel = {
	id: 'adlp',
	viewType: 'pollis.adlp',
	title: 'AD Log-Likelihood',
	data: ADLP_METADATA.adlp,
	html: getAdlpHtml,
};
