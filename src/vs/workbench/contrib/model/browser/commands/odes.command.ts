/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IScaffoldPanel } from './scaffold.command.js';
import { ODES_METADATA } from '../webviews/odes.data.js';
import { getOdesHtml } from '../webviews/odes.template.js';

export const ODES_PANEL: IScaffoldPanel = {
	id: 'odes',
	viewType: 'pollis.odes',
	title: 'Ordinary Differential Equations',
	data: ODES_METADATA.odes,
	html: getOdesHtml,
};
