/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IScaffoldPanel } from './scaffold.command.js';
import { LSA_METADATA } from '../webviews/lsa.data.js';
import { getLsaHtml } from '../webviews/lsa.template.js';

export const LSA_PANEL: IScaffoldPanel = {
	id: 'lsa',
	viewType: 'pollis.lsa',
	title: 'Latent Semantic Analysis',
	data: LSA_METADATA.lsa,
	html: getLsaHtml,
};
