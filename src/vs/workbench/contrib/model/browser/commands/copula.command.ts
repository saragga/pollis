/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IScaffoldPanel } from './scaffold.command.js';
import { COPULA_METADATA } from '../webviews/copula.data.js';
import { getCopulaHtml } from '../webviews/copula.template.js';

export const COPULA_PANEL: IScaffoldPanel = {
	id: 'copula',
	viewType: 'pollis.copula',
	title: 'Copula Estimation',
	data: COPULA_METADATA.copula,
	html: getCopulaHtml,
};
