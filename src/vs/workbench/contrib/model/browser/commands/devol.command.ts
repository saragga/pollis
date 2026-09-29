/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IScaffoldPanel } from './scaffold.command.js';
import { DEVOL_METADATA } from '../webviews/devol.data.js';
import { getDevolHtml } from '../webviews/devol.template.js';

export const DEVOL_PANEL: IScaffoldPanel = {
	id: 'devol',
	viewType: 'pollis.devol',
	title: 'Differential Evolution',
	data: DEVOL_METADATA.devol,
	html: getDevolHtml,
};
