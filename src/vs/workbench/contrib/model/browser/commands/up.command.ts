/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IScaffoldPanel } from './scaffold.command.js';
import { UP_METADATA } from '../webviews/up.data.js';
import { getUpHtml } from '../webviews/up.template.js';

export const UP_PANEL: IScaffoldPanel = {
	id: 'up',
	viewType: 'pollis.up',
	title: 'Uncertainty Propagation',
	data: UP_METADATA.up,
	html: getUpHtml,
};
