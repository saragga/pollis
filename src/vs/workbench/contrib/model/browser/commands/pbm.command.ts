/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IScaffoldPanel } from './scaffold.command.js';
import { PBM_METADATA } from '../webviews/pbm.data.js';
import { getPbmHtml } from '../webviews/pbm.template.js';

export const PBM_PANEL: IScaffoldPanel = {
	id: 'pbm',
	viewType: 'pollis.pbm',
	title: 'Pareto-Based Multi-Objective Optimisation',
	data: PBM_METADATA.pbm,
	html: getPbmHtml,
};
