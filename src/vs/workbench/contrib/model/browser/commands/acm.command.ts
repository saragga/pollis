/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IScaffoldPanel } from './scaffold.command.js';
import { ACM_METADATA } from '../webviews/acm.data.js';
import { getAcmHtml } from '../webviews/acm.template.js';

export const ACM_PANEL: IScaffoldPanel = {
	id: 'acm',
	viewType: 'pollis.acm',
	title: 'Actor-Critic Methods',
	data: ACM_METADATA.acm,
	html: getAcmHtml,
};
