/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IScaffoldPanel } from './scaffold.command.js';
import { DIST_METADATA } from '../webviews/dist.data.js';
import { getDistHtml } from '../webviews/dist.template.js';

export const DIST_PANEL: IScaffoldPanel = {
	id: 'dist',
	viewType: 'pollis.dist',
	title: 'Distribution Functions',
	data: DIST_METADATA.dist,
	html: getDistHtml,
};
