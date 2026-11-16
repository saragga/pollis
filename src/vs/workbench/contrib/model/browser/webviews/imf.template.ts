/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IMF_METADATA } from './imf.data.js';
import { buildScaffoldHtml } from './scaffoldParts.js';

export function getImfHtml(): string {
	return buildScaffoldHtml('imf', IMF_METADATA.imf, {
		title: 'IMF Data',
		defaultModel: 'weo',
		decisionFirstColumn: 'Task',
	});
}
