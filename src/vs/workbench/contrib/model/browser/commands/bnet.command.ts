/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IScaffoldPanel } from './scaffold.command.js';
import { BNET_METADATA } from '../webviews/bnet.data.js';
import { getBnetHtml } from '../webviews/bnet.template.js';

export const BNET_PANEL: IScaffoldPanel = {
	id: 'bnet',
	viewType: 'pollis.bnet',
	title: 'Bayesian Network Inference',
	data: BNET_METADATA.bnet,
	html: getBnetHtml,
};
