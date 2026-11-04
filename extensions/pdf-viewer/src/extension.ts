/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

// The PDF Viewer of Pollis: the editor of .pdf files, with pdf.js, and the commands that open a PDF in it (Explore >
// Access Files > PDF Files, the PDF... of the + of Ask Pollis).

import * as os from 'os';
import * as path from 'path';
import * as vscode from 'vscode';
import { PDF_VIEWER_VIEW_TYPE, PdfViewerProvider } from './pdfViewer';

/** The command of the Julia extension that runs pdf_tools.jl, which gives the path of the sample PDF of PollisDatasets. */
const PDF_SAMPLE_COMMAND_ID = 'language-julia.pollisPdfSample';

/** Opens `resource` in the PDF Viewer, beside the active editor when `toSide`. */
async function openInViewer(resource: vscode.Uri, toSide?: boolean): Promise<void> {
	await vscode.commands.executeCommand('vscode.openWith', resource, PDF_VIEWER_VIEW_TYPE, toSide ? vscode.ViewColumn.Beside : undefined);
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

/**
 * The sample PDF in a copy of PollisDatasets already in a Julia depot (JULIA_DEPOT_PATH, else ~/.julia), the most
 * recent if there are several; the sample is the same in every version.
 */
async function sampleInDepot(): Promise<vscode.Uri | undefined> {
	const depots = (process.env.JULIA_DEPOT_PATH ?? '').split(path.delimiter).filter(depot => depot);
	let found: { uri: vscode.Uri; mtime: number } | undefined;
	for (const depot of depots.length ? depots : [path.join(os.homedir(), '.julia')]) {
		const packages = vscode.Uri.file(path.join(depot, 'packages', 'PollisDatasets'));
		let versions: [string, vscode.FileType][];
		try {
			versions = await vscode.workspace.fs.readDirectory(packages);
		} catch {
			continue;
		}
		for (const [version] of versions) {
			const uri = vscode.Uri.joinPath(packages, version, 'files', 'sample.pdf');
			try {
				const { mtime } = await vscode.workspace.fs.stat(uri);
				if (!found || mtime > found.mtime) {
					found = { uri, mtime };
				}
			} catch {
				// A version without the sample
			}
		}
	}
	return found?.uri;
}

/** Opens the sample PDF of PollisDatasets: from the Julia depot, else at the path the hidden Julia process gives. */
async function openSample(): Promise<void> {
	const inDepot = await sampleInDepot();
	if (inDepot) {
		await openInViewer(inDepot);
		return;
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
		await openInViewer(vscode.Uri.file(answer.path));
	} else if (answer?.error === 'installing') {
		vscode.window.showInformationMessage(vscode.l10n.t("Julia is installing PollisDatasets, which has the sample PDF, the first time it is needed: try again in a minute or two."));
	} else if (answer?.error === 'noJulia' || !answer) {
		vscode.window.showWarningMessage(vscode.l10n.t("The sample PDF is in PollisDatasets, which needs Julia."));
	} else {
		vscode.window.showWarningMessage(vscode.l10n.t("The sample PDF could not be found: {0}", answer.error ?? ''));
	}
}

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
		vscode.commands.registerCommand('pollis.pdfViewer.openSample', openSample),
		// Explore > Access Files > PDF Files: the sample, as the other panels start on an example; Open a PDF... in the viewer's title bar opens another
		vscode.commands.registerCommand('pollis.pdfViewer.openFromMenu', openSample),
		// The viewer's title bar, which passes the PDF shown: the dialog opens another one
		vscode.commands.registerCommand('pollis.pdfViewer.openAnother', async () => {
			const target = await pickPdf();
			if (target) {
				await openInViewer(target);
			}
		}),
	);
}
