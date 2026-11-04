/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

// POLLIS: PDFs open in the PDF Viewer (extensions/pdf-viewer), the editor of .pdf files; the integrated browser does
// not show them.

import { ICommandService } from '../../platform/commands/common/commands.js';
import { URI } from '../../base/common/uri.js';

/** The command of the PDF Viewer that opens a PDF, or asks for one: (resource?: URI, options?: IPdfViewerOpenOptions). */
export const PDF_VIEWER_OPEN_COMMAND_ID = 'pollis.pdfViewer.open';

/**
 * The command of the PDF Viewer that opens the PDF shown, else the sample of PollisDatasets, in a mode:
 * (mode: 'read' | 'tools' | 'crop' | 'highlight' | 'text' | 'draw' | 'image').
 */
export const PDF_VIEWER_OPEN_IN_MODE_COMMAND_ID = 'pollis.pdfViewer.openInMode';

/** How the PDF Viewer opens a PDF: at a page (from 1), and beside the active editor. */
export interface IPdfViewerOpenOptions {
	readonly page?: number;
	readonly toSide?: boolean;
}

/** Opens a PDF on the disk in the PDF Viewer, at a page when one is given. */
export async function openPdfInViewer(commandService: ICommandService, pdf: URI, options?: IPdfViewerOpenOptions): Promise<void> {
	await commandService.executeCommand(PDF_VIEWER_OPEN_COMMAND_ID, pdf, options);
}
