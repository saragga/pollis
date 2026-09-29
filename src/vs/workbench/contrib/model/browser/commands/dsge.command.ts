/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IScaffoldPanel } from './scaffold.command.js';
import { DSGE_METADATA } from '../webviews/dsge.data.js';
import { getDsgeHtml } from '../webviews/dsge.template.js';

export const DSGE_PANEL: IScaffoldPanel = {
	id: 'dsge',
	viewType: 'pollis.dsge',
	title: 'DSGE Models',
	data: DSGE_METADATA.dsge,
	html: getDsgeHtml,
};
