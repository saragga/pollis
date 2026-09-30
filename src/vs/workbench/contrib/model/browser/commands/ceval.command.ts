/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IScaffoldPanel } from './scaffold.command.js';
import { CEVAL_METADATA } from '../webviews/ceval.data.js';
import { getCevalHtml } from '../webviews/ceval.template.js';

export const CEVAL_PANEL: IScaffoldPanel = {
	id: 'ceval',
	viewType: 'pollis.ceval',
	title: 'Copula Evaluation',
	data: CEVAL_METADATA.ceval,
	html: getCevalHtml,
};
