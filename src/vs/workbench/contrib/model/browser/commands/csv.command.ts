/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IScaffoldPanel } from './scaffold.command.js';
import { CSV_METADATA } from '../webviews/csv.data.js';
import { getCsvHtml } from '../webviews/csv.template.js';

export const CSV_PANEL: IScaffoldPanel = {
	id: 'csv',
	viewType: 'pollis.csv',
	title: 'CSV Files',
	data: CSV_METADATA.csv,
	html: getCsvHtml,
};
