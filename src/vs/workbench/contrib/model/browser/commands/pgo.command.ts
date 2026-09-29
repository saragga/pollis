/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IScaffoldPanel } from './scaffold.command.js';
import { PGO_METADATA } from '../webviews/pgo.data.js';
import { getPgoHtml } from '../webviews/pgo.template.js';

export const PGO_PANEL: IScaffoldPanel = {
	id: 'pgo',
	viewType: 'pollis.pgo',
	title: 'Principled Global Search with Local Refinement',
	data: PGO_METADATA.pgo,
	html: getPgoHtml,
};
