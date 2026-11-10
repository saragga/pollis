/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IScaffoldPanel } from './scaffold.command.js';
import { SPEEDRACE_METADATA } from '../webviews/speedRace.data.js';
import { getSpeedRaceHtml } from '../webviews/speedRace.template.js';

export const SPEEDRACE_PANEL: IScaffoldPanel = {
	id: 'speedRace',
	viewType: 'pollis.speedRace',
	title: 'Run a Speed Race',
	data: SPEEDRACE_METADATA.speedRace,
	html: getSpeedRaceHtml,
};
