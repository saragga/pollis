/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IScaffoldPanel } from './scaffold.command.js';
import { TTE_METADATA } from '../webviews/tte.data.js';
import { getTteHtml } from '../webviews/tte.template.js';

export const TTE_PANEL: IScaffoldPanel = {
	id: 'tte',
	viewType: 'pollis.tte',
	title: 'Time-to-Event Analysis',
	data: TTE_METADATA.tte,
	html: getTteHtml,
};
