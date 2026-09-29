/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IScaffoldPanel } from './scaffold.command.js';
import { NF_METADATA } from '../webviews/nf.data.js';
import { getNfHtml } from '../webviews/nf.template.js';

export const NF_PANEL: IScaffoldPanel = {
	id: 'nf',
	viewType: 'pollis.nf',
	title: 'Normalising Flows',
	data: NF_METADATA.nf,
	html: getNfHtml,
};
