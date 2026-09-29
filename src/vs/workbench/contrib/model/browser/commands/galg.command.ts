/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IScaffoldPanel } from './scaffold.command.js';
import { GALG_METADATA } from '../webviews/galg.data.js';
import { getGalgHtml } from '../webviews/galg.template.js';

export const GALG_PANEL: IScaffoldPanel = {
	id: 'galg',
	viewType: 'pollis.galg',
	title: 'Genetic Algorithms',
	data: GALG_METADATA.galg,
	html: getGalgHtml,
};
