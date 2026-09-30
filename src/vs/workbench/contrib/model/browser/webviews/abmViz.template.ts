/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { ABMVIZ_METADATA } from './abmViz.data.js';
import { buildScaffoldHtml } from './scaffoldParts.js';

export function getAbmVizHtml(): string {
	return buildScaffoldHtml('abmViz', ABMVIZ_METADATA.abmViz, {
		title: 'ABM Visualisation',
		defaultModel: 'static',
		decisionFirstColumn: 'Model',
	});
}
