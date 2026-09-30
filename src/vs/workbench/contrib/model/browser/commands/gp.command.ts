/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IScaffoldPanel } from './scaffold.command.js';
import { GP_METADATA } from '../webviews/gp.data.js';
import { getGpHtml } from '../webviews/gp.template.js';

export const GP_PANEL: IScaffoldPanel = {
	id: 'gp',
	viewType: 'pollis.gp',
	title: 'Generalized Pareto Distribution',
	data: GP_METADATA.gp,
	html: getGpHtml,
};
