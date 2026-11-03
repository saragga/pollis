/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

// The Select Area pane of PDF Files: the pages it shows, the area cut from them and what it sends to the panel's Ask
// Pollis, from Poppler in a hidden Julia process of the Julia extension (pdf_pages.jl).

import { DisposableStore, IDisposable } from '../../../../../base/common/lifecycle.js';
import { basename } from '../../../../../base/common/path.js';
import { localize } from '../../../../../nls.js';
import { ICommandService } from '../../../../../platform/commands/common/commands.js';
import { ServicesAccessor } from '../../../../../platform/instantiation/common/instantiation.js';
import { IWorkspaceContextService } from '../../../../../platform/workspace/common/workspace.js';
import { IPathService } from '../../../../services/path/common/pathService.js';
import { IWebview } from '../../../webview/browser/webview.js';
import { ASK_POLLIS_ATTACH_COMMAND_ID, IAskPollisAttached } from '../../../compose/common/askPollis.js';
import { MAX_IMAGE_BYTES } from '../../../compose/browser/collaboration/collaborationProtocol.js';

/** The command of the Julia extension that answers with Poppler's pages, areas, text and cells. */
const PDF_PAGES_COMMAND_ID = 'language-julia.pollisPdfPages';

/** Pixels per inch of the page images and of the cropped areas: two pixels per point. */
const DPI = 144;

/** An area in points from the top left corner of a page. */
interface IPdfArea {
	readonly x: number;
	readonly y: number;
	readonly W: number;
	readonly H: number;
}

/** The messages of the Select Area pane; `seq` pairs an answer with its request. */
type PdfAreaMessage =
	| { readonly command: 'pdfPage'; readonly seq: number; readonly file: string; readonly page: number }
	| { readonly command: 'pdfCrop'; readonly seq: number; readonly file: string; readonly page: number; readonly area: IPdfArea }
	| { readonly command: 'pdfSend'; readonly kind: 'text' | 'table' | 'image'; readonly file: string; readonly page: number; readonly area: IPdfArea; readonly gap: number; readonly rowtol: number };

/** What pdf_pages.jl answers: an error, or what the request asked for. */
interface IPdfAnswer {
	readonly error?: string;
	readonly pages?: number;
	readonly page?: number;
	readonly width?: number;
	readonly height?: number;
	readonly png?: string;
	readonly text?: string;
	readonly csv?: string;
	readonly rows?: number;
	readonly columns?: number;
}

/** Why an answer has nothing to show, and whether to ask again (while Julia installs Poppler). */
function problemOf(answer: IPdfAnswer | undefined, file: string): { readonly problem: string; readonly retry?: boolean } {
	if (answer?.error === 'installing') {
		return { problem: localize('pdfArea.installing', "Julia is installing Poppler, which draws the pages, the first time it is needed: the page comes in a minute or two"), retry: true };
	}
	if (answer?.error === 'noJulia') {
		return { problem: localize('pdfArea.needsJulia', "Needs Julia, which draws the pages with Poppler") };
	}
	if (answer?.error === 'notFound') {
		return { problem: localize('pdfArea.notFound', "{0} is not found: give its path, absolute or relative to the folder open in Pollis", file) };
	}
	if (answer?.error === 'noPassword') {
		return { problem: localize('pdfArea.password', "{0} is encrypted with a password: Select Area shows only files without one", file) };
	}
	if (answer?.error && answer.error !== 'failed') {
		return { problem: localize('pdfArea.popplerError', "Poppler could not read {0}: {1}", file, answer.error) };
	}
	return { problem: localize('pdfArea.failed', "Poppler could not read {0}: Julia stopped", file) };
}

/** The name of what is sent, after the PDF, its page and what it is: `sample p2 table.csv`. */
function attachmentName(file: string, page: number, kind: 'text' | 'table' | 'image'): string {
	const stem = basename(file).replace(/\.pdf$/i, '');
	return kind === 'text' ? `${stem} p${page} area.txt` : kind === 'table' ? `${stem} p${page} table.csv` : `${stem} p${page} area.png`;
}

/**
 * Answers the messages of the Select Area pane of PDF Files: a page's image and size, an area's image, and the text,
 * the cells or the image of an area, which go to the panel's Ask Pollis as an attachment (the message `attached`).
 */
export function registerPdfAreaHandlers(webview: IWebview, accessor: ServicesAccessor): IDisposable {
	const commandService = accessor.get(ICommandService);
	const workspaceContextService = accessor.get(IWorkspaceContextService);
	const pathService = accessor.get(IPathService);
	const disposables = new DisposableStore();

	// Relative paths are read from the folder open in Pollis, where the Julia REPL starts, else from the home folder
	const workingDirectory = async (): Promise<string> => workspaceContextService.getWorkspace().folders[0]?.uri.fsPath ?? (await pathService.userHome()).fsPath;

	const ask = async (request: Record<string, unknown>): Promise<IPdfAnswer | undefined> => {
		try {
			return await commandService.executeCommand<IPdfAnswer>(PDF_PAGES_COMMAND_ID, { ...request, cwd: await workingDirectory() });
		} catch {
			// The Julia extension is disabled, or not activated yet
			return undefined;
		}
	};

	disposables.add(webview.onMessage(async (e: { message: PdfAreaMessage }) => {
		const msg = e.message;
		if (msg.command === 'pdfPage') {
			const answer = await ask({ op: 'page', file: msg.file, page: msg.page, dpi: DPI });
			webview.postMessage(answer?.png
				? { command: 'pdfPage', seq: msg.seq, png: answer.png, pages: answer.pages, page: answer.page, width: answer.width, height: answer.height }
				: { command: 'pdfPage', seq: msg.seq, ...problemOf(answer, msg.file) });
		} else if (msg.command === 'pdfCrop') {
			const answer = await ask({ op: 'crop', file: msg.file, page: msg.page, ...msg.area, dpi: DPI });
			webview.postMessage(answer?.png ? { command: 'pdfCrop', seq: msg.seq, png: answer.png } : { command: 'pdfCrop', seq: msg.seq, ...problemOf(answer, msg.file) });
		} else if (msg.command === 'pdfSend') {
			const name = attachmentName(msg.file, msg.page, msg.kind);
			if (msg.kind === 'image') {
				const answer = await ask({ op: 'crop', file: msg.file, page: msg.page, ...msg.area, dpi: DPI });
				const bytes = answer?.png ? Math.floor((answer.png.length - answer.png.indexOf(',') - 1) * 3 / 4) : 0;
				webview.postMessage(!answer?.png
					? { command: 'attached', note: problemOf(answer, msg.file).problem }
					: bytes > MAX_IMAGE_BYTES
					? { command: 'attached', note: localize('pdfArea.imageTooLarge', "The image of the area is too large to attach (the limit is {0} MB): select a smaller area.", MAX_IMAGE_BYTES / 1024 / 1024) }
					: { command: 'attached', attachment: { kind: 'image', name, content: answer.png } });
				return;
			}
			const answer = await ask(msg.kind === 'text'
				? { op: 'text', file: msg.file, page: msg.page, ...msg.area }
				: { op: 'table', file: msg.file, page: msg.page, ...msg.area, gap: msg.gap, rowtol: msg.rowtol });
			const content = msg.kind === 'text' ? answer?.text : answer?.csv;
			if (content === undefined) {
				webview.postMessage({ command: 'attached', note: problemOf(answer, msg.file).problem });
			} else if (!content.trim()) {
				webview.postMessage({ command: 'attached', note: localize('pdfArea.noText', "There is no text in the area: the page may be a scan, or the area may hold only a picture.") });
			} else {
				// The workbench cuts a long text, and says so
				const attached = await commandService.executeCommand<IAskPollisAttached>(ASK_POLLIS_ATTACH_COMMAND_ID, { kind: 'file', name, content });
				webview.postMessage({ command: 'attached', attachment: attached?.attachment, note: attached?.note });
			}
		}
	}));
	return disposables;
}
