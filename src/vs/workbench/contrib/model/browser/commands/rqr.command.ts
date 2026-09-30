/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IScaffoldPanel } from './scaffold.command.js';
import { RQR_METADATA } from '../webviews/rqr.data.js';
import { getRqrHtml } from '../webviews/rqr.template.js';

export const RQR_PANEL: IScaffoldPanel = {
	id: 'rqr',
	viewType: 'pollis.rqr',
	title: 'Robust and Quantile Regression',
	data: RQR_METADATA.rqr,
	html: getRqrHtml,
};
