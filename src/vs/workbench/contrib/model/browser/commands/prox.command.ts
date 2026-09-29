/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IScaffoldPanel } from './scaffold.command.js';
import { PROX_METADATA } from '../webviews/prox.data.js';
import { getProxHtml } from '../webviews/prox.template.js';

export const PROX_PANEL: IScaffoldPanel = {
	id: 'prox',
	viewType: 'pollis.prox',
	title: 'Nonsmooth and Proximal Optimisation',
	data: PROX_METADATA.prox,
	html: getProxHtml,
};
