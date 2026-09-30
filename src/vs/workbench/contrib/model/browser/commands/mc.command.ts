/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IScaffoldPanel } from './scaffold.command.js';
import { MC_METADATA } from '../webviews/mc.data.js';
import { getMcHtml } from '../webviews/mc.template.js';

export const MC_PANEL: IScaffoldPanel = {
	id: 'mc',
	viewType: 'pollis.mc',
	title: 'Model Calibration',
	data: MC_METADATA.mc,
	html: getMcHtml,
};
