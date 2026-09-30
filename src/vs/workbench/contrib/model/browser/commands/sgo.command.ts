/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IScaffoldPanel } from './scaffold.command.js';
import { SGO_METADATA } from '../webviews/sgo.data.js';
import { getSgoHtml } from '../webviews/sgo.template.js';

export const SGO_PANEL: IScaffoldPanel = {
	id: 'sgo',
	viewType: 'pollis.sgo',
	title: 'Stochastic Global Methods',
	data: SGO_METADATA.sgo,
	html: getSgoHtml,
};
