/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IScaffoldPanel } from './scaffold.command.js';
import { LCA_METADATA } from '../webviews/lca.data.js';
import { getLcaHtml } from '../webviews/lca.template.js';

export const LCA_PANEL: IScaffoldPanel = {
	id: 'lca',
	viewType: 'pollis.lca',
	title: 'Latent Component Analysis',
	data: LCA_METADATA.lca,
	html: getLcaHtml,
};
