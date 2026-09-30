/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IScaffoldPanel } from './scaffold.command.js';
import { PPL_METADATA } from '../webviews/ppl.data.js';
import { getPplHtml } from '../webviews/ppl.template.js';

export const PPL_PANEL: IScaffoldPanel = {
	id: 'ppl',
	viewType: 'pollis.ppl',
	title: 'Sampling-Based Bayesian Inference',
	data: PPL_METADATA.ppl,
	html: getPplHtml,
};
