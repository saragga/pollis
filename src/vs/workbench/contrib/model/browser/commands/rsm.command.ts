/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IScaffoldPanel } from './scaffold.command.js';
import { RSM_METADATA } from '../webviews/rsm.data.js';
import { getRsmHtml } from '../webviews/rsm.template.js';

export const RSM_PANEL: IScaffoldPanel = {
	id: 'rsm',
	viewType: 'pollis.rsm',
	title: 'Regime Switching Models',
	data: RSM_METADATA.rsm,
	html: getRsmHtml,
};
