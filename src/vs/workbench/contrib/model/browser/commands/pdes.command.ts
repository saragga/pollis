/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IScaffoldPanel } from './scaffold.command.js';
import { PDES_METADATA } from '../webviews/pdes.data.js';
import { getPdesHtml } from '../webviews/pdes.template.js';

export const PDES_PANEL: IScaffoldPanel = {
	id: 'pdes',
	viewType: 'pollis.pdes',
	title: 'Partial Differential Equations',
	data: PDES_METADATA.pdes,
	html: getPdesHtml,
};
