/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IScaffoldPanel } from './scaffold.command.js';
import { CLP_METADATA } from '../webviews/clp.data.js';
import { getClpHtml } from '../webviews/clp.template.js';

export const CLP_PANEL: IScaffoldPanel = {
	id: 'clp',
	viewType: 'pollis.clp',
	title: 'Partitional & Density Clustering',
	data: CLP_METADATA.clp,
	html: getClpHtml,
};
