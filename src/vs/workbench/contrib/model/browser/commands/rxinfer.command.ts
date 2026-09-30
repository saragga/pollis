/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IScaffoldPanel } from './scaffold.command.js';
import { RXINFER_METADATA } from '../webviews/rxinfer.data.js';
import { getRxinferHtml } from '../webviews/rxinfer.template.js';

export const RXINFER_PANEL: IScaffoldPanel = {
	id: 'rxinfer',
	viewType: 'pollis.rxinfer',
	title: 'Fast Variational Bayesian Inference',
	data: RXINFER_METADATA.rxinfer,
	html: getRxinferHtml,
};
