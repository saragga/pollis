/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IScaffoldPanel } from './scaffold.command.js';
import { DTM_METADATA } from '../webviews/dtm.data.js';
import { getDtmHtml } from '../webviews/dtm.template.js';

export const DTM_PANEL: IScaffoldPanel = {
	id: 'dtm',
	viewType: 'pollis.dtm',
	title: 'Document-Term Matrix & TF-IDF',
	data: DTM_METADATA.dtm,
	html: getDtmHtml,
};
