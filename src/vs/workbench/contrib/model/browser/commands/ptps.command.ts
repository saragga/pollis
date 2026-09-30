/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IScaffoldPanel } from './scaffold.command.js';
import { PTPS_METADATA } from '../webviews/ptps.data.js';
import { getPtpsHtml } from '../webviews/ptps.template.js';

export const PTPS_PANEL: IScaffoldPanel = {
	id: 'ptps',
	viewType: 'pollis.ptps',
	title: 'Point Process Simulation',
	data: PTPS_METADATA.ptps,
	html: getPtpsHtml,
};
