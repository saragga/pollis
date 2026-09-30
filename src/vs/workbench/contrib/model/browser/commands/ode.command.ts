/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IScaffoldPanel } from './scaffold.command.js';
import { ODE_METADATA } from '../webviews/ode.data.js';
import { getOdeHtml } from '../webviews/ode.template.js';

export const ODE_PANEL: IScaffoldPanel = {
	id: 'ode',
	viewType: 'pollis.ode',
	title: 'ODE Inference Methods',
	data: ODE_METADATA.ode,
	html: getOdeHtml,
};
