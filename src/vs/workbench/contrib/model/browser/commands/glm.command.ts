/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IScaffoldPanel } from './scaffold.command.js';
import { GLM_METADATA } from '../webviews/glm.data.js';
import { getGlmHtml } from '../webviews/glm.template.js';

export const GLM_PANEL: IScaffoldPanel = {
	id: 'glm',
	viewType: 'pollis.glm',
	title: 'Generalized Linear Models',
	data: GLM_METADATA.glm,
	html: getGlmHtml,
};
