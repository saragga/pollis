/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IScaffoldPanel } from './scaffold.command.js';
import { ES_METADATA } from '../webviews/es.data.js';
import { getEsHtml } from '../webviews/es.template.js';

export const ES_PANEL: IScaffoldPanel = {
	id: 'es',
	viewType: 'pollis.es',
	title: 'Evolution Strategies',
	data: ES_METADATA.es,
	html: getEsHtml,
};
