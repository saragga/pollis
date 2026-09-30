/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IScaffoldPanel } from './scaffold.command.js';
import { RP_METADATA } from '../webviews/rp.data.js';
import { getRpHtml } from '../webviews/rp.template.js';

export const RP_PANEL: IScaffoldPanel = {
	id: 'rp',
	viewType: 'pollis.rp',
	title: 'Regression Performance',
	data: RP_METADATA.rp,
	html: getRpHtml,
};
