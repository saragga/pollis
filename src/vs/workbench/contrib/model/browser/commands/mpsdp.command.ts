/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IScaffoldPanel } from './scaffold.command.js';
import { MPSDP_METADATA } from '../webviews/mpsdp.data.js';
import { getMpsdpHtml } from '../webviews/mpsdp.template.js';

export const MPSDP_PANEL: IScaffoldPanel = {
	id: 'mpsdp',
	viewType: 'pollis.mpsdp',
	title: 'Semidefinite Programming',
	data: MPSDP_METADATA.mpsdp,
	html: getMpsdpHtml,
};
