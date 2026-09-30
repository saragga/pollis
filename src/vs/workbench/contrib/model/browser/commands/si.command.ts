/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IScaffoldPanel } from './scaffold.command.js';
import { SI_METADATA } from '../webviews/si.data.js';
import { getSiHtml } from '../webviews/si.template.js';

export const SI_PANEL: IScaffoldPanel = {
	id: 'si',
	viewType: 'pollis.si',
	title: 'System Identification Methods',
	data: SI_METADATA.si,
	html: getSiHtml,
};
