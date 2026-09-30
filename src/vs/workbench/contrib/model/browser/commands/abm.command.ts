/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IScaffoldPanel } from './scaffold.command.js';
import { ABM_METADATA } from '../webviews/abm.data.js';
import { getAbmHtml } from '../webviews/abm.template.js';

export const ABM_PANEL: IScaffoldPanel = {
	id: 'abm',
	viewType: 'pollis.abm',
	title: 'Agent-Based Models',
	data: ABM_METADATA.abm,
	html: getAbmHtml,
};
