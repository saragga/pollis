/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IScaffoldPanel } from './scaffold.command.js';
import { RCME_METADATA } from '../webviews/rcme.data.js';
import { getRcmeHtml } from '../webviews/rcme.template.js';

export const RCME_PANEL: IScaffoldPanel = {
	id: 'rcme',
	viewType: 'pollis.rcme',
	title: 'Robust Covariance Matrix Estimation',
	data: RCME_METADATA.rcme,
	html: getRcmeHtml,
};
