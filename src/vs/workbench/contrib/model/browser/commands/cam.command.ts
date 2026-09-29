/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IScaffoldPanel } from './scaffold.command.js';
import { CAM_METADATA } from '../webviews/cam.data.js';
import { getCamHtml } from '../webviews/cam.template.js';

export const CAM_PANEL: IScaffoldPanel = {
	id: 'cam',
	viewType: 'pollis.cam',
	title: 'Curvature-Aware Methods',
	data: CAM_METADATA.cam,
	html: getCamHtml,
};
