/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IScaffoldPanel } from './scaffold.command.js';
import { SMC_METADATA } from '../webviews/smc.data.js';
import { getSmcHtml } from '../webviews/smc.template.js';

export const SMC_PANEL: IScaffoldPanel = {
	id: 'smc',
	viewType: 'pollis.smc',
	title: 'Sequential Monte Carlo',
	data: SMC_METADATA.smc,
	html: getSmcHtml,
};
