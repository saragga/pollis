/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IScaffoldPanel } from './scaffold.command.js';
import { CTM_METADATA } from '../webviews/ctm.data.js';
import { getCtmHtml } from '../webviews/ctm.template.js';

export const CTM_PANEL: IScaffoldPanel = {
	id: 'ctm',
	viewType: 'pollis.ctm',
	title: 'Correlated Topic Model',
	data: CTM_METADATA.ctm,
	html: getCtmHtml,
};
