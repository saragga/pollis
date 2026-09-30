/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IScaffoldPanel } from './scaffold.command.js';
import { MMN_METADATA } from '../webviews/mmn.data.js';
import { getMmnHtml } from '../webviews/mmn.template.js';

export const MMN_PANEL: IScaffoldPanel = {
	id: 'mmn',
	viewType: 'pollis.mmn',
	title: 'Market Microstructure Noise',
	data: MMN_METADATA.mmn,
	html: getMmnHtml,
};
