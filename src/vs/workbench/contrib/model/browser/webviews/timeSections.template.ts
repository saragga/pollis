/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { TIMESECTIONS_METADATA } from './timeSections.data.js';
import { buildScaffoldHtml } from './scaffoldParts.js';

export function getTimeSectionsHtml(): string {
	return buildScaffoldHtml('timeSections', TIMESECTIONS_METADATA.timeSections, {
		title: 'Time Sections of Code',
		defaultModel: 'sections',
		decisionFirstColumn: 'Way to Mark',
	});
}
