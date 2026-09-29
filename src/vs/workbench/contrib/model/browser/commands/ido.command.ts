/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IScaffoldPanel } from './scaffold.command.js';
import { IDO_METADATA } from '../webviews/ido.data.js';
import { getIdoHtml } from '../webviews/ido.template.js';

export const IDO_PANEL: IScaffoldPanel = {
	id: 'ido',
	viewType: 'pollis.ido',
	title: 'Infinite-Dimensional Optimisation',
	data: IDO_METADATA.ido,
	html: getIdoHtml,
};
