/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IScaffoldPanel } from './scaffold.command.js';
import { COPT_METADATA } from '../webviews/copt.data.js';
import { getCoptHtml } from '../webviews/copt.template.js';

export const COPT_PANEL: IScaffoldPanel = {
	id: 'copt',
	viewType: 'pollis.copt',
	title: 'Constrained Optimisation',
	data: COPT_METADATA.copt,
	html: getCoptHtml,
};
