/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IScaffoldPanel } from './scaffold.command.js';
import { MPMICP_METADATA } from '../webviews/mpmicp.data.js';
import { getMpmicpHtml } from '../webviews/mpmicp.template.js';

export const MPMICP_PANEL: IScaffoldPanel = {
	id: 'mpmicp',
	viewType: 'pollis.mpmicp',
	title: 'Mixed-Integer Conic Programming',
	data: MPMICP_METADATA.mpmicp,
	html: getMpmicpHtml,
};
