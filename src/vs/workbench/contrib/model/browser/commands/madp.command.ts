/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IScaffoldPanel } from './scaffold.command.js';
import { MADP_METADATA } from '../webviews/madp.data.js';
import { getMadpHtml } from '../webviews/madp.template.js';

export const MADP_PANEL: IScaffoldPanel = {
	id: 'madp',
	viewType: 'pollis.madp',
	title: 'Multi-Agent Decision Processes',
	data: MADP_METADATA.madp,
	html: getMadpHtml,
};
