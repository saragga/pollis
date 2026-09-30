/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IScaffoldPanel } from './scaffold.command.js';
import { DE_METADATA } from '../webviews/de.data.js';
import { getDeHtml } from '../webviews/de.template.js';

export const DE_PANEL: IScaffoldPanel = {
	id: 'de',
	viewType: 'pollis.de',
	title: 'Density Estimation',
	data: DE_METADATA.de,
	html: getDeHtml,
};
