/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IScaffoldPanel } from './scaffold.command.js';
import { PDF_METADATA } from '../webviews/pdf.data.js';
import { getPdfHtml } from '../webviews/pdf.template.js';

export const PDF_PANEL: IScaffoldPanel = {
	id: 'pdf',
	viewType: 'pollis.pdf',
	title: 'PDF Files',
	data: PDF_METADATA.pdf,
	html: getPdfHtml,
};
