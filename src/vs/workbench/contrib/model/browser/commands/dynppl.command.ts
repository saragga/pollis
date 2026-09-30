/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IScaffoldPanel } from './scaffold.command.js';
import { DYNPPL_METADATA } from '../webviews/dynppl.data.js';
import { getDynpplHtml } from '../webviews/dynppl.template.js';

export const DYNPPL_PANEL: IScaffoldPanel = {
	id: 'dynppl',
	viewType: 'pollis.dynppl',
	title: 'Probabilistic Programming with Turing.jl',
	data: DYNPPL_METADATA.dynppl,
	html: getDynpplHtml,
};
