/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IScaffoldPanel } from './scaffold.command.js';
import { LOADTIME_METADATA } from '../webviews/loadTime.data.js';
import { getLoadTimeHtml } from '../webviews/loadTime.template.js';

export const LOADTIME_PANEL: IScaffoldPanel = {
	id: 'loadTime',
	viewType: 'pollis.loadTime',
	title: 'Load and Compile Time',
	data: LOADTIME_METADATA.loadTime,
	html: getLoadTimeHtml,
};
