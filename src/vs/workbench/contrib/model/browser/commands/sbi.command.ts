/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IScaffoldPanel } from './scaffold.command.js';
import { SBI_METADATA } from '../webviews/sbi.data.js';
import { getSbiHtml } from '../webviews/sbi.template.js';

export const SBI_PANEL: IScaffoldPanel = {
	id: 'sbi',
	viewType: 'pollis.sbi',
	title: 'Simulation-Based Inference',
	data: SBI_METADATA.sbi,
	html: getSbiHtml,
};
