/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IScaffoldPanel } from './scaffold.command.js';
import { CMP_METADATA } from '../webviews/cmp.data.js';
import { getCmpHtml } from '../webviews/cmp.template.js';

export const CMP_PANEL: IScaffoldPanel = {
	id: 'cmp',
	viewType: 'pollis.cmp',
	title: 'Complementarity Problems',
	data: CMP_METADATA.cmp,
	html: getCmpHtml,
};
