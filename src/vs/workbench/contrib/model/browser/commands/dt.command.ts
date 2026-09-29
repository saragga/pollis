/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IScaffoldPanel } from './scaffold.command.js';
import { DT_METADATA } from '../webviews/dt.data.js';
import { getDtHtml } from '../webviews/dt.template.js';

export const DT_PANEL: IScaffoldPanel = {
	id: 'dt',
	viewType: 'pollis.dt',
	title: 'Decision Tree Models',
	data: DT_METADATA.dt,
	html: getDtHtml,
};
