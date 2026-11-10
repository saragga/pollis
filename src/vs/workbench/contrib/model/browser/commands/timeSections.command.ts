/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IScaffoldPanel } from './scaffold.command.js';
import { TIMESECTIONS_METADATA } from '../webviews/timeSections.data.js';
import { getTimeSectionsHtml } from '../webviews/timeSections.template.js';

export const TIMESECTIONS_PANEL: IScaffoldPanel = {
	id: 'timeSections',
	viewType: 'pollis.timeSections',
	title: 'Time Sections of Code',
	data: TIMESECTIONS_METADATA.timeSections,
	html: getTimeSectionsHtml,
};
