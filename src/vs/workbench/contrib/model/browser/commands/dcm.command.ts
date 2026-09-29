/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IScaffoldPanel } from './scaffold.command.js';
import { DCM_METADATA } from '../webviews/dcm.data.js';
import { getDcmHtml } from '../webviews/dcm.template.js';

export const DCM_PANEL: IScaffoldPanel = {
	id: 'dcm',
	viewType: 'pollis.dcm',
	title: 'Decomposition and Constrained Multi-Objective Optimisation',
	data: DCM_METADATA.dcm,
	html: getDcmHtml,
};
