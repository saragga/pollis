/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { SPEEDRACE_METADATA } from './speedRace.data.js';
import { buildScaffoldHtml } from './scaffoldParts.js';

export function getSpeedRaceHtml(): string {
	return buildScaffoldHtml('speedRace', SPEEDRACE_METADATA.speedRace, {
		title: 'Run a Speed Race',
		defaultModel: 'loop',
		decisionFirstColumn: 'Race',
	});
}
