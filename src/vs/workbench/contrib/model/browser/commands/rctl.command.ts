/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IScaffoldPanel } from './scaffold.command.js';
import { RCTL_METADATA } from '../webviews/rctl.data.js';
import { getRctlHtml } from '../webviews/rctl.template.js';

export const RCTL_PANEL: IScaffoldPanel = {
	id: 'rctl',
	viewType: 'pollis.rctl',
	title: 'Robot Control',
	data: RCTL_METADATA.rctl,
	html: getRctlHtml,
};
