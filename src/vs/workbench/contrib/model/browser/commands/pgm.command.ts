/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IScaffoldPanel } from './scaffold.command.js';
import { PGM_METADATA } from '../webviews/pgm.data.js';
import { getPgmHtml } from '../webviews/pgm.template.js';

export const PGM_PANEL: IScaffoldPanel = {
	id: 'pgm',
	viewType: 'pollis.pgm',
	title: 'Policy Gradient Methods',
	data: PGM_METADATA.pgm,
	html: getPgmHtml,
};
