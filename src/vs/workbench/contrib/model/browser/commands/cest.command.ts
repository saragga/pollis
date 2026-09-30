/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IScaffoldPanel } from './scaffold.command.js';
import { CEST_METADATA } from '../webviews/cest.data.js';
import { getCestHtml } from '../webviews/cest.template.js';

export const CEST_PANEL: IScaffoldPanel = {
	id: 'cest',
	viewType: 'pollis.cest',
	title: 'Contagion Models',
	data: CEST_METADATA.cest,
	html: getCestHtml,
};
