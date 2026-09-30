/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IScaffoldPanel } from './scaffold.command.js';
import { HPT_METADATA } from '../webviews/hpt.data.js';
import { getHptHtml } from '../webviews/hpt.template.js';

export const HPT_PANEL: IScaffoldPanel = {
	id: 'hpt',
	viewType: 'pollis.hpt',
	title: 'Hyperparameter Tuning',
	data: HPT_METADATA.hpt,
	html: getHptHtml,
};
