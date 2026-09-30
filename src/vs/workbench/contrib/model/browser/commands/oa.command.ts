/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IScaffoldPanel } from './scaffold.command.js';
import { OA_METADATA } from '../webviews/oa.data.js';
import { getOaHtml } from '../webviews/oa.template.js';

export const OA_PANEL: IScaffoldPanel = {
	id: 'oa',
	viewType: 'pollis.oa',
	title: 'Online Algorithms',
	data: OA_METADATA.oa,
	html: getOaHtml,
};
