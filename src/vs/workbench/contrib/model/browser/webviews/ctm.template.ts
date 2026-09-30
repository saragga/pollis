/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { CTM_METADATA } from './ctm.data.js';
import { buildScaffoldHtml } from './scaffoldParts.js';

export function getCtmHtml(): string {
	return buildScaffoldHtml('ctm', CTM_METADATA.ctm, {
		title: 'Correlated Topic Model',
		defaultModel: 'ctm',
		decisionFirstColumn: 'Model',
	});
}
