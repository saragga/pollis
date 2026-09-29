/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IScaffoldPanel } from './scaffold.command.js';
import { KNN_METADATA } from '../webviews/knn.data.js';
import { getKnnHtml } from '../webviews/knn.template.js';

export const KNN_PANEL: IScaffoldPanel = {
	id: 'knn',
	viewType: 'pollis.knn',
	title: 'k-Nearest Neighbours',
	data: KNN_METADATA.knn,
	html: getKnnHtml,
};
