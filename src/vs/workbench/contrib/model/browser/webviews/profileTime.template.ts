/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { PROFILETIME_METADATA } from './profileTime.data.js';
import { buildScaffoldHtml } from './scaffoldParts.js';

export function getProfileTimeHtml(): string {
	return buildScaffoldHtml('profileTime', PROFILETIME_METADATA.profileTime, {
		title: 'Find Where the Time Goes',
		defaultModel: 'flame',
		decisionFirstColumn: 'Report',
	});
}
