/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { PDF_METADATA } from './pdf.data.js';
import { buildScaffoldHtml } from './scaffoldParts.js';

export function getPdfHtml(): string {
	return buildScaffoldHtml('pdf', PDF_METADATA.pdf, {
		title: 'PDF Files',
		defaultModel: 'text',
		decisionFirstColumn: 'Tab',
	});
}
