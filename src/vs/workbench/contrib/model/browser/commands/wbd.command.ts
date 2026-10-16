/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IScaffoldPanel } from './scaffold.command.js';
import { WBD_METADATA } from '../webviews/wbd.data.js';
import { getWbdHtml } from '../webviews/wbd.template.js';

export const WBD_PANEL: IScaffoldPanel = {
	id: 'wbd',
	viewType: 'pollis.wbd',
	title: 'World Bank Indicators',
	data: WBD_METADATA.wbd,
	html: getWbdHtml,
};
