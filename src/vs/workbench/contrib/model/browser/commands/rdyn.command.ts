/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IScaffoldPanel } from './scaffold.command.js';
import { RDYN_METADATA } from '../webviews/rdyn.data.js';
import { getRdynHtml } from '../webviews/rdyn.template.js';

export const RDYN_PANEL: IScaffoldPanel = {
	id: 'rdyn',
	viewType: 'pollis.rdyn',
	title: 'Robot Dynamics',
	data: RDYN_METADATA.rdyn,
	html: getRdynHtml,
};
