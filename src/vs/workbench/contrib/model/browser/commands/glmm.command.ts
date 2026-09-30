/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IScaffoldPanel } from './scaffold.command.js';
import { GLMM_METADATA } from '../webviews/glmm.data.js';
import { getGlmmHtml } from '../webviews/glmm.template.js';

export const GLMM_PANEL: IScaffoldPanel = {
	id: 'glmm',
	viewType: 'pollis.glmm',
	title: 'Generalized Linear Mixed-Effects Models',
	data: GLMM_METADATA.glmm,
	html: getGlmmHtml,
};
