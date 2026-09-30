/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IScaffoldPanel } from './scaffold.command.js';
import { LASSO_METADATA } from '../webviews/lasso.data.js';
import { getLassoHtml } from '../webviews/lasso.template.js';

export const LASSO_PANEL: IScaffoldPanel = {
	id: 'lasso',
	viewType: 'pollis.lasso',
	title: 'Penalised & Projection Regression',
	data: LASSO_METADATA.lasso,
	html: getLassoHtml,
};
