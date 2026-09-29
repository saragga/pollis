/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IScaffoldPanel } from './scaffold.command.js';
import { CLH_METADATA } from '../webviews/clh.data.js';
import { getClhHtml } from '../webviews/clh.template.js';

export const CLH_PANEL: IScaffoldPanel = {
	id: 'clh',
	viewType: 'pollis.clh',
	title: 'Hierarchical Clustering',
	data: CLH_METADATA.clh,
	html: getClhHtml,
};
