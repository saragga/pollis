/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IScaffoldPanel } from './scaffold.command.js';
import { XLSX_METADATA } from '../webviews/xlsx.data.js';
import { getXlsxHtml } from '../webviews/xlsx.template.js';

export const XLSX_PANEL: IScaffoldPanel = {
	id: 'xlsx',
	viewType: 'pollis.xlsx',
	title: 'Excel Workbook',
	data: XLSX_METADATA.xlsx,
	html: () => getXlsxHtml(XLSX_METADATA),
};
