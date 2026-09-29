/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IScaffoldPanel } from './scaffold.command.js';
import { SBO_METADATA } from '../webviews/sbo.data.js';
import { getSboHtml } from '../webviews/sbo.template.js';

export const SBO_PANEL: IScaffoldPanel = {
	id: 'sbo',
	viewType: 'pollis.sbo',
	title: 'Surrogate-Based Optimisation',
	data: SBO_METADATA.sbo,
	html: getSboHtml,
};
