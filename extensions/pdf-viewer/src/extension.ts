/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

// The PDF Viewer of Pollis: the editor of .pdf files, with pdf.js, and the commands that open a PDF in it (Compose >
// PDF Files, the PDF... of the + of Ask Pollis).

import * as vscode from 'vscode';
import { datasetsFileInDepot, PDF_VIEWER_VIEW_TYPE, PdfViewerProvider, ViewerMode } from './pdfViewer';

/** The command of the Julia extension that runs pdf_tools.jl, which gives the path of the sample PDF of PollisDatasets. */
const PDF_SAMPLE_COMMAND_ID = 'language-julia.pollisPdfSample';

/** Opens `resource` in the PDF Viewer: in the active editor group, beside it when `toSide`, or in the group of `column`. */
async function openInViewer(resource: vscode.Uri, toSide?: boolean, column?: vscode.ViewColumn): Promise<void> {
	await vscode.commands.executeCommand('vscode.openWith', resource, PDF_VIEWER_VIEW_TYPE, toSide ? vscode.ViewColumn.Beside : column);
}

/** Asks for a PDF on the disk. */
async function pickPdf(): Promise<vscode.Uri | undefined> {
	const picked = await vscode.window.showOpenDialog({
		title: vscode.l10n.t("Open a PDF"),
		canSelectFiles: true,
		canSelectFolders: false,
		canSelectMany: false,
		filters: { [vscode.l10n.t("PDF Files")]: ['pdf'] },
	});
	return picked?.[0];
}

/** The sample PDF of PollisDatasets: from the Julia depot, else at the path the hidden Julia process gives; undefined, with a message, when it cannot be had. */
async function findSample(): Promise<vscode.Uri | undefined> {
	const inDepot = await datasetsFileInDepot('sample.pdf');
	if (inDepot) {
		return inDepot;
	}
	let answer: { readonly path?: string; readonly error?: string } | undefined;
	try {
		answer = await vscode.window.withProgress({ location: vscode.ProgressLocation.Notification, title: vscode.l10n.t("Finding the sample PDF of PollisDatasets...") },
			() => Promise.resolve(vscode.commands.executeCommand<{ readonly path?: string; readonly error?: string }>(PDF_SAMPLE_COMMAND_ID, { op: 'sample', file: 'sample.pdf' })));
	} catch {
		// The Julia extension is disabled
		answer = undefined;
	}
	if (answer?.path) {
		return vscode.Uri.file(answer.path);
	} else if (answer?.error === 'installing') {
		vscode.window.showInformationMessage(vscode.l10n.t("Julia is installing PollisDatasets, which has the sample PDF, the first time it is needed: try again in a minute or two."));
	} else if (answer?.error === 'noJulia' || !answer) {
		vscode.window.showWarningMessage(vscode.l10n.t("The sample PDF is in PollisDatasets, which needs Julia."));
	} else {
		vscode.window.showWarningMessage(vscode.l10n.t("The sample PDF could not be found: {0}", answer.error ?? ''));
	}
	return undefined;
}

/** The PDF shown in the PDF Viewer, and its editor group: the active group, else another. */
function shownPdf(): { readonly uri: vscode.Uri; readonly column: vscode.ViewColumn } | undefined {
	const groups = [vscode.window.tabGroups.activeTabGroup, ...vscode.window.tabGroups.all.filter(group => !group.isActive)];
	for (const group of groups) {
		const input = group.activeTab?.input;
		if (input instanceof vscode.TabInputCustom && input.viewType === PDF_VIEWER_VIEW_TYPE) {
			return { uri: input.uri, column: group.viewColumn };
		}
	}
	return undefined;
}

/** The modes of Compose > PDF Files. */
const VIEWER_MODES: readonly ViewerMode[] = ['read', 'extract', 'merge', 'crop', 'convert', 'highlight', 'text', 'image', 'draw'];

/** What the workbench may ask of `pollis.pdfViewer.open`: the page to show (from 1), and an editor beside the active one. */
interface IOpenOptions {
	readonly page?: number;
	readonly toSide?: boolean;
}

export function activate(context: vscode.ExtensionContext): void {
	const provider = new PdfViewerProvider(context.extensionUri, context.globalState);
	context.subscriptions.push(
		vscode.window.registerCustomEditorProvider(PDF_VIEWER_VIEW_TYPE, provider, {
			// pdf.js keeps the page, the zoom, the search and what is filled in while another editor is shown
			webviewOptions: { retainContextWhenHidden: true },
			supportsMultipleEditorsPerDocument: true,
		}),
		// A PDF from the disk, or the one given, at a page (Help > Documentation, Ask Pollis' passages, the vignettes)
		vscode.commands.registerCommand('pollis.pdfViewer.open', async (resource?: vscode.Uri, options?: IOpenOptions) => {
			const target = resource ?? await pickPdf();
			if (target) {
				if (options?.page && options.page > 0) {
					provider.showPage(target, Math.floor(options.page));
				}
				await openInViewer(target, options?.toSide);
			}
		}),
		vscode.commands.registerCommand('pollis.pdfViewer.openSample', async () => {
			const sample = await findSample();
			if (sample) {
				await openInViewer(sample);
			}
		}),
		// Compose > PDF Files: the PDF shown, else the sample, as the other panels start on an example, in the viewer with the mode's tool ready; Open a PDF... in the title bar opens another
		vscode.commands.registerCommand('pollis.pdfViewer.openInMode', async (mode?: string) => {
			const viewerMode = VIEWER_MODES.find(known => known === mode) ?? 'read';
			const shown = shownPdf();
			const target = shown?.uri ?? await findSample();
			if (target) {
				provider.showMode(target, viewerMode);
				await openInViewer(target, false, shown?.column);
			}
		}),
		// The viewer's title bar, which passes the PDF shown: the dialog opens another one
		vscode.commands.registerCommand('pollis.pdfViewer.openAnother', async () => {
			const target = await pickPdf();
			if (target) {
				await openInViewer(target);
			}
		}),
	);
}
