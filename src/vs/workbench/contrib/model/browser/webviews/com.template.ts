/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { COM_METADATA } from './com.data.js';
import { buildScaffoldHtml } from './scaffoldParts.js';

export function getComHtml(): string {
	return buildScaffoldHtml('com', COM_METADATA.com, {
		title: 'Co-Occurrence Matrix',
		defaultModel: 'raw',
		decisionFirstColumn: 'Model',
	});
}
