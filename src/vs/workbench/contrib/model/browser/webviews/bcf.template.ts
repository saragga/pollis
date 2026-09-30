/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { BCF_METADATA } from './bcf.data.js';
import { buildScaffoldHtml } from './scaffoldParts.js';

export function getBcfHtml(): string {
	return buildScaffoldHtml('bcf', BCF_METADATA.bcf, {
		title: 'Business Cycle Filters',
		defaultModel: 'hp',
		decisionFirstColumn: 'Model',
	});
}
