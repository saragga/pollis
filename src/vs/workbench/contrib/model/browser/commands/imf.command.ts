/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IScaffoldPanel } from './scaffold.command.js';
import { IMF_METADATA } from '../webviews/imf.data.js';
import { getImfHtml } from '../webviews/imf.template.js';

export const IMF_PANEL: IScaffoldPanel = {
	id: 'imf',
	viewType: 'pollis.imf',
	title: 'IMF Data',
	data: IMF_METADATA.imf,
	html: getImfHtml,
};
