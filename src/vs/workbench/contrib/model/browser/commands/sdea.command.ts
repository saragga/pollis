/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IScaffoldPanel } from './scaffold.command.js';
import { SDEA_METADATA } from '../webviews/sdea.data.js';
import { getSdeaHtml } from '../webviews/sdea.template.js';

export const SDEA_PANEL: IScaffoldPanel = {
	id: 'sdea',
	viewType: 'pollis.sdea',
	title: 'SDE Ensemble Analysis',
	data: SDEA_METADATA.sdea,
	html: getSdeaHtml,
};
