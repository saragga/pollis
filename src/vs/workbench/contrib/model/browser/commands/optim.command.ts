/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IScaffoldPanel } from './scaffold.command.js';
import { OPTIM_METADATA } from '../webviews/optim.data.js';
import { getOptimHtml } from '../webviews/optim.template.js';

export const OPTIM_PANEL: IScaffoldPanel = {
	id: 'optim',
	viewType: 'pollis.optim',
	title: 'Local Optimisation',
	data: OPTIM_METADATA.optim,
	html: getOptimHtml,
};
