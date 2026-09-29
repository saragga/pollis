/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IScaffoldPanel } from './scaffold.command.js';
import { MPM_METADATA } from '../webviews/mpm.data.js';
import { getMpmHtml } from '../webviews/mpm.template.js';

export const MPM_PANEL: IScaffoldPanel = {
	id: 'mpm',
	viewType: 'pollis.mpm',
	title: 'Multi-Objective Optimisation Performance Metrics',
	data: MPM_METADATA.mpm,
	html: getMpmHtml,
};
