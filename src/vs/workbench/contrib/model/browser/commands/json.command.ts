/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IScaffoldPanel } from './scaffold.command.js';
import { JSON_METADATA } from '../webviews/json.data.js';
import { getJsonHtml } from '../webviews/json.template.js';

export const JSON_PANEL: IScaffoldPanel = {
	id: 'json',
	viewType: 'pollis.json',
	title: 'JSON Files',
	data: JSON_METADATA.json,
	html: getJsonHtml,
};
