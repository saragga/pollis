/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IScaffoldPanel } from './scaffold.command.js';
import { NNTSF_METADATA } from '../webviews/nntsf.data.js';
import { getNntsfHtml } from '../webviews/nntsf.template.js';

export const NNTSF_PANEL: IScaffoldPanel = {
	id: 'nntsf',
	viewType: 'pollis.nntsf',
	title: 'Neural Network Time-Series Forecasting',
	data: NNTSF_METADATA.nntsf,
	html: getNntsfHtml,
};
