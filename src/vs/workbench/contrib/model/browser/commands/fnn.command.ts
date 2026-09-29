/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IScaffoldPanel } from './scaffold.command.js';
import { FNN_METADATA } from '../webviews/fnn.data.js';
import { getFnnHtml } from '../webviews/fnn.template.js';

export const FNN_PANEL: IScaffoldPanel = {
	id: 'fnn',
	viewType: 'pollis.fnn',
	title: 'Feedforward Neural Networks',
	data: FNN_METADATA.fnn,
	html: getFnnHtml,
};
