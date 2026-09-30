/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IScaffoldPanel } from './scaffold.command.js';
import { MCAT_METADATA } from '../webviews/mcat.data.js';
import { getMcatHtml } from '../webviews/mcat.template.js';

export const MCAT_PANEL: IScaffoldPanel = {
	id: 'mcat',
	viewType: 'pollis.mcat',
	title: 'MeshCat — 3D Visualisation',
	data: MCAT_METADATA.mcat,
	html: getMcatHtml,
};
