/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { CancellationToken } from '../../../../base/common/cancellation.js';
import { DisposableStore } from '../../../../base/common/lifecycle.js';
import { isAbsolute } from '../../../../base/common/path.js';
import { hash } from '../../../../base/common/hash.js';
import { basename, dirname, extname, isEqualOrParent, joinPath } from '../../../../base/common/resources.js';
import { URI } from '../../../../base/common/uri.js';
import { VSBuffer, streamToBuffer } from '../../../../base/common/buffer.js';
import { localize, localize2 } from '../../../../nls.js';
import { Action2, MenuId, registerAction2 } from '../../../../platform/actions/common/actions.js';
import { Categories } from '../../../../platform/action/common/actionCommonCategories.js';
import { ICommandService } from '../../../../platform/commands/common/commands.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { IDialogService, IFileDialogService } from '../../../../platform/dialogs/common/dialogs.js';
import { IFileService } from '../../../../platform/files/common/files.js';
import { ServicesAccessor } from '../../../../platform/instantiation/common/instantiation.js';
import { IProgressService, ProgressLocation } from '../../../../platform/progress/common/progress.js';
import { IRequestService, isSuccess } from '../../../../platform/request/common/request.js';
import { IStorageService, StorageScope, StorageTarget } from '../../../../platform/storage/common/storage.js';
import { IWorkspaceContextService } from '../../../../platform/workspace/common/workspace.js';
import { POLLIS_DOCUMENTS } from '../../../browser/actions/helpActions.js';
import { IEditorService } from '../../../services/editor/common/editorService.js';
import { IPathService } from '../../../services/path/common/pathService.js';
import { WebviewInput } from '../../webviewPanel/browser/webviewEditorInput.js';
import { IWebviewWorkbenchService } from '../../webviewPanel/browser/webviewWorkbenchService.js';
import { LIBRARY_PAGE_HELPERS, LIBRARY_PAGE_STYLE } from './libraryPage.js';
import { ONE_BLUE_BUTTON_CSS, ONE_BLUE_BUTTON_JS, voiceButtonsCss, voiceButtonsHtml, voiceButtonsScript } from '../../model/browser/webviews/webviewScaffold.js';
import { findPollisWorkspace, pollisWorkspaceFolderPath } from '../../pollisWorkspace/browser/pollisWorkspace.contribution.js';
import { openPdfInViewer } from '../../../common/pdfViewer.js';
import { IToolboxPanelsService } from '../common/toolboxPanels.js';
import { toolboxDocumentPdf } from './toolboxDocumentsPage.js';
import { userDocumentPdfOf } from './userDocumentsPage.js';
import { bookLatex, chapterLatex, fileStem, IBookChapter, latexText, LatexChapter } from '../common/collateLatex.js';
import { installedVignettes, isVignetteCompiled, IVignette, registryVignettes, vignettePdf, vignetteSources } from './vignettesPage.js';

// Help > Documentation > Collate Documents...: joins documents of Help > Documentation into one PDF, in the order the
// user gives them: the Tours, the Guides and the Drill-downs (~/.pollis/documents, compiled when the Julia REPL starts,
// or now with the Julia extension's command language-julia.pollisCompileDocuments), the Package Vignettes (installed or
// in the Pollis registry, vignettesPage.ts) and the Toolbox Vignettes (toolboxDocumentsPage.ts), each compiled first
// when it is not yet. The PDFs are copied into ~/.pollis/documents/collate/build/resources, beside NAME.tex, NAME the
// PDF's own name, which joins them with the LaTeX package pdfpages, after a title page and a contents page, a part for
// each category and a bookmark for each document. The Julia extension compiles it with PollisTeX
// (language-julia.pollisCompileVignette, as for a vignette) into ~/.pollis/documents/collate/PLACE, PLACE a hash of where
// the user chose, so that each collated PDF keeps its own source for Edit the LaTeX Source; the PDF is then copied to
// where the user chose. The order numbers, the title and the place are kept.
//
// Collate LaTeX joins the documents numbered in LaTeX Order as the chapters of one book, in LaTeX the user can edit
// (common/collateLatex.ts): from the copy of each document's sources beside its PDF, compiled first when it is not there
// (extensions/language-julia/scripts/terminalserver/document_source.jl), into the folder the user chose, NAME.tex and
// chapters/NN/, by default a folder of the documents folder of the Pollis Workspace, where User Documents lists it. A
// Tour, a vignette published only as a PDF and a document that cannot be joined as LaTeX go in as their PDF pages. The
// book is compiled as User Documents compiles a document, the PDF opens, and the LaTeX in the editor when asked.

const COLLATE_DOCUMENTS_COMMAND_ID = 'pollis.documentation.collate';

const COMPILE_VIGNETTE_COMMAND_ID = 'language-julia.pollisCompileVignette';
const COMPILE_DOCUMENTS_COMMAND_ID = 'language-julia.pollisCompileDocuments';

/** What the page keeps between sessions: the order numbers by document, the title and the place of the PDF. */
const ORDERS_STORAGE_KEY = 'pollis.collateDocuments.orders';
const TITLE_STORAGE_KEY = 'pollis.collateDocuments.title';
const LOCATION_STORAGE_KEY = 'pollis.collateDocuments.location';
/** And for Collate LaTeX: the order numbers, the folder, and whether the LaTeX opens in the editor. */
const LATEX_ORDERS_STORAGE_KEY = 'pollis.collateDocuments.latexOrders';
const LATEX_LOCATION_STORAGE_KEY = 'pollis.collateDocuments.latexLocation';
const OPEN_IN_EDITOR_STORAGE_KEY = 'pollis.collateDocuments.openInEditor';

/** The categories of documents, in the order the page lists them. */
type DocumentCategory = 'tours' | 'guides' | 'drillDowns' | 'packageVignettes' | 'toolboxVignettes';

const CATEGORY_TITLES: Readonly<Record<DocumentCategory, string>> = {
	tours: localize('collateDocuments.tours', "Tours"),
	guides: localize('collateDocuments.guides', "Guides"),
	drillDowns: localize('collateDocuments.drillDowns', "Drill-downs"),
	packageVignettes: localize('collateDocuments.packageVignettes', "Package Vignettes"),
	toolboxVignettes: localize('collateDocuments.toolboxVignettes', "Toolbox Vignettes"),
};

/** The category of a document of Help > Documentation, by its PDF's name. */
function helpCategory(file: string): DocumentCategory {
	return file === 'pollis-tour.pdf' || file === 'pollis-ai-brochure.pdf' ? 'tours' : file.startsWith('pollis-drilldown-') ? 'drillDowns' : 'guides';
}

/** A document the page lists, with how to have its PDF. */
interface ICollatable {
	/** help:FILE, package:NAME or toolbox:EXTENSION/TOOLBOX/NAME, which finds it again and keeps its order number. */
	readonly key: string;
	readonly category: DocumentCategory;
	readonly title: string;
	/** Where it comes from, as the page shows it. */
	readonly from: string;
	/** Its PDF, when it is there and up to date. */
	readonly ready: () => Promise<URI | undefined>;
	/** Makes its PDF: compiles it, or downloads it; undefined, with why, when it cannot. */
	readonly make: () => Promise<{ readonly pdf?: URI; readonly error?: string }>;
	/** Whether it is made from LaTeX sources, which its compile copies beside its PDF; not a vignette published as a PDF. */
	readonly hasSources: boolean;
}

/** A document as the page shows it. */
interface IListedDocument {
	readonly key: string;
	readonly category: DocumentCategory;
	readonly title: string;
	readonly from: string;
	readonly ready: boolean;
}

type CollateDocumentsMessage =
	| { readonly command: 'ready' }
	| { readonly command: 'orders'; readonly orders: Readonly<Record<string, number>> }
	| { readonly command: 'title'; readonly title: string }
	| { readonly command: 'location'; readonly location: string }
	| { readonly command: 'choose' }
	| { readonly command: 'collate'; readonly orders: Readonly<Record<string, number>>; readonly title: string; readonly location: string }
	| { readonly command: 'latexOrders'; readonly orders: Readonly<Record<string, number>> }
	| { readonly command: 'latexLocation'; readonly location: string }
	| { readonly command: 'chooseFolder' }
	| { readonly command: 'openInEditor'; readonly open: boolean }
	| { readonly command: 'collateLatex'; readonly orders: Readonly<Record<string, number>>; readonly title: string; readonly location: string; readonly openInEditor: boolean };

/** The copy of a document's sources that its compile leaves beside its PDF: NAME.source/ beside NAME.pdf. */
function sourceCopy(pdf: URI): URI {
	return joinPath(dirname(pdf), `${basename(pdf).replace(/\.pdf$/i, '')}.source`);
}

/** The LaTeX that joins `documents`, resources/documentNN.pdf in their order, after a title page and a contents page. */
function collatedSource(title: string, documents: readonly { readonly category: DocumentCategory; readonly title: string }[]): string {
	const lines = [
		'\\documentclass[a4paper]{article}',
		'\\usepackage{fontspec}',
		'\\usepackage{pdfpages}',
		'\\usepackage[bookmarks=true,bookmarksopen=true,hidelinks]{hyperref}',
		`\\hypersetup{pdftitle={${latexText(title)}},pdfcreator={Pollis}}`,
		'\\begin{document}',
		'\\pagestyle{empty}',
		'\\null\\vspace*{0.3\\textheight}',
		'\\begin{center}',
		`{\\Huge ${latexText(title)}\\par}\\vspace{1em}`,
		'{\\large \\today\\par}',
		'\\end{center}',
		'\\clearpage',
		'\\pdfbookmark[0]{Contents}{contents}',
		'\\tableofcontents',
		'\\clearpage',
	];
	let category: DocumentCategory | undefined;
	documents.forEach((document, index) => {
		const number = String(index + 1).padStart(2, '0');
		// A part where the category changes from the document before, then the document, each a bookmark
		const part = document.category !== category ? `1,part,0,{${latexText(CATEGORY_TITLES[document.category])}},part${number},` : '';
		category = document.category;
		lines.push(`\\includepdf[pages=-,addtotoc={${part}1,section,1,{${latexText(document.title)}},document${number}}]{resources/document${number}.pdf}`);
	});
	lines.push('\\end{document}', '');
	return lines.join('\n');
}

/** The open page, so a second request shows it again. */
let openPage: WebviewInput | undefined;

/** Opens the Collate Documents page, or shows it again when it is open. */
async function openCollateDocumentsPage(accessor: ServicesAccessor): Promise<void> {
	const webviewWorkbenchService = accessor.get(IWebviewWorkbenchService);
	const fileService = accessor.get(IFileService);
	const pathService = accessor.get(IPathService);
	const commandService = accessor.get(ICommandService);
	const progressService = accessor.get(IProgressService);
	const storageService = accessor.get(IStorageService);
	const requestService = accessor.get(IRequestService);
	const configurationService = accessor.get(IConfigurationService);
	const contextService = accessor.get(IWorkspaceContextService);
	const fileDialogService = accessor.get(IFileDialogService);
	const dialogService = accessor.get(IDialogService);
	const editorService = accessor.get(IEditorService);
	const toolboxPanelsService = accessor.get(IToolboxPanelsService);

	if (openPage && !openPage.isDisposed()) {
		webviewWorkbenchService.revealWebview(openPage, openPage.group ?? -1, false);
		return;
	}
	const pageTitle = localize('collateDocuments.title', "Collate Documents");
	const webviewInput = webviewWorkbenchService.openWebview(
		{
			title: pageTitle,
			options: { retainContextWhenHidden: true },
			contentOptions: { allowScripts: true, localResourceRoots: [] },
			extension: undefined,
		},
		'pollis.collateDocuments',
		pageTitle,
		undefined,
		{ group: undefined, preserveFocus: false }
	);
	webviewInput.webview.setHtml(pageHtml());
	openPage = webviewInput;

	const disposables = new DisposableStore();
	disposables.add(webviewInput.webview.onDidDispose(() => {
		openPage = undefined;
		disposables.dispose();
	}));

	const userHome = pathService.userHome({ preferLocal: true });
	const documentsFolder = joinPath(userHome, '.pollis', 'documents');

	/** Compiles a vignette's sources into `pdf` with PollisTeX, through the Julia extension; `own` for a document of the user's. */
	const compile = async (source: string, name: string, pdf: URI, own = false): Promise<{ readonly pdf?: URI; readonly error?: string }> => {
		let answer: { pdf?: string; error?: string } | undefined;
		try {
			answer = await commandService.executeCommand(COMPILE_VIGNETTE_COMMAND_ID, { source, name, pdf: pdf.fsPath, own });
		} catch {
			// The Julia extension is disabled, or not activated yet
		}
		return answer?.pdf ? { pdf } : {
			error: answer?.error === 'noJulia'
				? localize('collateDocuments.needsJulia', "Julia is needed to compile it, with PollisTeX.")
				: answer?.error && answer.error !== 'failed' ? answer.error : localize('collateDocuments.juliaStopped', "Julia stopped, or has not started yet."),
		};
	};

	// The documents of Help > Documentation, compiled together when one is missing
	let helpCompiled: Promise<void> | undefined;
	const helpDocuments: ICollatable[] = Object.entries(POLLIS_DOCUMENTS).map(([file, title]) => {
		const pdf = joinPath(documentsFolder, file);
		const ready = async () => await fileService.exists(pdf) ? pdf : undefined;
		return {
			key: `help:${file}`,
			category: helpCategory(file),
			title,
			from: localize('collateDocuments.fromPollis', "Pollis"),
			hasSources: true,
			ready,
			make: async () => {
				helpCompiled ??= commandService.executeCommand(COMPILE_DOCUMENTS_COMMAND_ID).then(() => undefined, () => undefined);
				await helpCompiled;
				return await ready() ? { pdf } : { error: localize('collateDocuments.helpNotCompiled', "It could not be compiled: its log is in ~/.pollis/documents.") };
			},
		};
	});

	const vignetteDocument = (entry: IVignette, installed: boolean): ICollatable => {
		const from = installed ? localize('collateDocuments.fromInstalled', "{0}, on this computer", `${entry.package}.jl`) : localize('collateDocuments.fromRegistry', "{0}, in the Pollis registry", `${entry.package}.jl`);
		// A vignette published with a PDF and no sources: the PDF itself, on this computer or downloaded
		if (!entry.source) {
			const downloaded = joinPath(documentsFolder, 'vignettes', `${entry.package}-${entry.version || 'latest'}.pdf`);
			const local = entry.pdf.startsWith('file:') ? URI.parse(entry.pdf) : undefined;
			const ready = async () => local ?? (await fileService.exists(downloaded) ? downloaded : undefined);
			return {
				key: `package:${entry.package}`, category: 'packageVignettes', title: entry.title, from, ready, hasSources: false,
				make: async () => {
					if (local) {
						return { pdf: local };
					}
					try {
						const context = await requestService.request({ type: 'GET', url: entry.pdf, callSite: 'collateDocuments.vignette' }, CancellationToken.None);
						if (!isSuccess(context)) {
							return { error: localize('collateDocuments.downloadStatus', "The server returned {0}.", context.res.statusCode ?? '?') };
						}
						await fileService.writeFile(downloaded, await streamToBuffer(context.stream));
						return { pdf: downloaded };
					} catch (e) {
						return { error: String(e) };
					}
				},
			};
		}
		const pdf = vignettePdf(userHome, entry);
		return {
			key: `package:${entry.package}`, category: 'packageVignettes', title: entry.title, from, hasSources: true,
			ready: async () => await isVignetteCompiled(fileService, entry, pdf) ? pdf : undefined,
			make: () => {
				const sources = vignetteSources(entry);
				return compile(sources.source, sources.name, pdf);
			},
		};
	};

	const toolboxDocuments = (): ICollatable[] => toolboxPanelsService.getToolboxes().flatMap(toolbox => toolbox.documents.map(document => {
		const pdf = toolboxDocumentPdf(userHome, toolbox, document);
		return {
			key: `toolbox:${toolbox.extensionId}/${toolbox.id}/${document.name}`,
			category: 'toolboxVignettes' as const,
			title: document.title,
			from: `${toolbox.title} ${toolbox.version}`,
			hasSources: true,
			ready: async () => await fileService.exists(pdf) ? pdf : undefined,
			make: () => compile(document.folder.fsPath, document.name, pdf),
		};
	}));

	// Every document, sent first without the vignettes of the registry, which come from GitHub, then with them
	let documents: ICollatable[] = [];
	const sendDocuments = async (withRegistry: boolean) => {
		const installed = await installedVignettes(fileService, pathService);
		const registry = withRegistry ? (await registryVignettes(requestService, configurationService)).vignettes.filter(entry => !installed.some(other => other.package === entry.package)) : [];
		const vignettes = [...installed.map(entry => vignetteDocument(entry, true)), ...registry.map(entry => vignetteDocument(entry, false))].sort((a, b) => a.title.localeCompare(b.title));
		const toolboxes = toolboxDocuments().sort((a, b) => a.from.localeCompare(b.from) || a.title.localeCompare(b.title));
		documents = [...helpDocuments, ...vignettes, ...toolboxes];
		const listed: IListedDocument[] = await Promise.all(documents.map(async document => ({
			key: document.key,
			category: document.category,
			title: document.title,
			from: document.from,
			ready: !!await document.ready(),
		})));
		webviewInput.webview.postMessage({ command: 'documents', documents: listed, complete: withRegistry });
	};
	disposables.add(toolboxPanelsService.onDidChange(() => sendDocuments(true)));

	// Where the PDF goes by default: the folder collated/ of the documents folder of the Pollis Workspace, else Documents
	const defaultLocation = async (title: string): Promise<string> => {
		const workspace = await findPollisWorkspace(contextService, fileService, configurationService);
		const folder = workspace ? joinPath(await pollisWorkspaceFolderPath(fileService, workspace, 'documents'), 'collated') : joinPath(userHome, 'Documents');
		return joinPath(folder, `${title.replace(/[\\/:*?"<>|]/g, '').trim() || 'Pollis Documentation'}.pdf`).fsPath;
	};

	// Where the LaTeX goes by default: a folder of the documents folder of the Pollis Workspace, else of Documents
	const defaultLatexLocation = async (title: string): Promise<string> => {
		const workspace = await findPollisWorkspace(contextService, fileService, configurationService);
		const folder = workspace ? await pollisWorkspaceFolderPath(fileService, workspace, 'documents') : joinPath(userHome, 'Documents');
		return joinPath(folder, fileStem(title, 'pollis_documentation')).fsPath;
	};

	let collating = false;
	const status = (text: string, kind: 'progress' | 'done' | 'error') => webviewInput.webview.postMessage({ command: 'status', text, kind });

	// The documents numbered in `orders`, in their order; undefined, said on the page, when none is or a number is repeated
	const numbered = (orders: Readonly<Record<string, number>>, noneChosen: string): ICollatable[] | undefined => {
		const chosen = documents.filter(document => Number.isInteger(orders[document.key]) && orders[document.key] > 0).sort((a, b) => orders[a.key] - orders[b.key]);
		if (!chosen.length) {
			status(noneChosen, 'error');
			return undefined;
		}
		const numbers = new Map<number, string[]>();
		for (const document of chosen) {
			numbers.set(orders[document.key], [...numbers.get(orders[document.key]) ?? [], document.title]);
		}
		const repeated = [...numbers.entries()].find(([, titles]) => titles.length > 1);
		if (repeated) {
			status(localize('collateDocuments.repeated', "{0} is the number of more than one document: {1}. Give each its own number.", repeated[0], repeated[1].join('; ')), 'error');
			return undefined;
		}
		return chosen;
	};

	// The documents numbered, in their order: each PDF made when it is not there, then joined
	const collate = async (orders: Readonly<Record<string, number>>, title: string, location: string) => {
		const chosen = numbered(orders, localize('collateDocuments.noneChosen', "Give a number in PDF Order to each document to collate: 1 for the first, 2 for the next, and so on."));
		const target = location.trim();
		if (!chosen) {
			return;
		}
		if (!target || !isAbsolute(target) || extname(URI.file(target)).toLowerCase() !== '.pdf') {
			status(localize('collateDocuments.badLocation', "Save As needs the full path of a PDF file, ending in .pdf. Choose... picks one."), 'error');
			return;
		}
		if (collating) {
			status(localize('collateDocuments.busy', "The documents are being collated already."), 'progress');
			return;
		}
		collating = true;
		try {
			await progressService.withProgress({ location: ProgressLocation.Window, title: localize('collateDocuments.progress', "Collating the documents") }, async () => {
				const build = joinPath(documentsFolder, 'collate', 'build');
				await fileService.del(build, { recursive: true }).catch(() => undefined);
				for (const [index, document] of chosen.entries()) {
					let pdf = await document.ready();
					if (!pdf) {
						status(localize('collateDocuments.compiling', "Compiling {0} ({1} of {2})...", document.title, index + 1, chosen.length), 'progress');
						const made = await document.make();
						if (!made.pdf) {
							status(localize('collateDocuments.cannotMake', "{0} could not be compiled: {1}", document.title, made.error ?? ''), 'error');
							return;
						}
						pdf = made.pdf;
					}
					await fileService.copy(pdf, joinPath(build, 'resources', `document${String(index + 1).padStart(2, '0')}.pdf`), true);
				}
				status(localize('collateDocuments.joining', "Joining {0} documents...", chosen.length), 'progress');
				const saved = URI.file(target);
				// Named after the PDF, as its copy in the documents folder will be after Edit the LaTeX Source
				const name = fileStem(basename(saved).replace(/\.pdf$/i, ''), 'collated');
				await fileService.writeFile(joinPath(build, `${name}.tex`), VSBuffer.fromString(collatedSource(title.trim() || 'Pollis Documentation', chosen)));
				// Compiled in Pollis's folder, so that the .labels and the copy of the sources beside the PDF stay there
				const place = (hash(saved.toString()) >>> 0).toString(16);
				const compiled = await compile(build.fsPath, name, joinPath(documentsFolder, 'collate', place, `${name}.pdf`));
				if (!compiled.pdf) {
					status(localize('collateDocuments.joinFailed', "The documents could not be joined: {0}", compiled.error ?? ''), 'error');
					return;
				}
				await fileService.createFolder(dirname(saved)).catch(() => undefined);
				await fileService.copy(compiled.pdf, saved, true);
				status(localize('collateDocuments.saved', "Saved {0} documents in {1}.", chosen.length, saved.fsPath), 'done');
				openPdfInViewer(commandService, saved);
			});
		} catch (e) {
			status(localize('collateDocuments.failed', "The documents could not be collated: {0}", String(e)), 'error');
		} finally {
			collating = false;
		}
	};

	// The documents numbered in LaTeX Order, as the chapters of one book in LaTeX, in the folder chosen, then compiled
	const collateLatex = async (orders: Readonly<Record<string, number>>, title: string, location: string, openInEditor: boolean) => {
		const chosen = numbered(orders, localize('collateDocuments.noneChosenLatex', "Give a number in LaTeX Order to each document to collate: 1 for the first, 2 for the next, and so on."));
		const target = location.trim();
		if (!chosen) {
			return;
		}
		if (!target || !isAbsolute(target) || extname(URI.file(target))) {
			status(localize('collateDocuments.badFolder', "LaTeX Folder needs the full path of a folder, without an extension. Choose... picks one."), 'error');
			return;
		}
		if (collating) {
			status(localize('collateDocuments.busy', "The documents are being collated already."), 'progress');
			return;
		}
		const folder = URI.file(target);
		// Never a folder that holds the user's own: it is emptied first
		const workspace = await findPollisWorkspace(contextService, fileService, configurationService);
		const ownFolders = [userHome, joinPath(userHome, 'Documents'), ...workspace ? [await pollisWorkspaceFolderPath(fileService, workspace, 'documents')] : []];
		if (ownFolders.some(own => isEqualOrParent(own, folder))) {
			status(localize('collateDocuments.folderOfItsOwn', "LaTeX Folder needs a folder of its own, such as a new folder in the documents folder of your Pollis Workspace: the folder is emptied first."), 'error');
			return;
		}
		const name = fileStem(basename(folder), 'collated');
		const main = joinPath(folder, `${name}.tex`);
		// A folder with files in it is emptied only when the user agrees: it may hold a book they have edited
		const existing = await fileService.resolve(folder).catch(() => undefined);
		if (existing?.children?.length) {
			const { confirmed } = await dialogService.confirm({
				message: localize('collateDocuments.replaceFolder', "{0} has files in it already. Replace them with the collated LaTeX?", folder.fsPath),
				detail: localize('collateDocuments.replaceDetail', "Everything in the folder is deleted first, the edits made there among it."),
				primaryButton: localize({ key: 'collateDocuments.replace', comment: ['&& denotes a mnemonic'] }, "&&Replace"),
			});
			if (!confirmed) {
				return;
			}
		}
		collating = true;
		try {
			await progressService.withProgress({ location: ProgressLocation.Window, title: localize('collateDocuments.progressLatex', "Collating the documents in LaTeX") }, async () => {
				await fileService.del(folder, { recursive: true }).catch(() => undefined);
				const chapters: IBookChapter[] = [];
				const latex: LatexChapter[] = [];
				const asPages: string[] = [];
				for (const [index, document] of chosen.entries()) {
					const chapterFolder = `chapters/${String(index + 1).padStart(2, '0')}`;
					// Its PDF, and the copy of its sources beside it: compiled again when the copy is not there yet
					let pdf = await document.ready();
					const withSources = document.hasSources && document.category !== 'tours';
					if (!pdf || (withSources && !await fileService.exists(sourceCopy(pdf)))) {
						status(localize('collateDocuments.compiling', "Compiling {0} ({1} of {2})...", document.title, index + 1, chosen.length), 'progress');
						const made = await document.make();
						if (!made.pdf) {
							status(localize('collateDocuments.cannotMake', "{0} could not be compiled: {1}", document.title, made.error ?? ''), 'error');
							return;
						}
						pdf = made.pdf;
					}
					let chapter: LatexChapter = {
						kind: 'pdf',
						reason: document.category === 'tours' ? localize('collateDocuments.reasonTour', "it is laid out as a brochure")
							: document.hasSources ? localize('collateDocuments.reasonNoCopy', "its sources are not beside its PDF")
								: localize('collateDocuments.reasonPdfOnly', "it is published as a PDF"),
					};
					const copy = withSources ? await fileService.resolve(sourceCopy(pdf)).catch(() => undefined) : undefined;
					if (copy?.children) {
						const texts = new Map<string, string>();
						const files: string[] = [];
						for (const child of copy.children) {
							if (child.isDirectory) {
								if (child.name === 'resources') {
									await fileService.copy(child.resource, joinPath(folder, chapterFolder, 'resources'), true);
								}
							} else if (extname(child.resource).toLowerCase() === '.tex') {
								texts.set(child.name, (await fileService.readFile(child.resource)).value.toString());
							} else {
								files.push(child.name);
								// Style files beside the book, where its preamble loads them; the others in the chapter's folder
								const place = /\.(?:sty|cls)$/i.test(child.name) ? joinPath(folder, child.name) : joinPath(folder, chapterFolder, child.name);
								await fileService.copy(child.resource, place, true);
							}
						}
						chapter = chapterLatex({ texts, files }, chapterFolder);
					}
					if (chapter.kind === 'latex') {
						await fileService.writeFile(joinPath(folder, chapterFolder, 'chapter.tex'), VSBuffer.fromString(chapter.text));
					} else {
						await fileService.copy(pdf, joinPath(folder, chapterFolder, 'document.pdf'), true);
						asPages.push(localize('collateDocuments.asPagesEntry', "{0} ({1})", document.title, chapter.reason));
					}
					chapters.push({ title: document.title, category: CATEGORY_TITLES[document.category], folder: chapterFolder, kind: chapter.kind });
					latex.push(chapter);
				}
				await fileService.writeFile(main, VSBuffer.fromString(bookLatex(title.trim() || 'Pollis Documentation', chapters, latex)));
				if (openInEditor) {
					await editorService.openEditor({ resource: main });
				}
				status(localize('collateDocuments.compilingBook', "Compiling the book of {0} documents...", chosen.length), 'progress');
				// Compiled where User Documents compiles it, so that it opens there without compiling again
				const compiled = await compile(folder.fsPath, name, userDocumentPdfOf(userHome, folder, name), true);
				const pages = asPages.length ? ` ${localize('collateDocuments.asPages', "As their PDF pages: {0}.", asPages.join('; '))}` : '';
				if (!compiled.pdf) {
					status(localize('collateDocuments.bookFailed', "The LaTeX is in {0}, but it could not be compiled: {1}", folder.fsPath, compiled.error ?? '') + pages, 'error');
					return;
				}
				status(localize('collateDocuments.savedLatex', "The LaTeX of {0} documents is in {1}.", chosen.length, folder.fsPath) + pages, 'done');
				openPdfInViewer(commandService, compiled.pdf, { toSide: openInEditor });
			});
		} catch (e) {
			status(localize('collateDocuments.failed', "The documents could not be collated: {0}", String(e)), 'error');
		} finally {
			collating = false;
		}
	};

	disposables.add(webviewInput.webview.onMessage(async (e: { message: CollateDocumentsMessage }) => {
		const message = e.message;
		switch (message.command) {
			case 'ready': {
				const title = storageService.get(TITLE_STORAGE_KEY, StorageScope.APPLICATION) || localize('collateDocuments.defaultTitle', "Pollis Documentation");
				const location = storageService.get(LOCATION_STORAGE_KEY, StorageScope.APPLICATION) || await defaultLocation(title);
				const orders = JSON.parse(storageService.get(ORDERS_STORAGE_KEY, StorageScope.APPLICATION) || '{}');
				const latexLocation = storageService.get(LATEX_LOCATION_STORAGE_KEY, StorageScope.APPLICATION) || await defaultLatexLocation(title);
				const latexOrders = JSON.parse(storageService.get(LATEX_ORDERS_STORAGE_KEY, StorageScope.APPLICATION) || '{}');
				const openInEditor = storageService.getBoolean(OPEN_IN_EDITOR_STORAGE_KEY, StorageScope.APPLICATION, true);
				webviewInput.webview.postMessage({ command: 'settings', title, location, orders, latexLocation, latexOrders, openInEditor });
				await sendDocuments(false);
				await sendDocuments(true);
				break;
			}
			case 'orders':
				storageService.store(ORDERS_STORAGE_KEY, JSON.stringify(message.orders), StorageScope.APPLICATION, StorageTarget.USER);
				break;
			case 'title':
				storageService.store(TITLE_STORAGE_KEY, message.title, StorageScope.APPLICATION, StorageTarget.USER);
				break;
			case 'location':
				storageService.store(LOCATION_STORAGE_KEY, message.location, StorageScope.APPLICATION, StorageTarget.USER);
				break;
			case 'choose': {
				const current = storageService.get(LOCATION_STORAGE_KEY, StorageScope.APPLICATION);
				const chosen = await fileDialogService.showSaveDialog({
					title: localize('collateDocuments.chooseTitle', "Save the Collated PDF As"),
					defaultUri: current && isAbsolute(current) ? URI.file(current) : URI.file(await defaultLocation(storageService.get(TITLE_STORAGE_KEY, StorageScope.APPLICATION) || 'Pollis Documentation')),
					filters: [{ name: 'PDF', extensions: ['pdf'] }],
				});
				if (chosen) {
					storageService.store(LOCATION_STORAGE_KEY, chosen.fsPath, StorageScope.APPLICATION, StorageTarget.USER);
					webviewInput.webview.postMessage({ command: 'location', location: chosen.fsPath });
				}
				break;
			}
			case 'collate':
				collate(message.orders, message.title, message.location);
				break;
			case 'latexOrders':
				storageService.store(LATEX_ORDERS_STORAGE_KEY, JSON.stringify(message.orders), StorageScope.APPLICATION, StorageTarget.USER);
				break;
			case 'latexLocation':
				storageService.store(LATEX_LOCATION_STORAGE_KEY, message.location, StorageScope.APPLICATION, StorageTarget.USER);
				break;
			case 'openInEditor':
				storageService.store(OPEN_IN_EDITOR_STORAGE_KEY, message.open, StorageScope.APPLICATION, StorageTarget.USER);
				break;
			case 'chooseFolder': {
				// A save dialog, so that the folder can be one not made yet: the name typed is the folder's
				const current = storageService.get(LATEX_LOCATION_STORAGE_KEY, StorageScope.APPLICATION);
				const chosen = await fileDialogService.showSaveDialog({
					title: localize('collateDocuments.chooseFolderTitle', "The Folder of the Collated LaTeX"),
					defaultUri: current && isAbsolute(current) ? URI.file(current) : URI.file(await defaultLatexLocation(storageService.get(TITLE_STORAGE_KEY, StorageScope.APPLICATION) || 'Pollis Documentation')),
				});
				if (chosen) {
					storageService.store(LATEX_LOCATION_STORAGE_KEY, chosen.fsPath, StorageScope.APPLICATION, StorageTarget.USER);
					webviewInput.webview.postMessage({ command: 'latexLocation', location: chosen.fsPath });
				}
				break;
			}
			case 'collateLatex':
				collateLatex(message.orders, message.title, message.location, message.openInEditor);
				break;
		}
	}));
}

/** The page: its texts come from here, the documents from the `documents` message. */
function pageHtml(): string {
	const text = {
		title: localize('collateDocuments.title', "Collate Documents"),
		intro: localize('collateDocuments.intro2', "Join documents of Help > Documentation into one: the Tours, the Guides and the Drill-downs, and the vignettes of packages and toolboxes. Give each document you want a number, 1 for the first. In PDF Order, for Collate PDF: one PDF of the documents as they are, with a contents page, a part for each category and a bookmark for each document. In LaTeX Order, for Collate LaTeX: one book in LaTeX, a chapter for each document, which you can edit and compile in User Documents; a Tour, and a document that cannot be joined as LaTeX, goes in as its PDF pages. A document without a number is left out, and one not compiled yet is compiled first. The numbers are kept for next time."),
		collatePdf: localize('collateDocuments.collatePdf', "Collate PDF"),
		collateLatex: localize('collateDocuments.collateLatex', "Collate LaTeX"),
		latexFolder: localize('collateDocuments.latexFolder', "LaTeX Folder"),
		openInEditor: localize('collateDocuments.openInEditor', "Open the LaTeX in the Editor"),
		latexOrder: localize('collateDocuments.latexOrder', "LaTeX Order"),
		clear: localize('collateDocuments.clear', "Clear the Numbers"),
		titleLabel: localize('collateDocuments.titleLabel', "Title"),
		saveAs: localize('collateDocuments.pdfFile', "PDF File"),
		choose: localize('collateDocuments.choose', "Choose..."),
		search: localize('collateDocuments.search', "Search documents"),
		loading: localize('collateDocuments.loading', "Reading the vignettes of the Pollis registry..."),
		noMatch: localize('collateDocuments.noMatch', "No document matches."),
		order: localize('collateDocuments.order', "PDF Order"),
		document: localize('collateDocuments.document', "Document"),
		from: localize('collateDocuments.from', "From"),
		pdf: localize('collateDocuments.pdf', "PDF"),
		ready: localize('collateDocuments.ready', "Ready"),
		toCompile: localize('collateDocuments.toCompile', "Compiled when collated"),
		chosen: localize('collateDocuments.chosenBoth', "{0} numbered for the PDF, {1} for the LaTeX"),
		categories: Object.entries(CATEGORY_TITLES),
	};
	return `<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline';">
	<style>${LIBRARY_PAGE_STYLE}
		${voiceButtonsCss}
	.hint { color: var(--vscode-descriptionForeground); margin: 0 0 8px 0; line-height: 1.4; max-width: 900px; }
	.bar { display: flex; gap: 8px; align-items: center; margin: 0 0 12px 0; }
	button.action { background: var(--vscode-button-secondaryBackground); color: var(--vscode-button-secondaryForeground); border: none; box-shadow: inset 0 0 0 1px var(--vscode-button-background); border-radius: 4px; padding: 4px 10px; font-size: 11px; cursor: pointer; opacity: 0.7; white-space: nowrap; }
	button.action:hover { opacity: 1; }
	${ONE_BLUE_BUTTON_CSS}
	.fields { display: grid; grid-template-columns: max-content minmax(0, 640px) max-content; gap: 6px 8px; align-items: center; margin: 0 0 12px 0; }
	.fields label { color: var(--vscode-descriptionForeground); }
	input.text, .search, input.order { padding: 4px 6px; font: inherit; color: var(--vscode-input-foreground); background: var(--vscode-input-background); border: 1px solid var(--vscode-input-border, var(--vscode-widget-border)); border-radius: 2px; }
	input.text:focus, .search:focus, input.order:focus { outline: 1px solid var(--vscode-focusBorder); outline-offset: -1px; }
	input.location { font-family: var(--vscode-editor-font-family); color: #e8a33d; }
	body.vscode-light input.location { color: #a8650d; }
	.search { width: 100%; max-width: 420px; margin: 0 0 8px 0; }
	input.order { width: 64px; text-align: right; }
	th.order, td.order { width: 90px; }
	tr.category th { font-size: 13px; text-transform: none; letter-spacing: 0; color: var(--vscode-foreground); padding-top: 16px; }
	td { padding-top: 6px; padding-bottom: 6px; }
	.status { margin: 0 0 12px 0; min-height: 1.4em; }
	.status.error { color: var(--vscode-errorForeground); }
	label.check { color: var(--vscode-foreground); display: flex; align-items: center; gap: 6px; }
	.count { font-size: 12px; color: var(--vscode-descriptionForeground); }</style>
</head>
<body>
<div class="container">
	<div class="title-row">
		<h1>${text.title}</h1>
		${voiceButtonsHtml}
	</div>
	<p class="subtitle">${text.intro}</p>
	<div class="fields">
		<label for="documentTitle">${text.titleLabel}</label>
		<input class="text" id="documentTitle" type="text">
		<span></span>
		<label for="location">${text.saveAs}</label>
		<input class="text location" id="location" type="text" spellcheck="false">
		<button class="link" id="choose">${text.choose}</button>
		<label for="latexLocation">${text.latexFolder}</label>
		<input class="text location" id="latexLocation" type="text" spellcheck="false">
		<button class="link" id="chooseFolder">${text.choose}</button>
		<span></span>
		<label class="check"><input type="checkbox" id="openInEditor"> ${text.openInEditor}</label>
		<span></span>
	</div>
	<div class="bar">
		<button class="action" id="collate">${text.collatePdf}</button>
		<button class="action" id="collateLatex">${text.collateLatex}</button>
		<button class="action" id="clear">${text.clear}</button>
		<span class="count" id="count"></span>
	</div>
	<p class="status" id="status"></p>
	<input class="search" id="search" type="search" placeholder="${text.search}" aria-label="${text.search}">
	<p class="hint" id="note"></p>
	<table id="table" hidden>
		<thead><tr><th class="order">${text.order}</th><th class="order">${text.latexOrder}</th><th class="name">${text.document}</th><th>${text.from}</th><th>${text.pdf}</th></tr></thead>
		<tbody id="documents"></tbody>
	</table>
</div>
<script>
	const vscode = acquireVsCodeApi();
	${voiceButtonsScript}
	${ONE_BLUE_BUTTON_JS}
	const TEXT = ${JSON.stringify(text)};
	${LIBRARY_PAGE_HELPERS}

	let documents;
	let orders = {};
	let latexOrders = {};
	const search = document.getElementById('search');
	const titleInput = document.getElementById('documentTitle');
	const locationInput = document.getElementById('location');
	const latexLocationInput = document.getElementById('latexLocation');
	const openInEditorInput = document.getElementById('openInEditor');

	function format(template, ...values) {
		return template.replace(/\\{(\\d+)\\}/g, (match, index) => String(values[Number(index)]));
	}

	function showCount() {
		const forPdf = documents ? documents.filter(entry => orders[entry.key] > 0).length : 0;
		const forLatex = documents ? documents.filter(entry => latexOrders[entry.key] > 0).length : 0;
		document.getElementById('count').textContent = forPdf || forLatex ? format(TEXT.chosen, forPdf, forLatex) : '';
	}

	function matches(entry) {
		const query = search.value.trim().toLowerCase();
		return !query || [entry.title, entry.from].some(field => (field || '').toLowerCase().includes(query));
	}

	// A box for a document's number in numbers, the orders of the PDF or of the LaTeX, kept by the message command
	function orderInput(entry, label, numbers, command) {
		const input = element('input', 'order');
		input.type = 'number';
		input.min = '1';
		input.step = '1';
		input.setAttribute('aria-label', label + ': ' + entry.title);
		input.value = numbers[entry.key] > 0 ? String(numbers[entry.key]) : '';
		input.addEventListener('change', () => {
			const value = Number(input.value);
			if (Number.isInteger(value) && value > 0) {
				numbers[entry.key] = value;
			} else {
				delete numbers[entry.key];
				input.value = '';
			}
			vscode.postMessage({ command, orders: numbers });
			showCount();
		});
		return input;
	}

	// (a) its number in the PDF, (b) its number in the LaTeX, (c) its title, (d) where it comes from, (e) whether its PDF is there
	function row(entry) {
		const row = element('tr');
		cell(row, 'order').appendChild(orderInput(entry, TEXT.order, orders, 'orders'));
		cell(row, 'order').appendChild(orderInput(entry, TEXT.latexOrder, latexOrders, 'latexOrders'));
		cell(row, 'name').appendChild(element('div', '', entry.title));
		cell(row).appendChild(element('div', 'small', entry.from));
		cell(row).appendChild(element('div', 'small', entry.ready ? TEXT.ready : TEXT.toCompile));
		return row;
	}

	function render() {
		if (!documents) {
			return;
		}
		const body = document.getElementById('documents');
		body.textContent = '';
		let shown = 0;
		for (const [category, title] of TEXT.categories) {
			const entries = documents.filter(entry => entry.category === category && matches(entry));
			if (!entries.length) {
				continue;
			}
			const heading = element('tr', 'category');
			const th = element('th', '', title);
			th.colSpan = 5;
			heading.appendChild(th);
			body.appendChild(heading);
			for (const entry of entries) {
				body.appendChild(row(entry));
			}
			shown += entries.length;
		}
		document.getElementById('table').hidden = !shown;
		const note = document.getElementById('note');
		note.textContent = !complete ? TEXT.loading : shown ? '' : TEXT.noMatch;
		note.hidden = complete && !!shown;
		showCount();
	}

	let complete = false;
	function setStatus(text, kind) {
		const status = document.getElementById('status');
		status.textContent = text;
		status.className = 'status' + (kind === 'error' ? ' error' : '');
	}

	search.addEventListener('input', render);
	titleInput.addEventListener('change', () => vscode.postMessage({ command: 'title', title: titleInput.value }));
	locationInput.addEventListener('change', () => vscode.postMessage({ command: 'location', location: locationInput.value }));
	latexLocationInput.addEventListener('change', () => vscode.postMessage({ command: 'latexLocation', location: latexLocationInput.value }));
	openInEditorInput.addEventListener('change', () => vscode.postMessage({ command: 'openInEditor', open: openInEditorInput.checked }));
	document.getElementById('chooseFolder').addEventListener('click', () => vscode.postMessage({ command: 'chooseFolder' }));
	document.getElementById('collateLatex').addEventListener('click', () => {
		setStatus('', 'progress');
		vscode.postMessage({ command: 'collateLatex', orders: latexOrders, title: titleInput.value, location: latexLocationInput.value, openInEditor: openInEditorInput.checked });
	});
	document.getElementById('choose').addEventListener('click', () => vscode.postMessage({ command: 'choose' }));
	document.getElementById('collate').addEventListener('click', () => {
		setStatus('', 'progress');
		vscode.postMessage({ command: 'collate', orders, title: titleInput.value, location: locationInput.value });
	});
	document.getElementById('clear').addEventListener('click', () => {
		orders = {};
		latexOrders = {};
		vscode.postMessage({ command: 'orders', orders });
		vscode.postMessage({ command: 'latexOrders', orders: latexOrders });
		render();
	});
	window.addEventListener('message', event => {
		const message = event.data;
		if (message.command === 'settings') {
			titleInput.value = message.title;
			locationInput.value = message.location;
			orders = message.orders || {};
			latexOrders = message.latexOrders || {};
			latexLocationInput.value = message.latexLocation;
			openInEditorInput.checked = message.openInEditor;
		} else if (message.command === 'documents') {
			documents = message.documents;
			complete = message.complete;
			render();
		} else if (message.command === 'location') {
			locationInput.value = message.location;
		} else if (message.command === 'latexLocation') {
			latexLocationInput.value = message.location;
		} else if (message.command === 'status') {
			setStatus(message.text, message.kind);
		}
	});
	vscode.postMessage({ command: 'ready' });
</script>
</body>
</html>`;
}

registerAction2(class extends Action2 {
	constructor() {
		super({
			id: COLLATE_DOCUMENTS_COMMAND_ID,
			title: {
				...localize2('collateDocuments.action', "Collate Documents..."),
				mnemonicTitle: localize({ key: 'miCollateDocuments', comment: ['&& denotes a mnemonic'] }, "Co&&llate Documents..."),
			},
			category: Categories.Help,
			f1: true,
			// Help > Documentation, defined in workbench/browser/actions/helpActions.ts, above Compile the Documents Now
			menu: { id: MenuId.for('MenubarHelpDocumentationMenu'), group: '2_compile', order: 0 },
		});
	}
	run(accessor: ServicesAccessor): Promise<void> {
		return openCollateDocumentsPage(accessor);
	}
});
