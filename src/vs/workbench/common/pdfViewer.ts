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
 * (mode: 'read' | 'extract' | 'merge' | 'crop' | 'convert' | 'highlight' | 'text' | 'image' | 'draw').
 */
export const PDF_VIEWER_OPEN_IN_MODE_COMMAND_ID = 'pollis.pdfViewer.openInMode';

/**
 * How the PDF Viewer opens a PDF: at a page (from 1), or at the page where a caption such as `Table 2` starts a line;
 * beside the active editor; in a mode, `crop` for the area tool; and with a button for the area's table, which runs
 * `command` with `args`, the table's cells as corrected in the viewer (`cells`, rows of strings) and its page in the
 * PDF (`page`).
 */
export interface IPdfViewerOpenOptions {
	readonly page?: number;
	readonly toSide?: boolean;
	readonly caption?: string;
	readonly mode?: 'read' | 'extract' | 'merge' | 'crop' | 'convert' | 'highlight' | 'text' | 'image' | 'draw';
	readonly addTable?: { readonly label: string; readonly command: string; readonly args?: Readonly<Record<string, string>> };
}

/** Opens a PDF on the disk in the PDF Viewer, at a page when one is given. */
export async function openPdfInViewer(commandService: ICommandService, pdf: URI, options?: IPdfViewerOpenOptions): Promise<void> {
	await commandService.executeCommand(PDF_VIEWER_OPEN_COMMAND_ID, pdf, options);
}
