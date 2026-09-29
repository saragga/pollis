/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IScaffoldPanel } from './scaffold.command.js';
import { MPCONE_METADATA } from '../webviews/mpcone.data.js';
import { getMpconeHtml } from '../webviews/mpcone.template.js';

export const MPCONE_PANEL: IScaffoldPanel = {
	id: 'mpcone',
	viewType: 'pollis.mpcone',
	title: 'Convex and Conic Programming',
	data: MPCONE_METADATA.mpcone,
	html: getMpconeHtml,
};
