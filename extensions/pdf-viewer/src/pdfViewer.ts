/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

// The editor of a PDF: Mozilla's viewer of pdf.js (pdfjs/web/viewer.html, the legacy build, which brings the
// JavaScript features newer than Pollis' Electron) in a webview, with Pollis' Select Area and tools sidebar
// (media/pdfViewer.js). The webview cannot save, copy, open a dialog or reach Ask Pollis, so it asks this side.

import * as os from 'os';
import * as path from 'path';
import * as vscode from 'vscode';

export const PDF_VIEWER_VIEW_TYPE = 'pollis.pdfViewer';

/**
 * What the viewer is opened for, from Compose > PDF Files: reading, with the outline; the tools sidebar shown; Select
 * Area on; or a markup tool of pdf.js ready: Highlight, Add Text, Draw, or Add or Edit Images.
 */
export type ViewerMode = 'read' | 'tools' | 'crop' | 'highlight' | 'text' | 'draw' | 'image';

/** The command of the workbench that puts an attachment in the question of the Ask Pollis pane (askPollisPage.ts). */
const ASK_POLLIS_ADD_ATTACHMENT_COMMAND_ID = 'pollis.askPollis.addAttachment';

/** What the webview asks of this side. */
type ViewerMessage =
	| { readonly command: 'ready' }
	| { readonly command: 'saveAs'; readonly name: string; readonly kind: 'pdf' | 'csv' | 'png' | 'other'; readonly data: Uint8Array }
	| { readonly command: 'copy'; readonly text: string }
	| { readonly command: 'ask'; readonly kind: 'file' | 'image'; readonly name: string; readonly content: string }
	| { readonly command: 'warn'; readonly text: string }
	| { readonly command: 'menu'; readonly menu: unknown; readonly token: number }
	| { readonly command: 'poppler'; readonly token: number; readonly request: PopplerRequest }
	| { readonly command: 'reveal' | 'openFile'; readonly path: string }
	| { readonly command: 'readFile'; readonly token: number; readonly path: string }
	| { readonly command: 'runInRepl'; readonly code: string }
	| { readonly command: 'toolsShown'; readonly shown: boolean }
	| { readonly command: 'colorize'; readonly token: number; readonly code: string };

/** The command of Pollis that shows a menu of the webview as the workbench's menu (native on macOS), and gives back the chosen item's id. */
const SHOW_MENU_COMMAND_ID = '_pollis.webview.showMenu';

/** The command of Pollis that colours Julia code as the panels colour theirs, in the theme's colours: (code) => { html, css }. */
const COLORIZE_COMMAND_ID = '_pollis.webview.colorizeJulia';

/** The command of the Julia extension that runs a Poppler tool in its hidden Julia process (pdf_tools.jl). */
const POPPLER_COMMAND_ID = 'language-julia.pollisPoppler';

/** The key, in the global state, of the folder last chosen to save a file of the viewer or of the Poppler tools in. */
const SAVE_FOLDER_KEY = 'pollis.pdfViewer.saveFolder';

/** The key, in the global state, of whether the tools sidebar was last shown or hidden, for the next PDF. */
const TOOLS_SHOWN_KEY = 'pollis.pdfViewer.toolsShown';

/** How long to wait before asking again while Julia installs Poppler_jll, the first time. */
const INSTALL_RETRY_MS = 3000;

/**
 * A Poppler tool to run on the PDF, as the tools sidebar asks for it. Its arguments may hold, as a whole argument,
 * {pdf} (the PDF's path), {out} (the file chosen to save to), {outStem} (that file without its extension), {more}
 * (the PDFs chosen, one argument each) and {attachment} (the file chosen); or start with {dir}/, the folder chosen.
 * {page} is left for the hidden process, which runs the tool once for each of `pages`.
 */
interface PopplerRequest {
	/** The tool, or none for `parts`: PDFs each of the pages given, in their order, with pdfseparate and pdfunite. */
	readonly tool?: string;
	readonly args?: readonly string[];
	/** The pages of each PDF, and its file: {out}, or {dir}/ and a name. */
	readonly parts?: readonly { readonly pages: readonly number[]; readonly out: string }[];
	/** A folder for the files the tool writes, or a file to save to, with the extension of its kind. */
	readonly output?: { readonly kind: 'folder' } | { readonly kind: 'file'; readonly name: string; readonly extension: string };
	/** PDFs to merge after this one, or a file to attach, chosen first. */
	readonly pick?: 'pdfs' | 'file';
	readonly pages?: readonly number[];
	/** The file chosen is removed first, for a tool that does not overwrite one (pdfattach). */
	readonly replace?: boolean;
}

/** What pdf_tools.jl answers, or why there is no answer. */
interface PopplerAnswer {
	readonly code?: number;
	readonly stdout?: string;
	readonly stderr?: string;
	readonly truncated?: boolean;
	readonly files?: readonly string[];
	readonly error?: string;
	readonly cancelled?: boolean;
	/** The folder, the file and the files chosen, for the Julia code. */
	readonly chosen?: { readonly dir?: string; readonly out?: string; readonly more?: readonly string[]; readonly attachment?: string };
	/** The folder the files were written in, its path and its path from the home folder as ~ on macOS and Linux. */
	readonly folder?: { readonly path: string; readonly label: string };
}

/** The names of the file kinds the save dialog filters by. */
function fileFilter(extension: string): { [name: string]: string[] } {
	const names: { [extension: string]: string } = {
		pdf: vscode.l10n.t("PDF Files"),
		ps: vscode.l10n.t("PostScript Files"),
		eps: vscode.l10n.t("EPS Files"),
		xml: vscode.l10n.t("XML Files"),
	};
	return { [names[extension] ?? extension.toUpperCase()]: [extension] };
}

/** Runs a request in the hidden Julia process, asking again while it installs Poppler_jll; undefined without the Julia extension. */
async function askJulia(request: object, installing: () => void, stopped: () => boolean): Promise<PopplerAnswer | undefined> {
	for (; ;) {
		let answer: PopplerAnswer | undefined;
		try {
			answer = await vscode.commands.executeCommand<PopplerAnswer>(POPPLER_COMMAND_ID, request);
		} catch {
			return undefined;
		}
		if (answer?.error !== 'installing' || stopped()) {
			return answer;
		}
		installing();
		await new Promise(resolve => setTimeout(resolve, INSTALL_RETRY_MS));
	}
}

/** A PDF opened in the viewer; the viewer only reads it, and saves what is changed as a new file. */
class PdfDocument implements vscode.CustomDocument {
	constructor(readonly uri: vscode.Uri) { }
	dispose(): void { }
}

/**
 * The bytes of a file, to post to the webview. The file system gives a Node Buffer, which a message carries as JSON
 * ({type, data}), not as bytes: only a view whose constructor is Uint8Array itself reaches the webview as one.
 */
async function readBytes(uri: vscode.Uri): Promise<Uint8Array> {
	const data = await vscode.workspace.fs.readFile(uri);
	return new Uint8Array(data.buffer, data.byteOffset, data.byteLength);
}

/** Whether `uri` is a folder that exists. */
async function isFolder(uri: vscode.Uri): Promise<boolean> {
	try {
		return ((await vscode.workspace.fs.stat(uri)).type & vscode.FileType.Directory) !== 0;
	} catch {
		return false;
	}
}

/** A string for a <script> of JSON: its `<` cannot close the script. */
function scriptJson(value: unknown): string {
	return JSON.stringify(value).replace(/</g, '\\u003c');
}

function nonce(): string {
	const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	let result = '';
	for (let i = 0; i < 32; i++) {
		result += characters.charAt(Math.floor(Math.random() * characters.length));
	}
	return result;
}

/** Sends code to the Julia REPL, started if it is not running, as a paste, so that the REPL reads all of it before running any. */
async function runInRepl(code: string): Promise<void> {
	let started: boolean | undefined;
	try {
		started = await vscode.commands.executeCommand<boolean>('language-julia.startREPL');
	} catch {
		started = false;
	}
	if (!started) {
		vscode.window.showWarningMessage(vscode.l10n.t("The Julia REPL could not be started."));
		return;
	}
	const text = process.platform === 'win32' ? `${code}\n` : `\u001b[200~${code}\n\u001b[201~`;
	await vscode.commands.executeCommand('workbench.action.terminal.sendSequence', { text });
}

/** Whether `folder` is in a depot of Julia, where the packages, as PollisDatasets with its sample PDF, are installed. */
function inJuliaDepot(folder: string): boolean {
	const depots = (process.env.JULIA_DEPOT_PATH ?? '').split(path.delimiter).filter(depot => depot);
	depots.push(path.join(os.homedir(), '.julia'));
	return depots.some(depot => {
		const relative = path.relative(depot, folder);
		return !relative.startsWith('..') && !path.isAbsolute(relative);
	});
}

/** A path as it is shown: from the home folder as ~ on macOS and Linux. */
function pathLabel(file: string): string {
	const home = os.homedir();
	return process.platform !== 'win32' && file.startsWith(home + path.sep) ? `~${file.slice(home.length)}` : file;
}

/** The last part of a path, without the folders. */
function baseName(uri: vscode.Uri): string {
	return uri.path.substring(uri.path.lastIndexOf('/') + 1);
}

/** The words of the tools sidebar and of the toolbar buttons, in the language of Pollis. */
function viewerText(): Record<string, string> {
	return {
		selectArea: vscode.l10n.t("Select Area"),
		selectAreaTitle: vscode.l10n.t("Select Area: drag on a page to take the text, the table or the picture of an area"),
		openFailed: vscode.l10n.t("{0} could not be opened: {1}"),
		tools: vscode.l10n.t("Tools:"),
		more: vscode.l10n.t("More"),
		toolsTitle: vscode.l10n.t("The sidebar at the right of the pages: the area of Select Area, and the tools that read the PDF or make files from it, in Julia"),
		showTools: vscode.l10n.t("Show the Tools"),
		hideTools: vscode.l10n.t("Hide the Tools"),
		readGroup: vscode.l10n.t("Read"),
		makeGroup: vscode.l10n.t("Make"),
		extractTextShort: vscode.l10n.t("The text of the pages (e.g. 1-3, 7) or the area"),
		tablesShort: vscode.l10n.t("The cells of a table in the area"),
		documentInfoShort: vscode.l10n.t("Title, pages, page size, metadata, links"),
		fontsShort: vscode.l10n.t("Whether the fonts are embedded, as publishers often require"),
		imagesShort: vscode.l10n.t("List the images, or save them"),
		attachmentsShort: vscode.l10n.t("List, save or add embedded files"),
		renderPagesShort: vscode.l10n.t("Pages or the area as PNG, JPEG or TIFF"),
		convertShort: vscode.l10n.t("Pages as SVG, PostScript, EPS, HTML or XML, or the area as PDF"),
		splitShort: vscode.l10n.t("One file per page, per range, or the pages given"),
		mergeShort: vscode.l10n.t("This PDF and others, in one file"),
		area: vscode.l10n.t("Area"),
		areaHint: vscode.l10n.t("Click Select Area {0} in the toolbar, then drag on a page. A click on the page or Escape clears the area."),
		areaNumbers: vscode.l10n.t("Page {0} · Left {1}, Top {2}, Width {3}, Height {4} pt"),
		clearArea: vscode.l10n.t("Clear the Area"),
		noText: vscode.l10n.t("There is no text in the area: the page may be a scan, or the area may hold only a picture."),
		tableSize: vscode.l10n.t("{0} rows, {1} columns"),
		tableShown: vscode.l10n.t("The first {0} rows are shown."),
		gap: vscode.l10n.t("Column Gap (pt)"),
		gapTitle: vscode.l10n.t("Words closer than this, side by side, are in the same column"),
		rowTolerance: vscode.l10n.t("Row Tolerance (pt)"),
		rowToleranceTitle: vscode.l10n.t("Words whose tops are this close are in the same row"),
		copyText: vscode.l10n.t("Copy Text"),
		copyTable: vscode.l10n.t("Copy Table"),
		copyTableTitle: vscode.l10n.t("The cells separated by tabs, to paste into a spreadsheet"),
		saveCsv: vscode.l10n.t("Save CSV..."),
		savePng: vscode.l10n.t("Save PNG..."),
		sendToAsk: vscode.l10n.t("Send to Ask Pollis"),
		sendText: vscode.l10n.t("Text"),
		sendTextTitle: vscode.l10n.t("The text of the area, as a file in the question of Ask Pollis"),
		sendTable: vscode.l10n.t("Table"),
		sendTableTitle: vscode.l10n.t("The cells of the area, as a CSV file in the question of Ask Pollis"),
		sendImage: vscode.l10n.t("Image"),
		sendImageTitle: vscode.l10n.t("A picture of the area in the question of Ask Pollis, for a cloud model"),
		fonts: vscode.l10n.t("Fonts"),
		images: vscode.l10n.t("Images"),
		attachments: vscode.l10n.t("Attachments"),
		save: vscode.l10n.t("Save..."),
		split: vscode.l10n.t("Split"),
		juliaCode: vscode.l10n.t("Julia Code"),
		copyCode: vscode.l10n.t("Copy"),
		working: vscode.l10n.t("Working..."),
		poppler: vscode.l10n.t("Tools"),
		popplerHint: vscode.l10n.t("Each tool reads the PDF or makes files from it with Poppler, a PDF library, in Julia, and shows its Julia code to copy or run in the REPL."),
		firstPage: vscode.l10n.t("First Page"),
		lastPage: vscode.l10n.t("Last Page"),
		lastPageTitle: vscode.l10n.t("Empty for the last page of the file"),
		password: vscode.l10n.t("Password"),
		passwordTitle: vscode.l10n.t("The user password of an encrypted file. Split, Merge and adding an attachment cannot read encrypted files."),
		onlyArea: vscode.l10n.t("Only the Area"),
		onlyAreaOf: vscode.l10n.t("Only the Area of Page {0}"),
		onlyAreaTitle: vscode.l10n.t("Extract Text, Render Pages and Convert to SVG or PDF take only the area of each page of the range. Select Area draws one."),
		noDocument: vscode.l10n.t("The PDF is still opening."),
		badRange: vscode.l10n.t("Give pages from 1 to {0}, the first before the last."),
		badResolution: vscode.l10n.t("Give a resolution from 10 to 2400 dpi."),
		run: vscode.l10n.t("Run"),
		running: vscode.l10n.t("Running {0}..."),
		toolFailed: vscode.l10n.t("{0} stopped with code {1}:"),
		runInRepl: vscode.l10n.t("Run in REPL"),
		runInReplTitle: vscode.l10n.t("Runs the code in the Julia REPL, which needs Poppler_jll in its environment"),
		nothingFound: vscode.l10n.t("Nothing was found: the file has none."),
		outputCut: vscode.l10n.t("The output is cut short here."),
		sendOutputTitle: vscode.l10n.t("The output, as a file in the question of Ask Pollis"),
		noFiles: vscode.l10n.t("No file was written."),
		oneFileWritten: vscode.l10n.t("{0} file was written in {1}"),
		filesWritten: vscode.l10n.t("{0} files were written in {1}"),
		open: vscode.l10n.t("Open"),
		reveal: process.platform === 'darwin' ? vscode.l10n.t("Reveal in Finder") : process.platform === 'win32' ? vscode.l10n.t("Reveal in File Explorer") : vscode.l10n.t("Open Containing Folder"),
		showTable: vscode.l10n.t("Show Table"),
		showImage: vscode.l10n.t("Show Image"),
		showText: vscode.l10n.t("Show Text"),
		hide: vscode.l10n.t("Hide"),
		notRead: vscode.l10n.t("The file could not be read."),
		extractText: vscode.l10n.t("Extract Text"),
		extractTextHint: vscode.l10n.t("pdftotext. Pages takes a list, such as 1-3, 7; empty, First Page to Last Page. Physical Layout keeps the columns of a table side by side."),
		textOrder: vscode.l10n.t("Text Order"),
		textOrderTitle: vscode.l10n.t("Reading Order undoes columns and hyphenation; Physical Layout keeps words where they are on the page, so table columns stay side by side; Content Stream Order keeps the order in which the file draws the text."),
		readingOrder: vscode.l10n.t("Reading Order"),
		physicalLayout: vscode.l10n.t("Physical Layout"),
		streamOrder: vscode.l10n.t("Content Stream Order"),
		tables: vscode.l10n.t("Tables"),
		tablesHint: vscode.l10n.t("The words, from pdftotext -tsv, grouped into rows by height and into columns by the gaps between them; Column Gap and Row Tolerance tune it."),
		tablesNeedArea: vscode.l10n.t("Select an area around the table first."),
		documentInfo: vscode.l10n.t("Document Info"),
		documentInfoHint: vscode.l10n.t("pdfinfo. Show gives the metadata, the links, the page boxes or another part of the file."),
		show: vscode.l10n.t("Show"),
		summary: vscode.l10n.t("Summary"),
		xmpMetadata: vscode.l10n.t("XMP Metadata"),
		pageBoxes: vscode.l10n.t("Page Boxes"),
		links: vscode.l10n.t("Links"),
		namedDestinations: vscode.l10n.t("Named Destinations"),
		structureTree: vscode.l10n.t("Structure Tree"),
		javaScript: vscode.l10n.t("JavaScript"),
		fontsHint: vscode.l10n.t("pdffonts: a font that is not embedded looks different on another computer."),
		fontModeTitle: vscode.l10n.t("Fonts Used lists every font; Substitutes lists the fonts drawn in place of those that are not embedded."),
		fontsUsed: vscode.l10n.t("Fonts Used"),
		substitutes: vscode.l10n.t("Substitutes"),
		imagesHint: vscode.l10n.t("pdfimages: List gives the size, colour and resolution of each image; Save in Own Format writes each as it is stored in the file."),
		imagesAction: vscode.l10n.t("Images"),
		imageModeTitle: vscode.l10n.t("Save in Own Format writes JPEG, JPEG 2000, JBIG2 and CCITT images as they are stored, CMYK images as TIFF and the rest as PNG."),
		list: vscode.l10n.t("List"),
		saveOwnFormat: vscode.l10n.t("Save in Own Format"),
		saveAsPng: vscode.l10n.t("Save as PNG"),
		renderPages: vscode.l10n.t("Render Pages"),
		renderPagesHint: vscode.l10n.t("pdftoppm: 150 dpi suits the screen, 300 suits print and OCR."),
		format: vscode.l10n.t("Format"),
		resolution: vscode.l10n.t("Resolution (dpi)"),
		resolutionTitle: vscode.l10n.t("Pixels per inch: 72 gives one pixel to a point; 150 suits the screen; 300 suits print and OCR."),
		colour: vscode.l10n.t("Colour"),
		inColour: vscode.l10n.t("Colour"),
		grey: vscode.l10n.t("Grey"),
		blackAndWhite: vscode.l10n.t("Black and White"),
		convert: vscode.l10n.t("Convert"),
		convertSvgHint: vscode.l10n.t("pdftocairo: one SVG per page, to edit in Inkscape or Illustrator or put in a web page."),
		convertPdfHint: vscode.l10n.t("pdftocairo: the area cut out of each page, with its text and lines kept sharp, for a figure or a table in another document."),
		convertPsHint: vscode.l10n.t("pdftops: for printers and older tools that read PostScript."),
		convertEpsHint: vscode.l10n.t("pdftops: one page as EPS, for LaTeX documents compiled with latex."),
		convertHtmlHint: vscode.l10n.t("pdftohtml: one web page with the text and the images."),
		convertXmlHint: vscode.l10n.t("pdftohtml: every line of text with its position and font, for programs to read."),
		pdfOfArea: vscode.l10n.t("PDF of the Area"),
		pdfNeedsArea: vscode.l10n.t("PDF of the Area needs Only the Area; Split writes whole pages."),
		convertFormatTitle: vscode.l10n.t("SVG takes the pages or the area; PDF of the Area needs Only the Area; EPS holds one page, the first of the range."),
		areaFormats: vscode.l10n.t("Only SVG and PDF of the Area take the area: turn Only the Area off for the other formats."),
		splitHint: vscode.l10n.t("pdfseparate, and pdfunite for the pages put in one file."),
		splitInto: vscode.l10n.t("Split Into"),
		filePerPage: vscode.l10n.t("One File per Page"),
		pagesIntoOne: vscode.l10n.t("Pages into One File"),
		filePerRange: vscode.l10n.t("One File per Range"),
		splitPages: vscode.l10n.t("Pages"),
		splitPagesTitle: vscode.l10n.t("Pages and ranges, such as 1-3, 5; empty for First Page to Last Page"),
		pagesPlaceholder: vscode.l10n.t("e.g. 1-3, 5"),
		badPages: vscode.l10n.t("Give pages from 1 to {0}, such as 1-3, 5."),
		merge: vscode.l10n.t("Merge"),
		mergeHint: vscode.l10n.t("pdfunite: this PDF first, then the ones chosen, in the order of their names."),
		attachmentsHint: vscode.l10n.t("pdfdetach lists or saves them; pdfattach adds a file in a new PDF."),
		action: vscode.l10n.t("Action"),
		saveAll: vscode.l10n.t("Save All"),
		addFile: vscode.l10n.t("Add a File"),
		noAttachments: vscode.l10n.t("The PDF has no attachments."),
	};
}

/** The PDF Viewer: pdf.js in a webview, which this side gives the bytes of the file, again when it changes. */
export class PdfViewerProvider implements vscode.CustomReadonlyEditorProvider<PdfDocument> {

	/** The panels that show each PDF, by its URI. */
	private readonly panels = new Map<string, Set<vscode.WebviewPanel>>();
	/** The page to show a PDF at when its panel opens, by its URI. */
	private readonly pendingPages = new Map<string, number>();
	/** The mode to open a PDF in when its panel opens, by its URI. */
	private readonly pendingModes = new Map<string, ViewerMode>();

	constructor(private readonly extensionUri: vscode.Uri, private readonly globalState: vscode.Memento) { }

	/**
	 * The folder a save dialog opens in: the one last chosen, else the PDF's, except in a depot of Julia, where nothing
	 * is to be saved, nor on a disk the dialog cannot reach: then Documents, or the home folder.
	 */
	private async saveFolder(pdfFolder: vscode.Uri): Promise<vscode.Uri> {
		const last = this.globalState.get<string>(SAVE_FOLDER_KEY);
		if (last && await isFolder(vscode.Uri.file(last))) {
			return vscode.Uri.file(last);
		}
		if (pdfFolder.scheme === 'file' && !inJuliaDepot(pdfFolder.fsPath)) {
			return pdfFolder;
		}
		const documents = vscode.Uri.file(path.join(os.homedir(), 'Documents'));
		return await isFolder(documents) ? documents : vscode.Uri.file(os.homedir());
	}

	/** Remembers the folder of a file or folder chosen in a save dialog, for the next one. */
	private async rememberFolder(folder: vscode.Uri): Promise<void> {
		if (folder.scheme === 'file') {
			await this.globalState.update(SAVE_FOLDER_KEY, folder.fsPath);
		}
	}

	/** Shows page `page` (from 1) of a PDF: in the panels that show it, else in the next one to open it. */
	showPage(uri: vscode.Uri, page: number): void {
		const open = this.panels.get(uri.toString());
		if (open?.size) {
			for (const panel of open) {
				panel.webview.postMessage({ command: 'page', page });
			}
		} else {
			this.pendingPages.set(uri.toString(), page);
		}
	}

	/** Puts the viewer of a PDF in `mode`: the panels that show it, else the next one to open it. */
	showMode(uri: vscode.Uri, mode: ViewerMode): void {
		const open = this.panels.get(uri.toString());
		if (open?.size) {
			for (const panel of open) {
				panel.webview.postMessage({ command: 'mode', mode });
			}
		} else {
			this.pendingModes.set(uri.toString(), mode);
		}
	}

	openCustomDocument(uri: vscode.Uri): PdfDocument {
		return new PdfDocument(uri);
	}

	async resolveCustomEditor(document: PdfDocument, panel: vscode.WebviewPanel): Promise<void> {
		const disposables: vscode.Disposable[] = [];
		panel.onDidDispose(() => disposables.forEach(disposable => disposable.dispose()));
		const key = document.uri.toString();
		const panels = this.panels.get(key) ?? new Set<vscode.WebviewPanel>();
		this.panels.set(key, panels.add(panel));
		disposables.push({
			dispose: () => {
				panels.delete(panel);
				if (!panels.size) {
					this.panels.delete(key);
				}
			}
		});
		const pdfjs = vscode.Uri.joinPath(this.extensionUri, 'pdfjs');
		const media = vscode.Uri.joinPath(this.extensionUri, 'media');
		panel.webview.options = { enableScripts: true, localResourceRoots: [pdfjs, media] };
		panel.webview.html = await this.html(panel.webview, document.uri);

		const folder = vscode.Uri.joinPath(document.uri, '..');
		const post = (message: unknown) => panel.webview.postMessage(message);
		const send = async (reload: boolean) => {
			try {
				const data = await readBytes(document.uri);
				// The page and the mode asked for before the panel opened, the first time
				const page = reload ? undefined : this.pendingPages.get(key);
				const mode = reload ? undefined : this.pendingModes.get(key);
				this.pendingPages.delete(key);
				this.pendingModes.delete(key);
				await post({ command: 'open', data, name: baseName(document.uri), reload, page, mode });
			} catch (error) {
				vscode.window.showWarningMessage(vscode.l10n.t("{0} could not be read: {1}", baseName(document.uri), String(error)));
			}
		};

		// A PDF written again, by LaTeX or another program, is shown again at the same page and zoom
		let reload: ReturnType<typeof setTimeout> | undefined;
		const watcher = vscode.workspace.createFileSystemWatcher(new vscode.RelativePattern(folder, baseName(document.uri)));
		const changed = () => {
			clearTimeout(reload);
			reload = setTimeout(() => send(true), 300);
		};
		disposables.push(watcher, watcher.onDidChange(changed), watcher.onDidCreate(changed), { dispose: () => clearTimeout(reload) });

		// The Julia code of the tools is coloured again in the colours of another theme
		disposables.push(vscode.window.onDidChangeActiveColorTheme(() => post({ command: 'themeChanged' })));

		// The files the Poppler tools have written, which the webview may reveal, open or read, and the folders they wrote in, which it may reveal
		const written = new Set<string>();
		let disposed = false;
		disposables.push({ dispose: () => { disposed = true; } });

		disposables.push(panel.webview.onDidReceiveMessage(async (message: ViewerMessage) => {
			switch (message.command) {
				case 'ready':
					await send(false);
					break;
				case 'saveAs': {
					const filters: { [name: string]: string[] } = message.kind === 'pdf' ? { [vscode.l10n.t("PDF Files")]: ['pdf'] }
						: message.kind === 'csv' ? { [vscode.l10n.t("CSV Files")]: ['csv'] }
							: message.kind === 'png' ? { [vscode.l10n.t("PNG Images")]: ['png'] } : {};
					const target = await vscode.window.showSaveDialog({ defaultUri: vscode.Uri.joinPath(await this.saveFolder(folder), message.name), filters });
					if (target) {
						await vscode.workspace.fs.writeFile(target, message.data);
						await this.rememberFolder(vscode.Uri.joinPath(target, '..'));
					}
					break;
				}
				case 'copy':
					await vscode.env.clipboard.writeText(message.text);
					break;
				case 'ask':
					try {
						await vscode.commands.executeCommand(ASK_POLLIS_ADD_ATTACHMENT_COMMAND_ID, { kind: message.kind, name: message.name, content: message.content });
					} catch {
						vscode.window.showWarningMessage(vscode.l10n.t("Ask Pollis is not available."));
					}
					break;
				case 'warn':
					vscode.window.showWarningMessage(message.text);
					break;
				case 'poppler': {
					const answer = await this.runPoppler(message.request, document.uri, folder, written, () => post({ command: 'popplerStatus', token: message.token, text: vscode.l10n.t("Julia is installing Poppler_jll, the first time it is needed...") }), () => disposed);
					await post({ command: 'popplerResult', token: message.token, answer });
					break;
				}
				case 'reveal':
				case 'openFile':
					// Only a file a tool has written, or for Reveal the folder it wrote in: the webview names no other
					if (written.has(message.path) && (message.command === 'reveal' || !await isFolder(vscode.Uri.file(message.path)))) {
						await vscode.commands.executeCommand(message.command === 'reveal' ? 'revealFileInOS' : 'vscode.open', vscode.Uri.file(message.path));
					}
					break;
				case 'readFile': {
					let data: Uint8Array | undefined;
					if (written.has(message.path)) {
						try {
							data = await readBytes(vscode.Uri.file(message.path));
						} catch {
							data = undefined;
						}
					}
					await post({ command: 'fileRead', token: message.token, data });
					break;
				}
				case 'runInRepl':
					await runInRepl(message.code);
					break;
				case 'colorize': {
					let colorized: { readonly html: string; readonly css: string } | undefined;
					try {
						colorized = await vscode.commands.executeCommand<{ readonly html: string; readonly css: string } | undefined>(COLORIZE_COMMAND_ID, message.code);
					} catch {
						colorized = undefined;
					}
					await post({ command: 'colorized', token: message.token, html: colorized?.html, css: colorized?.css });
					break;
				}
				case 'toolsShown':
					await this.globalState.update(TOOLS_SHOWN_KEY, message.shown);
					break;
				case 'menu': {
					let chosen: string | undefined;
					try {
						chosen = await vscode.commands.executeCommand<string | undefined>(SHOW_MENU_COMMAND_ID, message.menu);
					} catch {
						chosen = undefined;
					}
					await post({ command: 'menuChoice', token: message.token, id: chosen });
					break;
				}
			}
		}));
	}

	/**
	 * Runs a Poppler tool of the tools sidebar on the PDF: asks for the folder or the file to save to and for the files
	 * to merge or attach, puts their paths in the arguments, and runs it in the hidden Julia process. The files written
	 * join `written`.
	 */
	private async runPoppler(request: PopplerRequest, pdf: vscode.Uri, folder: vscode.Uri, written: Set<string>, installing: () => void, stopped: () => boolean): Promise<PopplerAnswer> {
		if (pdf.scheme !== 'file') {
			return { error: vscode.l10n.t("The tools read a file on the disk, and this PDF is not one: save a copy with File > Save As... and open it.") };
		}
		let dir: vscode.Uri | undefined;
		let out: vscode.Uri | undefined;
		if (request.output?.kind === 'folder') {
			const picked = await vscode.window.showOpenDialog({ title: vscode.l10n.t("Choose the Folder for the Files"), defaultUri: await this.saveFolder(folder), canSelectFiles: false, canSelectFolders: true, canSelectMany: false, openLabel: vscode.l10n.t("Save Here") });
			if (!picked?.[0]) {
				return { cancelled: true };
			}
			dir = picked[0];
		} else if (request.output?.kind === 'file') {
			out = await vscode.window.showSaveDialog({ defaultUri: vscode.Uri.joinPath(await this.saveFolder(folder), request.output.name), filters: fileFilter(request.output.extension) });
			if (!out) {
				return { cancelled: true };
			}
		}
		if ((dir && dir.scheme !== 'file') || (out && out.scheme !== 'file')) {
			return { error: vscode.l10n.t("The tools write files on the disk: choose a folder there.") };
		}
		const outputFolder = dir ?? (out && vscode.Uri.joinPath(out, '..'));
		if (outputFolder) {
			await this.rememberFolder(outputFolder);
		}
		let more: string[] = [];
		let attachment: string | undefined;
		if (request.pick === 'pdfs') {
			const picked = await vscode.window.showOpenDialog({ title: vscode.l10n.t("Choose the PDFs to Add after This One"), defaultUri: folder, canSelectFiles: true, canSelectMany: true, filters: fileFilter('pdf') });
			if (!picked?.length) {
				return { cancelled: true };
			}
			more = picked.filter(uri => uri.scheme === 'file').map(uri => uri.fsPath).sort((a, b) => a.localeCompare(b));
		} else if (request.pick === 'file') {
			const picked = await vscode.window.showOpenDialog({ title: vscode.l10n.t("Choose the File to Attach"), defaultUri: folder, canSelectFiles: true, canSelectMany: false });
			if (!picked?.[0] || picked[0].scheme !== 'file') {
				return { cancelled: true };
			}
			attachment = picked[0].fsPath;
		}

		/** An argument with the paths in place of its placeholders: none, one or, for {more}, several. */
		const resolve = (arg: string): string[] => {
			if (arg === '{pdf}') {
				return [pdf.fsPath];
			} else if (arg === '{out}' && out) {
				return [out.fsPath];
			} else if (arg === '{outStem}' && out) {
				return [out.fsPath.replace(/\.[^./\\]*$/, '')];
			} else if (arg === '{more}') {
				return more;
			} else if (arg === '{attachment}' && attachment) {
				return [attachment];
			} else if (arg === '{dir}' && dir) {
				return [dir.fsPath];
			} else if (arg.startsWith('{dir}/') && dir) {
				return [vscode.Uri.joinPath(dir, arg.slice('{dir}/'.length)).fsPath];
			}
			return [arg];
		};
		const julia = request.parts
			? { op: 'pages', file: pdf.fsPath, parts: request.parts.map(part => ({ pages: part.pages, out: resolve(part.out)[0] })) }
			: { op: 'run', tool: request.tool, args: (request.args ?? []).flatMap(resolve), dir: dir?.fsPath, pages: request.pages, replace: request.replace ? out?.fsPath : undefined };

		const answer = await askJulia(julia, installing, stopped);
		if (!answer) {
			return { error: vscode.l10n.t("The tools run in the Julia extension of Pollis, which is not enabled.") };
		} else if (answer.error === 'noJulia') {
			return { error: vscode.l10n.t("The tools run in Julia, which was not found: install Julia, or give its path in the settings of the Julia extension.") };
		} else if (answer.error === 'failed') {
			return { error: vscode.l10n.t("Julia could not install or start Poppler_jll: check the internet connection, then try again.") };
		} else if (answer.error) {
			return answer;
		}
		// A tool that writes the file chosen has written that file only
		let files = answer.files ?? [];
		if (out && !request.parts) {
			files = answer.code === 0 ? [out.fsPath] : [];
		}
		for (const file of files) {
			written.add(file);
		}
		if (outputFolder) {
			written.add(outputFolder.fsPath);
		}
		return {
			...answer, files,
			chosen: { dir: dir?.fsPath, out: out?.fsPath, more: request.pick === 'pdfs' ? more : undefined, attachment },
			folder: outputFolder && { path: outputFolder.fsPath, label: pathLabel(outputFolder.fsPath) },
		};
	}

	/** The page: viewer.html's body, with a policy that allows only the extension's files, and Pollis' script before the viewer's. */
	private async html(webview: vscode.Webview, resource: vscode.Uri): Promise<string> {
		const web = vscode.Uri.joinPath(this.extensionUri, 'pdfjs', 'web');
		const viewerHtml = new TextDecoder().decode(await vscode.workspace.fs.readFile(vscode.Uri.joinPath(web, 'viewer.html')));
		const body = /<body[^>]*>(?<body>[\s\S]*)<\/body>/.exec(viewerHtml)?.groups?.body ?? '';
		const url = (...path: string[]) => webview.asWebviewUri(vscode.Uri.joinPath(this.extensionUri, ...path)).toString();
		const config = {
			language: vscode.env.language,
			name: baseName(resource),
			// The path for the Julia code; a file of another file system has none
			path: resource.scheme === 'file' ? resource.fsPath.replace(/\\/g, '/') : '',
			urls: {
				worker: url('pdfjs', 'build', 'pdf.worker.mjs'),
				cmaps: `${url('pdfjs', 'web', 'cmaps')}/`,
				standardFonts: `${url('pdfjs', 'web', 'standard_fonts')}/`,
				wasm: `${url('pdfjs', 'web', 'wasm')}/`,
				iccs: `${url('pdfjs', 'web', 'iccs')}/`,
			},
			text: viewerText(),
			toolsShown: this.globalState.get<boolean>(TOOLS_SHOWN_KEY, false),
		};
		const n = nonce();
		const source = webview.cspSource;
		return `<!DOCTYPE html>
<html dir="ltr">
<head>
	<meta charset="utf-8">
	<meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'nonce-${n}' ${source} 'wasm-unsafe-eval'; worker-src blob:; style-src ${source} 'unsafe-inline'; img-src ${source} blob: data:; media-src blob:; font-src ${source} blob: data:; connect-src ${source} blob: data:; form-action 'none';">
	<base href="${url('pdfjs', 'web')}/">
	<link rel="resource" type="application/l10n" href="locale/locale.json">
	<link rel="stylesheet" href="viewer.css">
	<link rel="stylesheet" href="${url('media', 'pdfViewer.css')}">
	<script nonce="${n}" type="application/json" id="pollis-config">${scriptJson(config)}</script>
	<script nonce="${n}" type="module" src="../build/pdf.mjs"></script>
	<script nonce="${n}" type="module" src="${url('media', 'pdfViewer.js')}"></script>
	<script nonce="${n}" type="module" src="viewer.mjs"></script>
</head>
<body tabindex="0">${body}</body>
</html>`;
	}
}
