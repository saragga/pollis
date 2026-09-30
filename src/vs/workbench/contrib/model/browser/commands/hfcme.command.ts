/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IScaffoldPanel } from './scaffold.command.js';
import { HFCME_METADATA } from '../webviews/hfcme.data.js';
import { getHfcmeHtml } from '../webviews/hfcme.template.js';

export const HFCME_PANEL: IScaffoldPanel = {
	id: 'hfcme',
	viewType: 'pollis.hfcme',
	title: 'High-Frequency Covariance Matrix Estimation',
	data: HFCME_METADATA.hfcme,
	html: getHfcmeHtml,
};
