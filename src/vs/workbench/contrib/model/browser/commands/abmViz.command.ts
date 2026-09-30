/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IScaffoldPanel } from './scaffold.command.js';
import { ABMVIZ_METADATA } from '../webviews/abmViz.data.js';
import { getAbmVizHtml } from '../webviews/abmViz.template.js';

export const ABMVIZ_PANEL: IScaffoldPanel = {
	id: 'abmViz',
	viewType: 'pollis.abmViz',
	title: 'ABM Visualisation',
	data: ABMVIZ_METADATA.abmViz,
	html: getAbmVizHtml,
};
