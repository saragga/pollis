/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IScaffoldPanel } from './scaffold.command.js';
import { ODEIDENT_METADATA } from '../webviews/odeident.data.js';
import { getOdeidentHtml } from '../webviews/odeident.template.js';

export const ODEIDENT_PANEL: IScaffoldPanel = {
	id: 'odeident',
	viewType: 'pollis.odeident',
	title: 'Structural Identifiability of ODEs',
	data: ODEIDENT_METADATA.odeident,
	html: getOdeidentHtml,
};
