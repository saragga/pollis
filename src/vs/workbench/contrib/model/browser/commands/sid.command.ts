/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IScaffoldPanel } from './scaffold.command.js';
import { SID_METADATA } from '../webviews/sid.data.js';
import { getSidHtml } from '../webviews/sid.template.js';

export const SID_PANEL: IScaffoldPanel = {
	id: 'sid',
	viewType: 'pollis.sid',
	title: 'Sampling from Intractable Distributions',
	data: SID_METADATA.sid,
	html: getSidHtml,
};
