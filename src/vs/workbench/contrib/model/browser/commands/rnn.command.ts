/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IScaffoldPanel } from './scaffold.command.js';
import { RNN_METADATA } from '../webviews/rnn.data.js';
import { getRnnHtml } from '../webviews/rnn.template.js';

export const RNN_PANEL: IScaffoldPanel = {
	id: 'rnn',
	viewType: 'pollis.rnn',
	title: 'Recurrent Neural Networks',
	data: RNN_METADATA.rnn,
	html: getRnnHtml,
};
