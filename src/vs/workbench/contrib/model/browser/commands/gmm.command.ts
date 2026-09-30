/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IScaffoldPanel } from './scaffold.command.js';
import { GMM_METADATA } from '../webviews/gmm.data.js';
import { getGmmHtml } from '../webviews/gmm.template.js';

export const GMM_PANEL: IScaffoldPanel = {
	id: 'gmm',
	viewType: 'pollis.gmm',
	title: 'Generalized Method of Moments (GMM)',
	data: GMM_METADATA.gmm,
	html: getGmmHtml,
};
