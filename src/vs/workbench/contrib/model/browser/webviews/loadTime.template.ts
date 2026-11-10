/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { LOADTIME_METADATA } from './loadTime.data.js';
import { buildScaffoldHtml } from './scaffoldParts.js';

export function getLoadTimeHtml(): string {
	return buildScaffoldHtml('loadTime', LOADTIME_METADATA.loadTime, {
		title: 'Load and Compile Time',
		defaultModel: 'load',
		decisionFirstColumn: 'Measure',
	});
}
