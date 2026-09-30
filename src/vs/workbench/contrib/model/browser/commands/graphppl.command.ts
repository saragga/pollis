/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IScaffoldPanel } from './scaffold.command.js';
import { GRAPHPPL_METADATA } from '../webviews/graphppl.data.js';
import { getGraphpplHtml } from '../webviews/graphppl.template.js';

export const GRAPHPPL_PANEL: IScaffoldPanel = {
	id: 'graphppl',
	viewType: 'pollis.graphppl',
	title: 'Probabilistic Programming with RxInfer.jl',
	data: GRAPHPPL_METADATA.graphppl,
	html: getGraphpplHtml,
};
