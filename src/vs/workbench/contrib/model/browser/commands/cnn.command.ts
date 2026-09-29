/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IScaffoldPanel } from './scaffold.command.js';
import { CNN_METADATA } from '../webviews/cnn.data.js';
import { getCnnHtml } from '../webviews/cnn.template.js';

export const CNN_PANEL: IScaffoldPanel = {
	id: 'cnn',
	viewType: 'pollis.cnn',
	title: 'Convolutional Neural Networks',
	data: CNN_METADATA.cnn,
	html: getCnnHtml,
};
