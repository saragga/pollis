/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IScaffoldPanel } from './scaffold.command.js';
import { MOPT_METADATA } from '../webviews/mopt.data.js';
import { getMoptHtml } from '../webviews/mopt.template.js';

export const MOPT_PANEL: IScaffoldPanel = {
	id: 'mopt',
	viewType: 'pollis.mopt',
	title: 'Optimization on Riemannian Manifolds',
	data: MOPT_METADATA.mopt,
	html: getMoptHtml,
};
