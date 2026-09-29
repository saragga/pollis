/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IScaffoldPanel } from './scaffold.command.js';
import { SO_METADATA } from '../webviews/so.data.js';
import { getSoHtml } from '../webviews/so.template.js';

export const SO_PANEL: IScaffoldPanel = {
	id: 'so',
	viewType: 'pollis.so',
	title: 'Second Order Methods',
	data: SO_METADATA.so,
	html: getSoHtml,
};
