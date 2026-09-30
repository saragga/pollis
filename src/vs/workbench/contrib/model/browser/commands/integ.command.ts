/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IScaffoldPanel } from './scaffold.command.js';
import { INTEG_METADATA } from '../webviews/integ.data.js';
import { getIntegHtml } from '../webviews/integ.template.js';

export const INTEG_PANEL: IScaffoldPanel = {
	id: 'integ',
	viewType: 'pollis.integ',
	title: 'Integration',
	data: INTEG_METADATA.integ,
	html: getIntegHtml,
};
