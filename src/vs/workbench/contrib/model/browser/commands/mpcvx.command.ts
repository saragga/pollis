/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IScaffoldPanel } from './scaffold.command.js';
import { MPCVX_METADATA } from '../webviews/mpcvx.data.js';
import { getMpcvxHtml } from '../webviews/mpcvx.template.js';

export const MPCVX_PANEL: IScaffoldPanel = {
	id: 'mpcvx',
	viewType: 'pollis.mpcvx',
	title: 'General Convex Programming',
	data: MPCVX_METADATA.mpcvx,
	html: getMpcvxHtml,
};
