/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IScaffoldPanel } from './scaffold.command.js';
import { SREG_METADATA } from '../webviews/sreg.data.js';
import { getSregHtml } from '../webviews/sreg.template.js';

export const SREG_PANEL: IScaffoldPanel = {
	id: 'sreg',
	viewType: 'pollis.sreg',
	title: 'Symbolic Regression',
	data: SREG_METADATA.sreg,
	html: getSregHtml,
};
