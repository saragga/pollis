/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { DTM_METADATA } from './dtm.data.js';
import { buildScaffoldHtml } from './scaffoldParts.js';

export function getDtmHtml(): string {
	return buildScaffoldHtml('dtm', DTM_METADATA.dtm, {
		title: 'Document-Term Matrix & TF-IDF',
		defaultModel: 'dtm',
		decisionFirstColumn: 'Model',
	});
}
