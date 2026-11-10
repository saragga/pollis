/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IScaffoldPanel } from './scaffold.command.js';
import { PROFILETIME_METADATA } from '../webviews/profileTime.data.js';
import { getProfileTimeHtml } from '../webviews/profileTime.template.js';

export const PROFILETIME_PANEL: IScaffoldPanel = {
	id: 'profileTime',
	viewType: 'pollis.profileTime',
	title: 'Find Where the Time Goes',
	data: PROFILETIME_METADATA.profileTime,
	html: getProfileTimeHtml,
};
