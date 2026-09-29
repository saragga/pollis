/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IScaffoldPanel } from './scaffold.command.js';
import { MBM_METADATA } from '../webviews/mbm.data.js';
import { getMbmHtml } from '../webviews/mbm.template.js';

export const MBM_PANEL: IScaffoldPanel = {
	id: 'mbm',
	viewType: 'pollis.mbm',
	title: 'Model-Based Methods',
	data: MBM_METADATA.mbm,
	html: getMbmHtml,
};
