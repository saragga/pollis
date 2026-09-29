/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IScaffoldPanel } from './scaffold.command.js';
import { BLV_METADATA } from '../webviews/blv.data.js';
import { getBlvHtml } from '../webviews/blv.template.js';

export const BLV_PANEL: IScaffoldPanel = {
	id: 'blv',
	viewType: 'pollis.blv',
	title: 'Hierarchical Optimisation',
	data: BLV_METADATA.blv,
	html: getBlvHtml,
};
