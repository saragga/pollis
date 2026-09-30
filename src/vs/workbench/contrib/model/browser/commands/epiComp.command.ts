/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IScaffoldPanel } from './scaffold.command.js';
import { EPICOMP_METADATA } from '../webviews/epiComp.data.js';
import { getEpiCompHtml } from '../webviews/epiComp.template.js';

export const EPICOMP_PANEL: IScaffoldPanel = {
	id: 'epiComp',
	viewType: 'pollis.epiComp',
	title: 'Compartmental Models',
	data: EPICOMP_METADATA.epiComp,
	html: getEpiCompHtml,
};
