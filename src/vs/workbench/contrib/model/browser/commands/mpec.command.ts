/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IScaffoldPanel } from './scaffold.command.js';
import { MPEC_METADATA } from '../webviews/mpec.data.js';
import { getMpecHtml } from '../webviews/mpec.template.js';

export const MPEC_PANEL: IScaffoldPanel = {
	id: 'mpec',
	viewType: 'pollis.mpec',
	title: 'Mathematical Programming with Equilibrium Constraints',
	data: MPEC_METADATA.mpec,
	html: getMpecHtml,
};
