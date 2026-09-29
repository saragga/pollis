/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IScaffoldPanel } from './scaffold.command.js';
import { LRM_METADATA } from '../webviews/lrm.data.js';
import { getLrmHtml } from '../webviews/lrm.template.js';

export const LRM_PANEL: IScaffoldPanel = {
	id: 'lrm',
	viewType: 'pollis.lrm',
	title: 'Loss Risk Measures',
	data: LRM_METADATA.lrm,
	html: getLrmHtml,
};
