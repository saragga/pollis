/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IScaffoldPanel } from './scaffold.command.js';
import { RZOO_METADATA } from '../webviews/rzoo.data.js';
import { getRzooHtml } from '../webviews/rzoo.template.js';

export const RZOO_PANEL: IScaffoldPanel = {
	id: 'rzoo',
	viewType: 'pollis.rzoo',
	title: 'RobotZoo — Robot Model Library',
	data: RZOO_METADATA.rzoo,
	html: getRzooHtml,
};
