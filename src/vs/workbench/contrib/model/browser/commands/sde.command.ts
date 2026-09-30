/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IScaffoldPanel } from './scaffold.command.js';
import { SDE_METADATA } from '../webviews/sde.data.js';
import { getSdeHtml } from '../webviews/sde.template.js';

export const SDE_PANEL: IScaffoldPanel = {
	id: 'sde',
	viewType: 'pollis.sde',
	title: 'Diffusion Processes',
	data: SDE_METADATA.sde,
	html: getSdeHtml,
};
