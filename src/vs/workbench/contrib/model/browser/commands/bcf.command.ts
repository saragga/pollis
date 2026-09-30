/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IScaffoldPanel } from './scaffold.command.js';
import { BCF_METADATA } from '../webviews/bcf.data.js';
import { getBcfHtml } from '../webviews/bcf.template.js';

export const BCF_PANEL: IScaffoldPanel = {
	id: 'bcf',
	viewType: 'pollis.bcf',
	title: 'Business Cycle Filters',
	data: BCF_METADATA.bcf,
	html: getBcfHtml,
};
