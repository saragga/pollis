/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IScaffoldPanel } from './scaffold.command.js';
import { COM_METADATA } from '../webviews/com.data.js';
import { getComHtml } from '../webviews/com.template.js';

export const COM_PANEL: IScaffoldPanel = {
	id: 'com',
	viewType: 'pollis.com',
	title: 'Co-Occurrence Matrix',
	data: COM_METADATA.com,
	html: getComHtml,
};
