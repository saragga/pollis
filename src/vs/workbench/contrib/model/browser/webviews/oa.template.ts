/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { OA_METADATA } from './oa.data.js';
import { buildScaffoldHtml } from './scaffoldParts.js';

export function getOaHtml(): string {
	return buildScaffoldHtml('oa', OA_METADATA.oa, {
		title: 'Online Algorithms',
		defaultModel: 'desc',
		decisionFirstColumn: 'Model',
	});
}
