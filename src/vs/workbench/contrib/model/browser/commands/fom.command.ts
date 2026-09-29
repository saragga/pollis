/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IScaffoldPanel } from './scaffold.command.js';
import { FOM_METADATA } from '../webviews/fom.data.js';
import { getFomHtml } from '../webviews/fom.template.js';

export const FOM_PANEL: IScaffoldPanel = {
	id: 'fom',
	viewType: 'pollis.fom',
	title: 'First-Order Methods',
	data: FOM_METADATA.fom,
	html: getFomHtml,
};
