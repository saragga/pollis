/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

// OCR Files and Snippets, a page in the Time Arrow style of the scaffold (docs/workflows/workflow_ocr_files.tex): a
// scanned work read page by page beside its text, passages cut out and corrected as snippets, translated by a local
// model, in six steps, and read aloud, from Next Steps. A work is a folder, ~/.pollis/works/<id>/ (../common/ocrFiles.ts): the page
// reads and writes its record and snippets, and the process of ../node/ocrFiles.ts downloads its source and checks its
// words. A work added to the Pollis Workspace keeps its record and snippets in the workspace's works folder, and its
// source in ~/.pollis/works. The menu items of Explore > OCR Files and Snippets open the page at a step.

import { VSBuffer } from '../../../../base/common/buffer.js';
import { DeferredPromise } from '../../../../base/common/async.js';
import { safeIntl } from '../../../../base/common/date.js';
import { CancellationTokenSource } from '../../../../base/common/cancellation.js';
import { Event } from '../../../../base/common/event.js';
import { DisposableStore } from '../../../../base/common/lifecycle.js';
import { basename, joinPath } from '../../../../base/common/resources.js';
import { URI } from '../../../../base/common/uri.js';
import { localize, localize2 } from '../../../../nls.js';
import { Action2, registerAction2 } from '../../../../platform/actions/common/actions.js';
import { IClipboardService } from '../../../../platform/clipboard/common/clipboardService.js';
import { ICommandService } from '../../../../platform/commands/common/commands.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { IFileDialogService } from '../../../../platform/dialogs/common/dialogs.js';
import { IFileService } from '../../../../platform/files/common/files.js';
import { ServicesAccessor } from '../../../../platform/instantiation/common/instantiation.js';
import { INotificationService } from '../../../../platform/notification/common/notification.js';
import { IOpenerService } from '../../../../platform/opener/common/opener.js';
import { IRequestService } from '../../../../platform/request/common/request.js';
import { IStorageService, StorageScope, StorageTarget } from '../../../../platform/storage/common/storage.js';
import { IWorkspaceContextService } from '../../../../platform/workspace/common/workspace.js';
import { IEditorService } from '../../../services/editor/common/editorService.js';
import { IPathService } from '../../../services/path/common/pathService.js';
import { openPdfInViewer } from '../../../common/pdfViewer.js';
import { archivePageImages, archiveReaderUrl } from '../../browserView/common/internetArchive.js';
import { registerScaffoldPageHandlers } from '../../model/browser/handlers/scaffoldPage.handler.js';
import { parseToml } from '../../model/browser/common/tomlPanelData.js';
import { OCRFILES_METADATA } from '../../model/browser/webviews/ocrFiles.data.js';
import { buildWebviewHtml, ONE_BLUE_BUTTON_JS, pageNextSteps, voiceSpeakerSvg } from '../../model/browser/webviews/webviewScaffold.js';
import { CellEditType, CellKind } from '../../notebook/common/notebookCommon.js';
import { INotebookEditorModelResolverService } from '../../notebook/common/notebookEditorModelResolverService.js';
import { INotebookKernelService } from '../../notebook/common/notebookKernelService.js';
import { findPollisWorkspace, pollisWorkspaceFolder, pollisWorkspaceFolderPath } from '../../pollisWorkspace/browser/pollisWorkspace.contribution.js';
import { asWebviewUri } from '../../webview/common/webview.js';
import { WebviewInput } from '../../webviewPanel/browser/webviewEditorInput.js';
import { IWebviewWorkbenchService } from '../../webviewPanel/browser/webviewWorkbenchService.js';
import { IAskPollisMessage, IAskPollisService } from '../common/askPollis.js';
import { firstPage, IOcrCopy, IOcrCorrection, IOcrExtract, IOcrFilesService, IOcrFlagged, IOcrGlossaryTerm, IOcrSnippet, IOcrSourceInfo, IOcrTranslation, IOcrWork, OCR_FILES_COMMANDS, OCR_WORKS_FOLDER, OcrStep, scanPages, snippetFromToml, snippetToml, wordChanges, workFromToml, workToml } from '../common/ocrFiles.js';
import { compareCss } from './compareShared.js';
import { IInstalledModel } from './modelsInstalledPage.js';

/** The fields of the record the user edits in Open a Work. */
interface IRecordFields {
	readonly title: string;
	readonly author: string;
	readonly editor: string;
	readonly translator: string;
	readonly year: string;
	readonly languages: string;
	readonly entryType: string;
	readonly referenceKey: string;
	readonly summary: string;
	readonly summarySource: string;
}

type OcrMessage =
	| { readonly command: 'ready' }
	| { readonly command: 'openSource'; readonly source: string }
	// Not `openPdf`, which the page's Ask Pollis answers by opening a PDF in the PDF Viewer
	| { readonly command: 'openScannedPdf' }
	| { readonly command: 'selectWork'; readonly id: string }
	| { readonly command: 'saveRecord'; readonly record: IRecordFields }
	| { readonly command: 'downloadScan' }
	| { readonly command: 'stopDownload' }
	| { readonly command: 'page'; readonly page: number }
	| { readonly command: 'acceptWord'; readonly word: string }
	| { readonly command: 'addEntry'; readonly label: string; readonly page: number }
	| { readonly command: 'removeEntry'; readonly index: number }
	| { readonly command: 'entryHere'; readonly index: number; readonly page: number }
	| { readonly command: 'setOffset'; readonly page: number; readonly printed: number }
	| { readonly command: 'extract'; readonly entries: readonly number[]; readonly range: string }
	| { readonly command: 'recheck'; readonly text: string }
	| { readonly command: 'copies' }
	| { readonly command: 'compare'; readonly identifier: string; readonly text: string }
	| { readonly command: 'checkWithModel'; readonly text: string; readonly model: string }
	| { readonly command: 'saveSnippet'; readonly label: string; readonly text: string }
	| { readonly command: 'translate'; readonly language: string; readonly model: string; readonly unit?: number }
	| { readonly command: 'stopTranslation' }
	| { readonly command: 'saveGlossary'; readonly language: string; readonly terms: readonly { readonly term: string; readonly translation: string }[] }
	| { readonly command: 'snippet'; readonly work: string; readonly name: string; readonly action: 'copy' | 'citation' | 'notebook' | 'open' | 'translate' | 'aloud' }
	| { readonly command: 'addToWorkspace' }
	| { readonly command: 'openOnline' }
	| { readonly command: 'openScan' };

/** A work as the page knows it: its record, and the folder of its record and snippets. */
interface IWorkEntry {
	readonly work: IOcrWork;
	/** ~/.pollis/works/<id>, or the work's folder in the Pollis Workspace once it is added there. */
	readonly home: URI;
	readonly inWorkspace: boolean;
}

/** A unit of a translation: paragraphs of the snippet, a few hundred words together, and their translation. */
interface ITranslationUnit {
	readonly source: string;
	text: string;
}

/** The words of a unit of a translation, about: short paragraphs are put together until they have this many. */
const UNIT_WORDS = 250;

/** Where the page remembers the work open, the model and the language of the translations. */
const WORK_KEY = 'pollis.ocrFiles.work';
const MODEL_KEY = 'pollis.ocrFiles.model';
const LANGUAGE_KEY = 'pollis.ocrFiles.language';

/** The open page, so a second request shows it again. */
let openPage: { readonly input: WebviewInput; readonly actions: IOcrPageActions } | undefined;

/** The services of the page, taken from the accessor before any await. */
interface IOcrPageServices {
	readonly webviewWorkbenchService: IWebviewWorkbenchService;
	readonly ocrFilesService: IOcrFilesService;
	readonly askPollisService: IAskPollisService;
	readonly commandService: ICommandService;
	readonly openerService: IOpenerService;
	readonly editorService: IEditorService;
	readonly notificationService: INotificationService;
	readonly notebookEditorModelResolverService: INotebookEditorModelResolverService;
	readonly notebookKernelService: INotebookKernelService;
	readonly fileService: IFileService;
	readonly pathService: IPathService;
	readonly storageService: IStorageService;
	readonly clipboardService: IClipboardService;
	readonly fileDialogService: IFileDialogService;
	readonly contextService: IWorkspaceContextService;
	readonly configurationService: IConfigurationService;
	readonly requestService: IRequestService;
}

/** A short name for a folder, of letters, digits and hyphens. */
function slug(value: string): string {
	return value.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60) || 'work';
}

/** Today, `2026-11-25`. */
function today(): string {
	const now = new Date();
	return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

/** A list of pages as ranges: 3, 4, 5, 9 as `3-5, 9`. */
function pageRanges(pages: readonly number[]): string {
	const sorted = [...new Set(pages)].sort((a, b) => a - b);
	const ranges: string[] = [];
	for (let index = 0; index < sorted.length; index++) {
		const start = sorted[index];
		while (index + 1 < sorted.length && sorted[index + 1] === sorted[index] + 1) {
			index++;
		}
		ranges.push(start === sorted[index] ? String(start) : `${start}-${sorted[index]}`);
	}
	return ranges.join(', ');
}

/** The pages of `5-9, 12`, within 1 to `count`. */
function rangePages(range: string, count: number): number[] {
	const pages: number[] = [];
	for (const part of range.split(/[,;]/)) {
		const match = /^\s*(?<from>\d+)\s*(?:-\s*(?<to>\d+))?\s*$/.exec(part);
		if (match?.groups) {
			const from = Number(match.groups.from);
			const to = match.groups.to ? Number(match.groups.to) : from;
			for (let page = Math.max(1, from); page <= Math.min(count, to); page++) {
				pages.push(page);
			}
		}
	}
	return pages;
}

/** The names of languages in English. */
const LANGUAGE_NAMES = safeIntl.DisplayNames(['en'], { type: 'language' });

/** A language's name in English, from its code. */
function languageName(code: string): string {
	try {
		return LANGUAGE_NAMES.value.of(code) ?? code;
	} catch {
		return code;
	}
}

/** A model's name in a translation's label: its file's name without the folder and `.gguf`. */
function modelLabel(model: IInstalledModel): string {
	return model.file.split(/[\\/]/).pop()!.replace(/\.gguf$/i, '');
}

/** The source the user typed: an Internet Archive identifier or link, or a Project Gutenberg number or link. */
function parseSource(source: string): { readonly archive?: string; readonly gutenberg?: number } | undefined {
	const value = source.trim();
	const gutenberg = /gutenberg\.org\/(?:ebooks|cache\/epub|files)\/(?<number>\d+)/.exec(value)?.groups?.number ?? (/^\d+$/.test(value) ? value : undefined);
	if (gutenberg) {
		return { gutenberg: Number(gutenberg) };
	}
	const archive = /archive\.org\/(?:details|download|stream)\/(?<id>[A-Za-z0-9._-]+)/.exec(value)?.groups?.id ?? (/^[A-Za-z0-9._-]{3,}$/.test(value) ? value : undefined);
	return archive ? { archive } : undefined;
}

/** Where in a step the page goes: the field of a source in Open a Work, or the glossary in Translate. */
type OcrPlace = 'source' | 'glossary';

/** What the open page does when asked by a menu item: show a step, or add the work to the workspace. */
interface IOcrPageActions {
	readonly addToWorkspace: () => Promise<void>;
	readonly show: (step: OcrStep, place?: OcrPlace) => Promise<void>;
}

/**
 * The function that opens OCR Files and Snippets at a step, or shows it again there when it is open, then does what
 * `then` asks of it: its services taken from `accessor` now, so it can be called after an await.
 */
function ocrFilesPageOpener(accessor: ServicesAccessor): (step: OcrStep, then?: (page: IOcrPageActions) => Promise<void>) => Promise<void> {
	const webviewWorkbenchService = accessor.get(IWebviewWorkbenchService);
	const ocrFilesService = accessor.get(IOcrFilesService);
	const askPollisService = accessor.get(IAskPollisService);
	const commandService = accessor.get(ICommandService);
	const openerService = accessor.get(IOpenerService);
	const editorService = accessor.get(IEditorService);
	const notificationService = accessor.get(INotificationService);
	const notebookEditorModelResolverService = accessor.get(INotebookEditorModelResolverService);
	const notebookKernelService = accessor.get(INotebookKernelService);
	const fileService = accessor.get(IFileService);
	const pathService = accessor.get(IPathService);
	const storageService = accessor.get(IStorageService);
	const clipboardService = accessor.get(IClipboardService);
	const fileDialogService = accessor.get(IFileDialogService);
	const contextService = accessor.get(IWorkspaceContextService);
	const configurationService = accessor.get(IConfigurationService);
	const requestService = accessor.get(IRequestService);
	return (step, then) => openOcrFilesPage({ webviewWorkbenchService, ocrFilesService, askPollisService, commandService, openerService, editorService, notificationService, notebookEditorModelResolverService, notebookKernelService, fileService, pathService, storageService, clipboardService, fileDialogService, contextService, configurationService, requestService }, step, then);
}

async function openOcrFilesPage(services: IOcrPageServices, step: OcrStep, then?: (page: IOcrPageActions) => Promise<void>): Promise<void> {
	const { webviewWorkbenchService, ocrFilesService, askPollisService, commandService, openerService, editorService, notificationService, notebookEditorModelResolverService, notebookKernelService, fileService, pathService, storageService, clipboardService, fileDialogService, contextService, configurationService, requestService } = services;
	if (openPage && !openPage.input.isDisposed()) {
		webviewWorkbenchService.revealWebview(openPage.input, openPage.input.group ?? -1, false);
		await then?.(openPage.actions);
		if (!then) {
			await openPage.actions.show(step);
		}
		return;
	}
	const home = pathService.userHome({ preferLocal: true });
	const worksRoot = joinPath(home, OCR_WORKS_FOLDER);
	const title = localize('ocrFiles.title', "OCR Files and Snippets");
	const webviewInput = webviewWorkbenchService.openWebview(
		{
			title,
			options: { retainContextWhenHidden: true },
			// The page images, in the works' source folders
			contentOptions: { allowScripts: true, localResourceRoots: [worksRoot] },
			extension: undefined,
		},
		'pollis.ocrFiles',
		title,
		undefined,
		{ group: undefined, preserveFocus: false }
	);
	webviewInput.webview.setHtml(pageHtml());

	const disposables = new DisposableStore();
	disposables.add(registerScaffoldPageHandlers(webviewInput, 'ocrFiles', title, OCRFILES_METADATA.ocrFiles, openerService, editorService, commandService, notificationService, notebookEditorModelResolverService, notebookKernelService, fileService, pathService, storageService));
	const post = (message: object) => webviewInput.webview.postMessage(message);
	const fail = (error: unknown) => post({ command: 'error', message: error instanceof Error ? error.message : String(error) });
	const imageUri = (path: string | undefined) => path ? asWebviewUri(URI.file(path)).toString(true) : undefined;

	// ---- The works and the one open

	let works: IWorkEntry[] = [];
	let current: IWorkEntry | undefined;
	let pages = 0;
	let printed: readonly string[] = [];
	let hasImages = false;
	let shownPage = 1;
	let copies: readonly IOcrCopy[] | undefined;
	let extract: (IOcrExtract & { readonly pages: readonly number[] }) | undefined;
	let snippet: IOcrSnippet | undefined;
	let snippetHome: URI | undefined;
	/** The name of the snippet saved from the extract open, which saving again replaces. */
	let extractName: string | undefined;
	let units: ITranslationUnit[] = [];
	let translating: CancellationTokenSource | undefined;
	let models: readonly IInstalledModel[] = [];
	let ready = false;
	const whenReady = new DeferredPromise<void>();
	let pendingStep: { step: OcrStep; place?: OcrPlace } = { step };

	const sourceFolder = (id: string) => joinPath(worksRoot, id, 'source');
	const check = () => ({ languages: current?.work.languages ?? [], year: current?.work.year, words: current?.work.words ?? [] });

	/** The works of ~/.pollis/works and of the Pollis Workspace's works folder, the workspace's record first. */
	const readWorks = async (): Promise<IWorkEntry[]> => {
		const found = new Map<string, IWorkEntry>();
		const readFolder = async (folder: URI, inWorkspace: boolean) => {
			const children = await fileService.resolve(folder).then(stat => stat.children ?? [], () => []);
			for (const child of children.filter(item => item.isDirectory)) {
				const content = await fileService.readFile(joinPath(child.resource, 'work.toml')).then(file => file.value.toString(), () => undefined);
				if (content !== undefined) {
					try {
						const work = workFromToml(parseToml(content), child.name);
						found.set(work.id, { work, home: child.resource, inWorkspace });
					} catch {
						// A record that cannot be read is left out
					}
				}
			}
		};
		await readFolder(worksRoot, false);
		const workspace = await findPollisWorkspace(contextService, fileService, configurationService);
		if (workspace) {
			await readFolder(await pollisWorkspaceFolderPath(fileService, workspace, 'works'), true);
		}
		return [...found.values()].sort((a, b) => (a.work.title ?? a.work.id).localeCompare(b.work.title ?? b.work.id));
	};

	const writeWork = async (entry: IWorkEntry, work: IOcrWork) => {
		await fileService.writeFile(joinPath(entry.home, 'work.toml'), VSBuffer.fromString(workToml(work)));
		const updated = { ...entry, work };
		works = works.map(item => item.work.id === work.id ? updated : item);
		if (current?.work.id === work.id) {
			current = updated;
		}
		return updated;
	};

	/** The snippets of every work, each with its work and its file. */
	const readSnippets = async (): Promise<{ snippet: IOcrSnippet; entry: IWorkEntry; file: URI }[]> => {
		const result: { snippet: IOcrSnippet; entry: IWorkEntry; file: URI }[] = [];
		for (const entry of works) {
			const folder = joinPath(entry.home, 'snippets');
			const children = await fileService.resolve(folder).then(stat => stat.children ?? [], () => []);
			for (const child of children.filter(item => !item.isDirectory && item.name.endsWith('.toml'))) {
				const content = await fileService.readFile(child.resource).then(file => file.value.toString(), () => undefined);
				if (content !== undefined) {
					try {
						result.push({ snippet: snippetFromToml(parseToml(content), child.name.slice(0, -'.toml'.length)), entry, file: child.resource });
					} catch {
						// A snippet that cannot be read is left out
					}
				}
			}
		}
		return result;
	};

	const sendState = async () => {
		const snippets = await readSnippets();
		post({
			command: 'state',
			works: works.map(entry => ({ ...entry.work, inWorkspace: entry.inWorkspace })),
			current: current?.work,
			inWorkspace: current?.inWorkspace ?? false,
			pages,
			printed,
			hasImages,
			copies,
			snippet: snippet ? { ...snippet } : undefined,
			units,
			snippets: snippets.map(item => ({ ...item.snippet, workTitle: item.entry.work.title ?? item.entry.work.id })),
			models: models.filter(model => model.kind !== 'embedding' && model.kind !== 'reranker').map(model => ({ value: model.value ?? model.file, name: model.name, label: modelLabel(model) })),
			model: storageService.get(MODEL_KEY, StorageScope.APPLICATION),
			language: storageService.get(LANGUAGE_KEY, StorageScope.APPLICATION, 'en'),
		});
	};

	const showStep = (target: OcrStep, place?: OcrPlace) => {
		post({ command: 'step', step: target, place });
	};

	const selectWork = async (id: string | undefined) => {
		current = works.find(entry => entry.work.id === id);
		copies = undefined;
		extract = undefined;
		snippet = undefined;
		units = [];
		pages = 0;
		printed = [];
		if (!current) {
			return;
		}
		storageService.store(WORK_KEY, current.work.id, StorageScope.APPLICATION, StorageTarget.USER);
		const folder = sourceFolder(current.work.id).fsPath;
		try {
			if (!await ensureSource(current.work)) {
				return;
			}
			post({ command: 'opened' });
			printed = await ocrFilesService.printedPages(folder);
			pages = printed.length;
			hasImages = !current.work.scan.gutenberg;
		} catch (error) {
			fail(error);
		}
		shownPage = Math.min(Math.max(1, shownPage), Math.max(1, pages));
	};

	// The scan's size and the free disk space, for the choice between fetching pages when shown and downloading them all
	const sendScanSize = async () => {
		if (current && current.work.scan.archive) {
			try {
				post({ command: 'scanSize', size: await ocrFilesService.scanSize(sourceFolder(current.work.id).fsPath) });
			} catch {
				// No size when the source is not on this computer
			}
		}
	};

	disposables.add(ocrFilesService.onDidProgress(progress => {
		if (progress.phase === 'dictionary' || (current && progress.folder === sourceFolder(current.work.id).fsPath)) {
			post({ command: 'progress', progress });
		}
	}));

	// ---- Opening a work

	const newWorkId = (base: string) => {
		let id = slug(base);
		for (let index = 2; works.some(entry => entry.work.id === id); index++) {
			id = `${slug(base)}-${index}`;
		}
		return id;
	};

	const recordFrom = (id: string, info: IOcrSourceInfo, scan: IOcrWork['scan']): IOcrWork => ({
		id,
		title: info.title,
		author: info.author,
		year: info.year,
		languages: info.languages,
		entryType: 'book',
		summary: info.summary,
		summarySource: info.summarySource,
		// The difference between scan and printed pages, only for a scan whose pages have no printed numbers
		scan: { ...scan, offset: printed.some(label => label) ? undefined : info.offset },
		contents: info.contents,
		words: [],
		glossary: [],
	});

	const finishOpening = async (work: IOcrWork) => {
		const entry: IWorkEntry = { work, home: joinPath(worksRoot, work.id), inWorkspace: false };
		await fileService.writeFile(joinPath(entry.home, 'work.toml'), VSBuffer.fromString(workToml(work)));
		works = await readWorks();
		await selectWork(work.id);
		shownPage = 1;
		await sendState();
		await sendScanSize();
		showStep('read');
		await showPage(firstTextPage());
	};

	/** The first page of the first contents entry, or the first page. */
	const firstTextPage = () => {
		const first = current?.work.contents.find(entry => entry.pages);
		return first ? scanPages(first.pages, printed, current?.work.scan.offset ?? 0, pages)[0] ?? 1 : 1;
	};

	const openSource = async (source: string) => {
		const parsed = parseSource(source);
		if (!parsed) {
			post({ command: 'error', message: localize('ocrFiles.badSource', "Give an Internet Archive identifier or link, such as brievenaanzijnbr03gogh, or a Project Gutenberg number or link, such as 16659.") });
			return;
		}
		const existing = works.find(entry => parsed.archive ? entry.work.scan.archive === parsed.archive : entry.work.scan.gutenberg === parsed.gutenberg);
		if (existing) {
			await selectWork(existing.work.id);
			await sendState();
			await sendScanSize();
			showStep('read');
			await showPage(shownPage);
			return;
		}
		const id = newWorkId(parsed.archive ?? `gutenberg-${parsed.gutenberg}`);
		post({ command: 'opening', source: parsed.archive ?? String(parsed.gutenberg) });
		try {
			const folder = sourceFolder(id).fsPath;
			const info = parsed.archive ? await ocrFilesService.openArchive(parsed.archive, folder) : await ocrFilesService.openGutenberg(parsed.gutenberg!, folder);
			printed = await ocrFilesService.printedPages(folder);
			await finishOpening(recordFrom(id, info, parsed.archive ? { archive: parsed.archive } : { gutenberg: parsed.gutenberg }));
		} catch (error) {
			await fileService.del(joinPath(worksRoot, id), { recursive: true }).catch(() => undefined);
			fail(error);
		}
	};

	/** Runs a Poppler tool through the Julia extension; its standard output, or an error. */
	const poppler = async (tool: string, args: readonly string[], dir?: string): Promise<string> => {
		const answer = await commandService.executeCommand<{ code?: number; stdout?: string; stderr?: string; error?: string }>('language-julia.pollisPoppler', { op: 'run', tool, args, dir });
		if (answer?.error === 'installing') {
			throw new Error(localize('ocrFiles.popplerInstalling', "Pollis is installing the PDF tools, Poppler: try again in a minute."));
		}
		if (!answer || answer.error || answer.code !== 0) {
			throw new Error(answer?.error ?? answer?.stderr ?? localize('ocrFiles.popplerFailed', "The PDF tools could not read the file."));
		}
		return answer.stdout ?? '';
	};

	/** Copies a PDF into a work's source folder, where it is found again by its fingerprint, and reads its words with Poppler. */
	const readPdf = async (file: URI, folder: URI): Promise<IOcrSourceInfo> => {
		const pdf = joinPath(folder, 'source.pdf');
		await fileService.copy(file, pdf, true);
		const info = await poppler('pdfinfo', ['-enc', 'UTF-8', pdf.fsPath]);
		await poppler('pdftotext', ['-bbox-layout', '-enc', 'UTF-8', pdf.fsPath, joinPath(folder, 'text.html').fsPath], folder.fsPath);
		await poppler('pdftohtml', ['-xml', '-i', '-q', '-enc', 'UTF-8', pdf.fsPath, joinPath(folder, 'outline').fsPath], folder.fsPath).catch(() => '');
		const source = await ocrFilesService.openPdf(folder.fsPath, info);
		await fileService.del(joinPath(folder, 'outline.xml')).catch(() => undefined);
		return source;
	};

	/** A PDF in ~/.pollis/works with the fingerprint `sha256`, in the source folder of another work. */
	const findPdf = async (sha256: string): Promise<URI | undefined> => {
		const children = await fileService.resolve(worksRoot).then(stat => stat.children ?? [], () => []);
		for (const child of children.filter(item => item.isDirectory)) {
			const pdf = joinPath(child.resource, 'source', 'source.pdf');
			if (await fileService.exists(pdf) && await ocrFilesService.fingerprint(pdf.fsPath) === sha256) {
				return pdf;
			}
		}
		return undefined;
	};

	/**
	 * The source of a work whose record came from another computer, with the Pollis Workspace: fetched again from its
	 * permalink, or for a PDF, found by its fingerprint at its path, in ~/.pollis/works, or else asked for.
	 */
	const ensureSource = async (work: IOcrWork): Promise<boolean> => {
		const folder = sourceFolder(work.id);
		if (await fileService.exists(joinPath(folder, 'source.json'))) {
			return true;
		}
		const { archive, gutenberg, sha256, path } = work.scan;
		post({ command: 'opening', source: work.title ?? work.id });
		if (archive) {
			await ocrFilesService.openArchive(archive, folder.fsPath);
			return true;
		}
		if (gutenberg) {
			await ocrFilesService.openGutenberg(gutenberg, folder.fsPath);
			return true;
		}
		if (!sha256) {
			return false;
		}
		const atPath = path ? URI.file(path) : undefined;
		let file = atPath && await fileService.exists(atPath) && await ocrFilesService.fingerprint(atPath.fsPath) === sha256 ? atPath : await findPdf(sha256);
		if (!file) {
			const picked = await fileDialogService.showOpenDialog({
				title: localize('ocrFiles.findPdf', "Find the PDF of {0}", work.title ?? work.id),
				canSelectFiles: true,
				canSelectMany: false,
				filters: [{ name: 'PDF', extensions: ['pdf'] }],
			});
			if (picked?.[0] && await ocrFilesService.fingerprint(picked[0].fsPath) !== sha256) {
				throw new Error(localize('ocrFiles.otherPdf', "{0} is not the PDF of this work: its fingerprint differs from the record's.", basename(picked[0])));
			}
			file = picked?.[0];
		}
		if (!file) {
			post({ command: 'error', message: localize('ocrFiles.noPdf', "The PDF of {0} is not on this computer: choose the work again in Works when you have it, and Pollis asks for it.", work.title ?? work.id) });
			return false;
		}
		await readPdf(file, folder);
		return true;
	};

	const openPdf = async () => {
		const picked = await fileDialogService.showOpenDialog({
			title: localize('ocrFiles.pickPdf', "Open a Scanned PDF"),
			canSelectFiles: true,
			canSelectMany: false,
			filters: [{ name: 'PDF', extensions: ['pdf'] }],
		});
		const file = picked?.[0];
		if (!file) {
			return;
		}
		post({ command: 'opening', source: basename(file) });
		let id: string | undefined;
		try {
			const sha256 = await ocrFilesService.fingerprint(file.fsPath);
			const existing = works.find(entry => entry.work.scan.sha256 === sha256);
			if (existing) {
				await selectWork(existing.work.id);
				await sendState();
				showStep('read');
				await showPage(shownPage);
				return;
			}
			id = newWorkId(basename(file).replace(/\.pdf$/i, ''));
			const folder = sourceFolder(id);
			const source = await readPdf(file, folder);
			printed = await ocrFilesService.printedPages(folder.fsPath);
			await finishOpening(recordFrom(id, { ...source, title: source.title ?? basename(file).replace(/\.pdf$/i, '') }, { sha256, path: file.fsPath }));
		} catch (error) {
			if (id) {
				await fileService.del(joinPath(worksRoot, id), { recursive: true }).catch(() => undefined);
			}
			fail(error);
		}
	};

	// ---- Reading

	/** The page image of a PDF, drawn by Poppler the first time it is shown. */
	const pdfImage = async (page: number): Promise<string | undefined> => {
		if (!current?.work.scan.sha256) {
			return undefined;
		}
		const folder = sourceFolder(current.work.id);
		const name = String(page).padStart(4, '0');
		const image = joinPath(folder, 'images', `${name}.jpg`);
		if (!await fileService.exists(image)) {
			if (!await fileService.exists(joinPath(folder, 'images'))) {
				await fileService.createFolder(joinPath(folder, 'images'));
			}
			await poppler('pdftoppm', ['-f', String(page), '-l', String(page), '-singlefile', '-jpeg', '-scale-to-x', '1400', '-scale-to-y', '-1', joinPath(folder, 'source.pdf').fsPath, joinPath(folder, 'images', name).fsPath], joinPath(folder, 'images').fsPath);
		}
		return image.fsPath;
	};

	const showPage = async (page: number) => {
		if (!current || !pages) {
			return;
		}
		shownPage = Math.min(Math.max(1, Math.round(page)), pages);
		try {
			const read = await ocrFilesService.page(sourceFolder(current.work.id).fsPath, shownPage, check(), true);
			const image = read.image ?? (current.work.scan.sha256 ? await pdfImage(shownPage).catch(() => undefined) : undefined);
			post({ command: 'page', page: { ...read, image: imageUri(image) } });
		} catch (error) {
			fail(error);
		}
	};

	const updateContents = async (contents: IOcrWork['contents']) => {
		if (current) {
			await writeWork(current, { ...current.work, contents });
			await sendState();
		}
	};

	// ---- Extracting and correcting

	/** The scan's pages of the chosen contents entries and page range. */
	const chosenPages = (entries: readonly number[], range: string): number[] => {
		if (!current) {
			return [];
		}
		const contents = current.work.contents;
		const offset = current.work.scan.offset ?? 0;
		const chosen = entries.flatMap(index => {
			const entry = contents[index];
			const next = contents.slice(index + 1).map(item => firstPage(item.pages)).find(start => start !== undefined);
			return entry ? scanPages(entry.pages, printed, offset, pages, next) : [];
		});
		return [...new Set([...chosen, ...rangePages(range, pages)])].sort((a, b) => a - b);
	};

	const runExtract = async (entries: readonly number[], range: string) => {
		if (!current) {
			return;
		}
		const chosen = chosenPages(entries, range);
		if (!chosen.length) {
			post({ command: 'error', message: localize('ocrFiles.noPages', "Choose a contents entry with pages, or give pages of the scan, such as 87-88.") });
			return;
		}
		post({ command: 'extracting', pages: pageRanges(chosen) });
		try {
			const result = await ocrFilesService.extract(sourceFolder(current.work.id).fsPath, chosen, check());
			const images = [];
			for (const image of result.images) {
				images.push({ ...image, image: imageUri(image.image ?? (current.work.scan.sha256 ? await pdfImage(image.page).catch(() => undefined) : undefined)) });
			}
			extract = { ...result, images, pages: chosen };
			extractName = undefined;
			const label = entries.map(index => current!.work.contents[index]?.label).filter(Boolean).join('; ') || localize('ocrFiles.pagesLabel', "Pages {0}", pageRanges(chosen));
			snippet = undefined;
			units = [];
			post({ command: 'extract', extract, label, pagesLabel: pageRanges(chosen), language: current.work.languages[0] ?? '' });
		} catch (error) {
			fail(error);
		}
	};

	/** Which words of the text the language model finds misread, as suggestions only. */
	const checkWithModel = async (text: string, model: string) => {
		const language = languageName(current?.work.languages[0] ?? 'en');
		const messages: IAskPollisMessage[] = [
			{ role: 'system', content: `You check the text of an old printed book in ${language}, read from a scan by OCR, for words the OCR misread. List only the words that are misread: a letter read as another, words run together or split, a word that does not fit its sentence. Do not correct the spelling of the time, names or the author's own spelling. Answer with one line for each misread word, the word as it is in the text, then " => ", then its correction, and nothing else. Answer NONE when no word is misread.` },
			{ role: 'user', content: text.slice(0, 12000) },
		];
		const source = new CancellationTokenSource();
		post({ command: 'modelChecking' });
		try {
			let reply = '';
			const answer = await askPollisService.converse(model, messages, value => reply = value, source.token);
			if (answer.error) {
				post({ command: 'error', message: answer.error });
				return;
			}
			const flagged: IOcrFlagged[] = [];
			for (const line of reply.split('\n')) {
				const match = /^\s*[-*\d.)\s]*(?<word>[^=]+?)\s*=>\s*(?<correction>.+?)\s*$/.exec(line);
				const word = match?.groups?.word.replace(/^["'\u201c\u201e\u00ab]+|["'\u201d\u00bb]+$/g, '');
				if (!word || !match?.groups) {
					continue;
				}
				for (let at = text.indexOf(word); at >= 0; at = text.indexOf(word, at + word.length)) {
					// The word itself, not a part of a longer one
					if (!/\p{L}/u.test(text[at - 1] ?? '') && !/\p{L}/u.test(text[at + word.length] ?? '')) {
						flagged.push({ start: at, end: at + word.length, word, page: 0, flag: 'model', suggestions: [match.groups.correction.replace(/^["'\u201c\u201e\u00ab]+|["'\u201d\u00bb]+$/g, '')] });
					}
				}
			}
			post({ command: 'flags', flagged, kind: 'model' });
		} finally {
			source.dispose();
		}
	};

	const saveSnippet = async (label: string, text: string) => {
		if (!current || !extract) {
			return;
		}
		// Every change of a word, from the scan's reading to the text saved, kept as read and corrected, with its page
		const pageOf = (offset: number) => [...extract!.pageStarts].reverse().find(start => start.start <= offset)?.page;
		const corrections: IOcrCorrection[] = wordChanges(extract.text, text).map(change => ({ read: change.read, corrected: change.corrected, page: pageOf(change.start) }));
		const folder = joinPath(current.home, 'snippets');
		// The snippet saved from this extract before, whose translations and other fields are kept
		const previous = snippet && snippet.name === extractName && snippet.work === current.work.id ? snippet : undefined;
		let name = previous?.name ?? slug(label);
		if (!previous) {
			for (let index = 2; await fileService.exists(joinPath(folder, `${name}.toml`)); index++) {
				name = `${slug(label)}-${index}`;
			}
		}
		extractName = name;
		snippet = {
			name,
			work: current.work.id,
			label: label.trim() || name,
			language: current.work.languages[0] ?? '',
			pages: pageRanges(extract.pages),
			text,
			corrections,
			translations: previous?.translations ?? [],
			other: previous?.other,
		};
		snippetHome = current.home;
		await fileService.writeFile(joinPath(folder, `${name}.toml`), VSBuffer.fromString(snippetToml(snippet)));
		units = unitsOf(snippet.text, snippet.translations[0]);
		await sendState();
		post({ command: 'saved', name });
	};

	// ---- Translation

	/** The snippet's paragraphs gathered into units of about UNIT_WORDS words, with a translation's paragraphs when they match. */
	const unitsOf = (text: string, translation?: IOcrTranslation): ITranslationUnit[] => {
		const paragraphs = text.split(/\n\s*\n/).map(paragraph => paragraph.trim()).filter(Boolean);
		const result: ITranslationUnit[] = [];
		let gathered: string[] = [];
		let words = 0;
		for (const paragraph of paragraphs) {
			gathered.push(paragraph);
			words += paragraph.split(/\s+/).length;
			if (words >= UNIT_WORDS) {
				result.push({ source: gathered.join('\n\n'), text: '' });
				gathered = [];
				words = 0;
			}
		}
		if (gathered.length) {
			result.push({ source: gathered.join('\n\n'), text: '' });
		}
		// A saved translation, its units separated as they were written
		const saved = translation?.text.split(/\n\s*\n/) ?? [];
		if (saved.length) {
			let at = 0;
			for (const unit of result) {
				const count = unit.source.split(/\n\s*\n/).length;
				unit.text = saved.slice(at, at + count).join('\n\n');
				at += count;
			}
		}
		return result;
	};

	const glossaryLines = (language: string) => (current?.work.glossary ?? [])
		.filter(term => term.translations[language])
		.map(term => `${term.term} = ${term.translations[language]}`);

	/** The messages of a unit's translation: the paragraph before with its translation, the unit, the paragraph after, the glossary. */
	const translationMessages = (index: number, language: string, wholeSnippet: boolean): IAskPollisMessage[] => {
		const work = current!.work;
		const from = languageName(snippet?.language || work.languages[0] || 'en');
		const to = languageName(language);
		const about = [work.author, work.title, work.year].filter(Boolean).join(', ');
		const glossary = glossaryLines(language);
		const parts: string[] = [];
		if (glossary.length) {
			parts.push(`GLOSSARY (always translate these terms so):\n${glossary.join('\n')}`);
		}
		if (wholeSnippet) {
			parts.push(`THE WHOLE TEXT (context only, do not translate):\n${units.map(unit => unit.source).join('\n\n')}`);
		} else if (index > 0) {
			parts.push(`BEFORE (context only, do not translate):\n${units[index - 1].source}`);
			if (units[index - 1].text) {
				parts.push(`ITS TRANSLATION:\n${units[index - 1].text}`);
			}
		}
		parts.push(`PASSAGE TO TRANSLATE:\n${units[index].source}`);
		if (!wholeSnippet && index + 1 < units.length) {
			parts.push(`AFTER (context only, do not translate):\n${units[index + 1].source.split(/\n\s*\n/)[0]}`);
		}
		return [
			{ role: 'system', content: `You translate passages of ${about ? `${about}, ` : ''}a text in ${from}, into ${to}. Translate only the passage marked PASSAGE TO TRANSLATE, faithfully and completely, keeping its paragraphs, its names and its tone. Use the glossary's translations for its terms. Write the translation only, with no notes or comments.` },
			{ role: 'user', content: parts.join('\n\n') },
		];
	};

	const saveTranslation = async (language: string, model: string) => {
		if (!snippet || !snippetHome) {
			return;
		}
		const translation: IOcrTranslation = { language, model, made: today(), text: units.map(unit => unit.text.trim()).join('\n\n') };
		// One translation for each language and model: a new one replaces the one before
		const translations = [translation, ...snippet.translations.filter(item => !(item.language === language && item.model === model))];
		snippet = { ...snippet, translations };
		await fileService.writeFile(joinPath(snippetHome, 'snippets', `${snippet.name}.toml`), VSBuffer.fromString(snippetToml(snippet)));
	};

	const translate = async (language: string, modelValue: string, unit?: number) => {
		if (!snippet || !current) {
			post({ command: 'error', message: localize('ocrFiles.noSnippet', "Save a snippet first, in Extract and Correct, or choose one in Use It.") });
			return;
		}
		const model = models.find(item => (item.value ?? item.file) === modelValue);
		if (!model) {
			post({ command: 'error', message: localize('ocrFiles.noModel', "Choose a model of this computer. Compose > Local AI Models downloads one.") });
			return;
		}
		storageService.store(MODEL_KEY, modelValue, StorageScope.APPLICATION, StorageTarget.USER);
		storageService.store(LANGUAGE_KEY, language, StorageScope.APPLICATION, StorageTarget.USER);
		translating?.cancel();
		const source = new CancellationTokenSource();
		translating = source;
		const existing = snippet.translations.find(item => item.language === language && item.model === modelLabel(model));
		if (unit === undefined) {
			units = unitsOf(snippet.text, existing);
		}
		const todo = unit === undefined ? units.map((_, index) => index) : [unit];
		try {
			for (const index of todo) {
				if (source.token.isCancellationRequested) {
					break;
				}
				units[index].text = '';
				post({ command: 'translation', index, text: '', writing: true });
				const answer = await askPollisService.converse(modelValue, translationMessages(index, language, unit !== undefined), text => {
					units[index].text = text;
					post({ command: 'translation', index, text, writing: true });
				}, source.token);
				if (answer.error) {
					post({ command: 'error', message: answer.error });
					break;
				}
				post({ command: 'translation', index, text: units[index].text, writing: false });
			}
			if (!source.token.isCancellationRequested) {
				await saveTranslation(language, modelLabel(model));
			}
		} finally {
			if (translating === source) {
				translating = undefined;
			}
			source.dispose();
			post({ command: 'translationDone' });
			await sendState();
		}
	};

	// ---- Using snippets

	const citation = (entry: IWorkEntry, item: IOcrSnippet) => {
		const work = entry.work;
		const scan = item.pages ? rangePages(item.pages, Number.MAX_SAFE_INTEGER) : [];
		const sourcePrinted = entry.work.id === current?.work.id ? printed : [];
		const labels = scan.map(page => sourcePrinted[page - 1] || (work.scan.offset !== undefined ? String(page - work.scan.offset) : '')).filter(Boolean);
		const where = labels.length ? (labels.length > 1 ? `pp. ${labels[0]}-${labels[labels.length - 1]}` : `p. ${labels[0]}`) : item.pages ? `scan pages ${item.pages}` : '';
		const reference = [work.author, work.title && `${work.title}${work.year ? ` (${work.year})` : ''}`, where].filter(Boolean).join(', ');
		return `${reference}${work.referenceKey ? ` [${work.referenceKey}]` : ''}. ${item.label}.`;
	};

	const sendToNotebook = async (entry: IWorkEntry, item: IOcrSnippet) => {
		const quote = (text: string) => text.split('\n').map(line => `> ${line}`).join('\n');
		const cells = [`### ${item.label}\n\n${citation(entry, item)}\n\n${quote(item.text)}`];
		for (const translation of item.translations) {
			cells.push(`**${languageName(translation.language)}**, translated by ${translation.model} on ${translation.made}:\n\n${quote(translation.text)}`);
		}
		const ref = await notebookEditorModelResolverService.resolve({ untitledResource: undefined }, 'jupyter-notebook');
		const notebook = ref.object.notebook;
		notebook.applyEdits([{
			editType: CellEditType.Replace,
			index: 0,
			count: notebook.cells.length,
			cells: cells.map(source => ({ cellKind: CellKind.Markup, source, language: 'markdown', mime: undefined, outputs: [], metadata: {} })),
		}], true, undefined, () => undefined, undefined, false);
		Event.once(notebook.onWillDispose)(() => ref.dispose());
		await editorService.openEditor({ resource: notebook.uri, options: { override: 'jupyter-notebook' } });
	};

	const snippetAction = async (workId: string, name: string, action: 'copy' | 'citation' | 'notebook' | 'open' | 'translate' | 'aloud') => {
		const found = (await readSnippets()).find(item => item.entry.work.id === workId && item.snippet.name === name);
		if (!found) {
			return;
		}
		switch (action) {
			case 'copy':
				await clipboardService.writeText(found.snippet.text);
				post({ command: 'copied', name });
				break;
			case 'citation':
				await clipboardService.writeText(citation(found.entry, found.snippet));
				post({ command: 'copied', name });
				break;
			case 'notebook':
				await sendToNotebook(found.entry, found.snippet);
				break;
			case 'open':
				await editorService.openEditor({ resource: found.file });
				break;
			case 'translate':
			case 'aloud':
				if (current?.work.id !== workId) {
					await selectWork(workId);
				}
				snippet = found.snippet;
				snippetHome = found.entry.home;
				units = unitsOf(snippet.text, snippet.translations[0]);
				await sendState();
				showStep(action === 'translate' ? 'translate' : 'aloud');
				break;
		}
	};

	/** Copies the work's record and snippets into the Pollis Workspace's works folder, which is their home from then on. */
	const addToWorkspace = async () => {
		if (!current) {
			post({ command: 'error', message: localize('ocrFiles.noWork', "Open a work first, in Open a Work.") });
			return;
		}
		if (current.inWorkspace) {
			post({ command: 'info', message: localize('ocrFiles.alreadyInWorkspace', "{0} is in the Pollis Workspace already.", current.work.title ?? current.work.id) });
			return;
		}
		const workspace = await findPollisWorkspace(contextService, fileService, configurationService);
		if (!workspace) {
			post({ command: 'error', message: localize('ocrFiles.noWorkspace', "There is no Pollis Workspace: create or open one with File > New Pollis Workspace... or File > Open Pollis Workspace..., then add the work again.") });
			return;
		}
		const target = joinPath(await pollisWorkspaceFolder(fileService, workspace, 'works'), current.work.id);
		await fileService.copy(joinPath(current.home, 'work.toml'), joinPath(target, 'work.toml'), true);
		if (await fileService.exists(joinPath(current.home, 'snippets'))) {
			await fileService.copy(joinPath(current.home, 'snippets'), joinPath(target, 'snippets'), true);
		}
		// The workspace's copy is the one read and written from now on, while the workspace is found; the source stays in ~/.pollis/works
		const id = current.work.id;
		works = await readWorks();
		await selectWork(id);
		if (snippet && snippetHome) {
			snippetHome = target;
		}
		await sendState();
		post({ command: 'info', message: localize('ocrFiles.addedToWorkspace', "{0} is in the Pollis Workspace, in {1}: its record and snippets. The scan stays in ~/.pollis/works.", current?.work.title ?? id, target.fsPath) });
	};

	// ---- Messages

	const show = async (target: OcrStep, place?: OcrPlace) => {
		if (!ready) {
			pendingStep = { step: target, place };
			return;
		}
		showStep(target, place);
		if (target === 'read' && current) {
			await showPage(shownPage);
		}
	};

	disposables.add(webviewInput.webview.onMessage(async (e: { message: OcrMessage }) => {
		const message = e.message;
		try {
			switch (message.command) {
				case 'ready': {
					models = await commandService.executeCommand<IInstalledModel[]>('language-julia.pollisInstalledModels').catch(() => undefined) ?? [];
					works = await readWorks();
					await selectWork(storageService.get(WORK_KEY, StorageScope.APPLICATION) ?? works[0]?.work.id);
					ready = true;
					await sendState();
					await sendScanSize();
					await show(pendingStep.step, pendingStep.place);
					if (!whenReady.isSettled) {
						whenReady.complete();
					}
					break;
				}
				case 'openSource':
					if (typeof message.source === 'string') {
						await openSource(message.source);
					}
					break;
				case 'openScannedPdf':
					await openPdf();
					break;
				case 'selectWork':
					if (typeof message.id === 'string') {
						await selectWork(message.id);
						shownPage = 1;
						await sendState();
						await sendScanSize();
					}
					break;
				case 'saveRecord':
					if (current && message.record) {
						const fields = message.record;
						const textOf = (value: unknown) => typeof value === 'string' && value.trim() ? value.trim() : undefined;
						const year = Number(fields.year);
						await writeWork(current, {
							...current.work,
							title: textOf(fields.title),
							author: textOf(fields.author),
							editor: textOf(fields.editor),
							translator: textOf(fields.translator),
							year: Number.isInteger(year) && year > 0 ? year : undefined,
							languages: (textOf(fields.languages) ?? '').split(/[\s,;]+/).filter(Boolean),
							entryType: textOf(fields.entryType),
							referenceKey: textOf(fields.referenceKey),
							summary: textOf(fields.summary),
							summarySource: textOf(fields.summarySource),
						});
						await sendState();
						post({ command: 'recordSaved' });
					}
					break;
				case 'downloadScan':
					if (current) {
						const size = await ocrFilesService.downloadScan(sourceFolder(current.work.id).fsPath);
						post({ command: 'scanSize', size });
					}
					break;
				case 'stopDownload':
					if (current) {
						await ocrFilesService.stopDownload(sourceFolder(current.work.id).fsPath);
					}
					break;
				case 'page':
					if (typeof message.page === 'number') {
						await showPage(message.page);
					}
					break;
				case 'acceptWord':
					if (current && typeof message.word === 'string' && message.word.trim()) {
						const word = message.word.trim().replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, '');
						if (word && !current.work.words.includes(word)) {
							await writeWork(current, { ...current.work, words: [...current.work.words, word].sort((a, b) => a.localeCompare(b)) });
						}
						post({ command: 'accepted', word });
						await sendState();
					}
					break;
				case 'addEntry':
					if (current && typeof message.label === 'string' && message.label.trim() && typeof message.page === 'number') {
						const label = printed[message.page - 1] || String(message.page - (current.work.scan.offset ?? 0));
						// In the order of the pages, since an entry's pages run to the next entry's first page
						const contents = [...current.work.contents];
						const offset = current.work.scan.offset ?? 0;
						const at = contents.findIndex(entry => (scanPages(entry.pages, printed, offset, pages)[0] ?? 0) > message.page);
						contents.splice(at < 0 ? contents.length : at, 0, { label: message.label.trim(), pages: `${label}-` });
						await updateContents(contents);
					}
					break;
				case 'removeEntry':
					if (current && typeof message.index === 'number') {
						await updateContents(current.work.contents.filter((_, index) => index !== message.index));
					}
					break;
				case 'entryHere':
					if (current && typeof message.index === 'number' && typeof message.page === 'number') {
						const label = printed[message.page - 1] || String(message.page - (current.work.scan.offset ?? 0));
						await updateContents(current.work.contents.map((entry, index) => index === message.index ? { ...entry, pages: `${label}-` } : entry));
					}
					break;
				case 'setOffset':
					if (current && typeof message.page === 'number' && typeof message.printed === 'number') {
						await writeWork(current, { ...current.work, scan: { ...current.work.scan, offset: message.page - message.printed } });
						await sendState();
					}
					break;
				case 'extract':
					if (Array.isArray(message.entries) && typeof message.range === 'string') {
						await runExtract(message.entries.filter((index): index is number => typeof index === 'number'), message.range);
					}
					break;
				case 'recheck':
					if (typeof message.text === 'string') {
						post({ command: 'flags', flagged: await ocrFilesService.checkText(message.text, check()), kind: 'dictionary' });
					}
					break;
				case 'copies':
					if (current?.work.scan.archive) {
						copies ??= await ocrFilesService.otherCopies(current.work.scan.archive);
						post({ command: 'copies', copies });
					}
					break;
				case 'compare':
					if (current && typeof message.identifier === 'string' && typeof message.text === 'string' && extract) {
						post({ command: 'comparing' });
						const found = await ocrFilesService.compare(sourceFolder(current.work.id).fsPath, message.identifier, message.text, extract.pages);
						post({ command: 'flags', kind: 'secondScan', flagged: found.map(item => ({ start: item.start, end: item.end, word: item.word, page: 0, flag: 'secondScan', suggestions: [item.other] })) });
					}
					break;
				case 'checkWithModel':
					if (typeof message.text === 'string' && typeof message.model === 'string' && message.model) {
						await checkWithModel(message.text, message.model);
					}
					break;
				case 'saveSnippet':
					if (typeof message.label === 'string' && typeof message.text === 'string') {
						await saveSnippet(message.label, message.text);
					}
					break;
				case 'translate':
					if (typeof message.language === 'string' && typeof message.model === 'string') {
						await translate(message.language, message.model, typeof message.unit === 'number' ? message.unit : undefined);
					}
					break;
				case 'stopTranslation':
					translating?.cancel();
					break;
				case 'saveGlossary':
					if (current && typeof message.language === 'string' && Array.isArray(message.terms)) {
						const language = message.language;
						const edited = new Map(message.terms.filter(term => typeof term?.term === 'string' && term.term.trim()).map(term => [term.term.trim(), typeof term.translation === 'string' ? term.translation.trim() : '']));
						// The terms kept, their other languages too; the language edited set as given
						const glossary: IOcrGlossaryTerm[] = [];
						for (const term of current.work.glossary) {
							const translations = { ...term.translations };
							if (edited.has(term.term)) {
								if (edited.get(term.term)) {
									translations[language] = edited.get(term.term)!;
								} else {
									delete translations[language];
								}
								edited.delete(term.term);
								glossary.push({ term: term.term, translations });
							} else if (Object.keys(translations).some(key => key !== language)) {
								delete translations[language];
								glossary.push({ term: term.term, translations });
							}
						}
						for (const [term, translation] of edited) {
							glossary.push({ term, translations: translation ? { [language]: translation } : {} });
						}
						await writeWork(current, { ...current.work, glossary });
						await sendState();
						post({ command: 'glossarySaved' });
					}
					break;
				case 'snippet':
					if (typeof message.work === 'string' && typeof message.name === 'string') {
						await snippetAction(message.work, message.name, message.action);
					}
					break;
				case 'openScan':
					if (current?.work.scan.archive) {
						// The page read, as an image, in Pollis's browser, where Previous Page and Next Page go through the scan; the
						// scan's pages are numbered from 1 there, as here, and from 0 in their addresses
						const archive = current.work.scan.archive;
						const images = await archivePageImages(requestService, archive, undefined, 'pollis.ocrFiles.scan');
						const title = localize('ocrFiles.scanTitle', "{0}, Page {1} of the Scan", current.work.title ?? current.work.id, '{page}');
						await commandService.executeCommand('workbench.action.browser.open', images
							? { pages: { url: images, title, first: 1, last: pages || undefined, page: shownPage, offset: -1 } }
							: archiveReaderUrl(archive, undefined, shownPage - 1));
					} else if (current?.work.scan.gutenberg) {
						// The ebook's HTML version, at the words that begin the page read, where Previous Page and Next Page go
						// through the pages of OCR Files and Snippets; its page at Project Gutenberg when it has no HTML version
						const ebook = current.work.scan.gutenberg;
						const html = await ocrFilesService.ebookPages(sourceFolder(current.work.id).fsPath);
						const title = localize('ocrFiles.ebookTitle', "{0}, Page {1} of the Ebook", current.work.title ?? current.work.id, '{page}');
						await commandService.executeCommand('workbench.action.browser.open', html
							? { pages: { url: html.url, texts: html.texts, title, first: 1, last: html.texts.length, page: Math.min(shownPage, html.texts.length) } }
							: `https://www.gutenberg.org/ebooks/${ebook}`);
					} else if (current?.work.scan.sha256) {
						// The PDF read, the copy in the work's folder, at the page read, in the PDF Viewer, whose toolbar goes
						// through its pages, numbered from 1 there, as here
						await openPdfInViewer(commandService, joinPath(sourceFolder(current.work.id), 'source.pdf'), { page: shownPage });
					}
					break;
				case 'addToWorkspace':
					await addToWorkspace();
					break;
				case 'openOnline':
					if (current?.work.scan.archive) {
						await commandService.executeCommand('workbench.action.browser.open', archiveReaderUrl(current.work.scan.archive, undefined, shownPage - 1));
					} else if (current?.work.scan.gutenberg) {
						await commandService.executeCommand('workbench.action.browser.open', `https://www.gutenberg.org/ebooks/${current.work.scan.gutenberg}`);
					}
					break;
			}
		} catch (error) {
			fail(error);
		}
	}));

	disposables.add(webviewInput.webview.onDidDispose(() => {
		translating?.cancel();
		openPage = undefined;
		disposables.dispose();
	}));

	const actions: IOcrPageActions = { addToWorkspace, show };
	openPage = { input: webviewInput, actions };
	if (then) {
		await whenReady.p;
		await then(actions);
	}
}

/** The page: its texts come from here, the works and the pages from the messages of the page's handler. */
function pageHtml(): string {
	const text = {
		intro: localize('ocrFiles.intro', "Scanned works read page by page beside their text: a record for each work, its pages with the words the scan may have misread highlighted, passages cut out and corrected as snippets, translated by a local model you choose and read aloud. Open a work from the Internet Archive, Project Gutenberg or a PDF."),
		// Open a Work
		sourceLabel: localize('ocrFiles.sourceLabel', "Internet Archive or Project Gutenberg"),
		sourcePlaceholder: localize('ocrFiles.sourcePlaceholder', "An identifier or link, such as brievenaanzijnbr03gogh, or a Gutenberg number, such as 16659"),
		open: localize('ocrFiles.open', "Open"),
		openPdf: localize('ocrFiles.openPdf', "Open a PDF..."),
		opening: localize('ocrFiles.opening', "Opening {0}: downloading its text and the words of its pages..."),
		works: localize('ocrFiles.works', "Works"),
		noWorks: localize('ocrFiles.noWorks', "No work yet: open one above."),
		titleColumn: localize('ocrFiles.titleColumn', "Title"),
		authorColumn: localize('ocrFiles.authorColumn', "Author"),
		yearColumn: localize('ocrFiles.yearColumn', "Year"),
		languagesColumn: localize('ocrFiles.languagesColumn', "Languages"),
		sourceColumn: localize('ocrFiles.sourceColumn', "Source"),
		inWorkspace: localize('ocrFiles.inWorkspace', "In the Pollis Workspace"),
		record: localize('ocrFiles.record', "The Work's Record"),
		fieldTitle: localize('ocrFiles.fieldTitle', "Title"),
		fieldAuthor: localize('ocrFiles.fieldAuthor', "Author"),
		fieldEditor: localize('ocrFiles.fieldEditor', "Editor"),
		fieldTranslator: localize('ocrFiles.fieldTranslator', "Translator"),
		fieldYear: localize('ocrFiles.fieldYear', "Year"),
		fieldLanguages: localize('ocrFiles.fieldLanguages', "Languages"),
		fieldLanguagesHelp: localize('ocrFiles.fieldLanguagesHelp', "Codes such as fr, nl, the language of most of the text first: the checks use their dictionaries."),
		fieldEntryType: localize('ocrFiles.fieldEntryType', "Entry Type"),
		fieldReferenceKey: localize('ocrFiles.fieldReferenceKey', "Reference Key"),
		fieldSummary: localize('ocrFiles.fieldSummary', "Summary"),
		fieldSummarySource: localize('ocrFiles.fieldSummarySource', "Summary Source"),
		saveRecord: localize('ocrFiles.saveRecord', "Save the Record"),
		recordSaved: localize('ocrFiles.recordSaved', "Saved."),
		scan: localize('ocrFiles.scan', "The Scan"),
		scanSize: localize('ocrFiles.scanSize', "{0} pages, about {1} of page images; {2} free on this disk. Pages are fetched when shown, or all at once to read offline."),
		scanFetched: localize('ocrFiles.scanFetched', "{0} of {1} pages on this computer."),
		downloadScan: localize('ocrFiles.downloadScan', "Download the Whole Scan"),
		stopDownload: localize('ocrFiles.stopDownload', "Stop"),
		openScan: localize('ocrFiles.openScan', "Open the Scan"),
		openArchive: localize('ocrFiles.openArchive', "Open in the Internet Archive"),
		openEbook: localize('ocrFiles.openEbook', "Open the Ebook"),
		openGutenberg: localize('ocrFiles.openGutenberg', "Open in Project Gutenberg"),
		openPdfViewer: localize('ocrFiles.openPdfViewer', "Open the PDF"),
		addToWorkspace: localize('ocrFiles.addToWorkspace', "Add to Workspace"),
		// Read
		noWork: localize('ocrFiles.noWorkOpen', "Open a work first, in Open a Work."),
		noRecord: localize('ocrFiles.noRecord', "Open a work first, above: its record is shown and corrected here."),
		previous: localize('ocrFiles.previous', "Previous"),
		next: localize('ocrFiles.next', "Next"),
		pageOf: localize('ocrFiles.pageOf', "of {0}"),
		printedPage: localize('ocrFiles.printedPage', "printed page {0}"),
		noPrinted: localize('ocrFiles.noPrinted', "no printed number"),
		setPrinted: localize('ocrFiles.setPrinted', "Printed number of this page"),
		setOffset: localize('ocrFiles.setOffset', "Set"),
		loadingPage: localize('ocrFiles.loadingPage', "Reading the page..."),
		noImage: localize('ocrFiles.noImage', "No image of this page."),
		noText: localize('ocrFiles.noText', "This page has no text: a page that is only an image needs OCR first."),
		contents: localize('ocrFiles.contents', "Contents"),
		noContents: localize('ocrFiles.noContents', "No contents entries: add one at the page shown."),
		addEntry: localize('ocrFiles.addEntry', "Add an Entry Here"),
		entryLabel: localize('ocrFiles.entryLabel', "Label of the entry that starts on this page"),
		entryHere: localize('ocrFiles.entryHere', "Starts Here"),
		removeEntry: localize('ocrFiles.removeEntry', "Remove"),
		noPagesYet: localize('ocrFiles.noPagesYet', "pages not set"),
		flagDictionary: localize('ocrFiles.flagDictionary', "In no dictionary of the work's languages"),
		flagConfidence: localize('ocrFiles.flagConfidence', "The OCR was unsure of it: confidence {0}"),
		flagSecondScan: localize('ocrFiles.flagSecondScan', "Another copy reads it otherwise"),
		flagModel: localize('ocrFiles.flagModel', "The language model finds it misread"),
		suggestions: localize('ocrFiles.suggestionsLabel', "Suggestions: {0}"),
		acceptWord: localize('ocrFiles.acceptWord', "Accept as the Work's Word"),
		accepted: localize('ocrFiles.accepted', "{0} is one of the work's words now."),
		legend: localize('ocrFiles.legend', "Underlined: in no dictionary of the work's languages. Dotted: the OCR was unsure of it. Click a word to see why, and to accept a name or an old spelling as the work's word."),
		// Choose parts
		partsHelp: localize('ocrFiles.partsHelp', "Choose one or more contents entries, or give pages of the scan, or both."),
		pagesLabel: localize('ocrFiles.pagesRange', "Pages of the Scan"),
		pagesPlaceholder: localize('ocrFiles.pagesPlaceholder', "Such as 87-88, 92"),
		extract: localize('ocrFiles.extract', "Extract"),
		extracting: localize('ocrFiles.extracting', "Extracting pages {0}..."),
		// Extract and correct
		noExtract: localize('ocrFiles.noExtract', "Choose parts and extract them first, in Choose Parts."),
		snippetLabel: localize('ocrFiles.snippetLabel', "Label"),
		snippetText: localize('ocrFiles.snippetText', "Text"),
		flagged: localize('ocrFiles.flagged', "Words to Check"),
		noFlagged: localize('ocrFiles.noFlagged', "No word to check."),
		correct: localize('ocrFiles.correct', "Correct"),
		keep: localize('ocrFiles.keep', "Keep"),
		recheck: localize('ocrFiles.recheck', "Check Again"),
		copiesLabel: localize('ocrFiles.copiesLabel', "Another Copy"),
		findCopies: localize('ocrFiles.findCopies', "Find Other Copies"),
		noCopies: localize('ocrFiles.noCopies', "The Internet Archive has no other copy of this edition."),
		compare: localize('ocrFiles.compare', "Compare"),
		comparing: localize('ocrFiles.comparing', "Reading the other copy and comparing..."),
		modelLabel: localize('ocrFiles.modelLabel', "Model"),
		checkWithModel: localize('ocrFiles.checkWithModel', "Check with the Model"),
		modelChecking: localize('ocrFiles.modelChecking', "The model is reading the text..."),
		saveSnippet: localize('ocrFiles.saveSnippet', "Save the Snippet"),
		saved: localize('ocrFiles.saved', "Saved as {0}."),
		correctionsKept: localize('ocrFiles.correctionsKept', "Every change of a word is kept with the snippet as read and corrected, so the scan's reading can be restored."),
		pagesOfExtract: localize('ocrFiles.pagesOfExtract', "Pages {0} of the scan"),
		// Translate
		noSnippet: localize('ocrFiles.noSnippetYet', "Save a snippet first, in Extract and Correct, or choose one in Use It."),
		into: localize('ocrFiles.into', "Into"),
		noModels: localize('ocrFiles.noModels', "No chat model on this computer: Compose > Local AI Models downloads one."),
		translate: localize('ocrFiles.translate', "Translate"),
		stop: localize('ocrFiles.stop', "Stop"),
		translateAgain: localize('ocrFiles.translateAgain', "Translate Again"),
		translateAgainHelp: localize('ocrFiles.translateAgainHelp', "Translates this passage again with the whole snippet as context, for a passage that only later paragraphs explain."),
		writing: localize('ocrFiles.writing', "Writing..."),
		translationNote: localize('ocrFiles.translationNote', "Each request carries the paragraph before with its translation, the paragraph after as context, and the work's glossary. The translation is saved with the snippet, labelled with its model and the date."),
		glossary: localize('ocrFiles.glossary', "Glossary"),
		glossaryHelp: localize('ocrFiles.glossaryHelp', "Agreed translations of names and recurring terms into the language chosen above, used by every translation of the work."),
		term: localize('ocrFiles.term', "Term"),
		translation: localize('ocrFiles.translation', "Translation"),
		addTerm: localize('ocrFiles.addTerm', "Add a Term"),
		saveGlossary: localize('ocrFiles.saveGlossary', "Save the Glossary"),
		glossarySaved: localize('ocrFiles.glossarySaved', "Glossary saved."),
		// Read aloud
		readWhat: localize('ocrFiles.readWhat', "Read"),
		theSnippet: localize('ocrFiles.theSnippet', "The snippet, in {0}"),
		itsTranslation: localize('ocrFiles.itsTranslation', "Its translation into {0}, by {1}"),
		voice: localize('ocrFiles.voice', "Voice"),
		anyVoice: localize('ocrFiles.anyVoice', "The computer's voice for the language"),
		readAloud: localize('ocrFiles.readAloud', "Read Aloud"),
		readAloudCard: localize('ocrFiles.readAloudCard', "The snippet open, or one of its translations, read with a voice of the computer for its language"),
		pause: localize('ocrFiles.pause', "Pause"),
		resume: localize('ocrFiles.resume', "Resume"),
		noVoice: localize('ocrFiles.noVoice', "This computer has no voice for {0}: the text is read with its default voice."),
		// Use it
		snippets: localize('ocrFiles.snippets', "Snippets"),
		noSnippets: localize('ocrFiles.noSnippets', "No snippet yet: save one in Extract and Correct."),
		labelColumn: localize('ocrFiles.labelColumn', "Snippet"),
		workColumn: localize('ocrFiles.workColumn', "Work"),
		translationsColumn: localize('ocrFiles.translationsColumn', "Translations"),
		copy: localize('ocrFiles.copy', "Copy"),
		copyCitation: localize('ocrFiles.copyCitation', "Copy Citation"),
		sendToNotebook: localize('ocrFiles.sendToNotebook', "Send to Jupyter"),
		openFile: localize('ocrFiles.openFile', "Open"),
		copied: localize('ocrFiles.copied', "Copied."),
		error: localize('ocrFiles.error', "{0}"),
		progressText: localize('ocrFiles.progressText', "Downloading the scan's text: {0}"),
		progressWords: localize('ocrFiles.progressWords', "Reading the words of its pages: {0} of {1}"),
		progressImages: localize('ocrFiles.progressImages', "Downloading the page images: {0} of {1}"),
		progressDictionary: localize('ocrFiles.progressDictionary', "Downloading a dictionary..."),
		progressCopy: localize('ocrFiles.progressCopy', "Downloading the other copy's text..."),
	};
	const step = (id: string, stepTitle: string, bodyHtml: string, headHtml?: string) => ({ id, title: stepTitle, bodyHtml, headHtml });
	return buildWebviewHtml({
		title: localize('ocrFiles.title', "OCR Files and Snippets"),
		omitPoweredBy: !OCRFILES_METADATA.ocrFiles.packages.length,
		introHtml: text.intro,
		extraCss: `${compareCss}
		.ocr * { box-sizing: border-box; }
		.ocr input[type=text], .ocr input[type=number], .ocr textarea, .ocr select { font: inherit; color: var(--vscode-input-foreground); background: var(--vscode-input-background); border: 1px solid var(--vscode-input-border, transparent); border-radius: 2px; padding: 4px 6px; }
		.ocr input:focus, .ocr textarea:focus, .ocr select:focus { outline: 1px solid var(--vscode-focusBorder); }
		.ocr .label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.04em; color: var(--vscode-descriptionForeground); margin: 14px 0 6px 0; }
		.ocr .wide { flex: 1; min-width: 0; }
		.ocr table.list { border-collapse: collapse; width: 100%; font-size: 12px; }
		.ocr table.list th { text-align: left; font-weight: 600; color: var(--vscode-descriptionForeground); padding: 3px 8px 3px 0; border-bottom: 1px solid var(--vscode-widget-border, transparent); }
		.ocr table.list td { padding: 3px 8px 3px 0; vertical-align: top; }
		.ocr table.list tr.row-current td { color: var(--vscode-textLink-foreground); }
		.ocr table.list tr.pick { cursor: pointer; }
		.ocr table.list tr.pick:hover td { background: var(--vscode-list-hoverBackground); }
		.ocr .fields { display: grid; grid-template-columns: max-content 1fr; gap: 4px 10px; align-items: center; font-size: 12px; }
		.ocr .fields textarea { min-height: 54px; resize: vertical; }
		.ocr .bar { flex-wrap: wrap; margin: 6px 0; }
		.ocr .reader { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) 190px; gap: 12px; margin-top: 10px; }
		.ocr .reader.noImage { grid-template-columns: minmax(0, 1fr) 190px; }
		.ocr .scanBox { position: relative; align-self: start; }
		.ocr .scanBox img { width: 100%; display: block; border: 1px solid var(--vscode-widget-border, transparent); }
		.ocr .scanBox .mark { position: absolute; border: 1.5px solid #e8a33d; border-radius: 2px; pointer-events: none; }
		.ocr .scanBox .mark.confidence { border-style: dotted; }
		.ocr .scanBox .mark.chosen { background: rgba(232, 163, 61, 0.25); }
		.ocr .pageText { line-height: 1.6; font-size: 13px; max-height: 80vh; overflow-y: auto; }
		.ocr .pageText p { margin: 0 0 8px 0; }
		.ocr .w.dictionary, .ocr .flagWord.dictionary { text-decoration: underline wavy #e8a33d; text-underline-offset: 3px; cursor: pointer; }
		.ocr .w.confidence, .ocr .flagWord.confidence { text-decoration: underline dotted var(--vscode-descriptionForeground); text-underline-offset: 3px; cursor: pointer; }
		.ocr .w.chosen { background: rgba(232, 163, 61, 0.25); }
		.ocr .why { margin-top: 8px; padding: 6px 8px; font-size: 12px; background: var(--vscode-sideBar-background); border-radius: 3px; }
		.ocr .side { font-size: 12px; }
		.ocr .side .entry { padding: 3px 0; border-bottom: 1px solid var(--vscode-widget-border, transparent); }
		.ocr .side .entry .entryLabel { cursor: pointer; }
		.ocr .side .entry .entryLabel:hover { color: var(--vscode-textLink-foreground); }
		.ocr .side .entry .pages { color: var(--vscode-descriptionForeground); }
		.ocr .checks { display: flex; flex-direction: column; gap: 6px; max-height: 60vh; overflow-y: auto; }
		.ocr .check { display: grid; grid-template-columns: 220px 1fr; gap: 10px; align-items: center; padding: 6px; border-radius: 3px; background: var(--vscode-sideBar-background); }
		.ocr .crop { height: 48px; background-repeat: no-repeat; border: 1px solid var(--vscode-widget-border, transparent); background-color: var(--vscode-editor-background); }
		.ocr .checkBody { display: flex; flex-direction: column; gap: 4px; font-size: 12px; }
		.ocr .checkBody .bar { margin: 0; }
		.ocr .context { color: var(--vscode-descriptionForeground); }
		.ocr .context b { color: var(--vscode-foreground); }
		.ocr textarea.snippetText { width: 100%; min-height: 220px; resize: vertical; line-height: 1.5; }
		.ocr .unit { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; padding: 8px 0; border-bottom: 1px solid var(--vscode-widget-border, transparent); font-size: 13px; line-height: 1.5; }
		.ocr .unit .source, .ocr .unit .target { white-space: pre-wrap; }
		.ocr .unit .target.writing { color: var(--vscode-descriptionForeground); }
		.ocr .glossary input { width: 100%; }
		.ocr .speaker { display: inline-flex; width: 14px; height: 14px; vertical-align: -2px; margin-right: 4px; }
		.ocr .speaker svg { width: 14px; height: 14px; }
		.ocr .choice { display: flex; align-items: center; gap: 6px; font-size: 12px; margin: 3px 0; cursor: pointer; }
		.ocr .progressBar { height: 4px; background: var(--vscode-editorWidget-background); border-radius: 2px; overflow: hidden; margin-top: 6px; }
		.ocr .progressBar div { height: 100%; background: var(--vscode-progressBar-background); }
		.ocr .error { color: var(--vscode-errorForeground); font-size: 12px; margin-top: 6px; white-space: pre-wrap; }
`,
		steps: [
			step('step-open', localize('ocrFiles.stepOpen', "Open a Work"), `<div class="ocr" id="open"></div>`, `<span class="small" id="head-open"></span>`),
			step('step-read', localize('ocrFiles.stepRead', "Read"), `<div class="ocr" id="read"></div>`, `<span class="small" id="head-read"></span>`),
			step('step-parts', localize('ocrFiles.stepParts', "Choose Parts"), `<div class="ocr" id="parts"></div>`),
			step('step-extract', localize('ocrFiles.stepExtract', "Extract and Correct"), `<div class="ocr" id="extract"></div>`, `<span class="small" id="head-extract"></span>`),
			step('step-translate', localize('ocrFiles.stepTranslate', "Translate"), `<div class="ocr" id="translate"></div>`),
			step('step-use', localize('ocrFiles.stepUse', "Use It"), `<div class="ocr" id="use"></div>`, `<span class="small" id="head-use"></span>`),
		],
		// Read Aloud, an optional action: a card of Interpret in Next Steps, whose panel the page's script fills
		...pageNextSteps({
			interpret: [
				{ id: 'aloudStep', label: text.readAloud, desc: text.readAloudCard, event: 'pollis-aloud-step' },
			],
		}),
		pageScriptJs: `
	${ONE_BLUE_BUTTON_JS.trim()}
	(() => {
	const TEXT = ${JSON.stringify(text)};
	const SPEAKER = ${JSON.stringify(voiceSpeakerSvg)};
	const STEPS = { open: 'step-open', read: 'step-read', parts: 'step-parts', extract: 'step-extract', translate: 'step-translate', use: 'step-use' };
	let state = { works: [], snippets: [], models: [], units: [], printed: [], pages: 0 };
	let page;
	let chosenWord;
	let extractState;
	let flags = [];
	let scanSize;
	let progress;
	let errorText = '';
	let busy = '';
	let copies;
	let chosenEntries = new Set();
	let range = '';
	let glossaryRows;
	let speaking = false;

	function element(tag, className, content) {
		const node = document.createElement(tag);
		if (className) { node.className = className; }
		if (content !== undefined) { node.textContent = content; }
		return node;
	}
	function format(template, ...values) {
		return values.reduce((result, value, index) => result.split('{' + index + '}').join(value), template);
	}
	// A button of a row, whose blue the scaffold's script gives: the first at first, then the last hovered
	function button(label, onClick) {
		const node = element('button', 'action', label);
		node.addEventListener('click', onClick);
		return node;
	}
	// A row of buttons, one of them blue
	function buttonRow(...buttons) {
		const row = element('div', 'bar');
		for (const item of buttons) { row.appendChild(item); }
		return row;
	}
	function bytes(value) {
		if (value === undefined || value === null) { return '?'; }
		const units = ['B', 'KB', 'MB', 'GB', 'TB'];
		let index = 0;
		while (value >= 1000 && index < units.length - 1) { value /= 1000; index++; }
		return (index ? value.toFixed(1) : value) + ' ' + units[index];
	}
	function languageName(code) {
		try { return new Intl.DisplayNames(['en'], { type: 'language' }).of(code) || code; } catch { return code; }
	}
	// The controls of a step drawn before there is anything for them to work on: shown as they are, the blue button
	// included, but a click or a change in them does nothing except say why, below the row clicked
	function inactive(node, reason) {
		const ignore = event => {
			event.stopPropagation();
			if (event.type !== 'click') { return; }
			const control = event.target.closest('button, input, select, textarea, label.choice');
			if (!control) { return; }
			if (control.matches('button, input[type=radio], input[type=checkbox], label.choice')) { event.preventDefault(); }
			node.querySelectorAll(':scope .why-inactive').forEach(note => note.remove());
			const row = control.closest('.bar, .fields, label.choice, table') || control;
			row.after(element('p', 'status why-inactive', reason));
		};
		for (const type of ['click', 'change', 'input', 'keydown']) { node.addEventListener(type, ignore, true); }
		return node;
	}
	function openStep(id) {
		// Read Aloud is a card of Next Steps, not a step
		if (id === 'aloud') { window.dispatchEvent(new CustomEvent('pollis-open-page-step', { detail: 'aloudStep' })); return; }
		const pane = document.getElementById(STEPS[id] || id);
		if (pane) {
			pane.classList.remove('collapsed');
			// The first step stays below the title, Ask Pollis and the introduction; a later step is scrolled to
			if (id === 'open') { window.scrollTo({ top: 0, behavior: 'smooth' }); } else { pane.scrollIntoView({ block: 'start', behavior: 'smooth' }); }
		}
	}
	function showError(container) {
		if (errorText) { container.appendChild(element('div', 'error', errorText)); }
	}
	function progressText() {
		if (!progress) { return ''; }
		const p = progress;
		if (p.phase === 'text') { return format(TEXT.progressText, bytes(p.done) + (p.total ? ' / ' + bytes(p.total) : '')); }
		if (p.phase === 'words') { return format(TEXT.progressWords, p.done, p.total); }
		if (p.phase === 'images') { return format(TEXT.progressImages, p.done, p.total); }
		if (p.phase === 'dictionary') { return p.done < p.total ? TEXT.progressDictionary : ''; }
		if (p.phase === 'copy') { return p.done < p.total ? TEXT.progressCopy : ''; }
		return '';
	}

	// ---- 1. Open a Work
	function drawOpen() {
		const box = document.getElementById('open');
		// The source typed, and the cursor in its field, kept when the step is drawn again
		const previous = document.getElementById('sourceInput');
		const typed = previous ? previous.value : '';
		const focused = previous !== null && document.activeElement === previous;
		box.textContent = '';
		box.appendChild(element('div', 'label', TEXT.sourceLabel));
		const bar = element('div', 'bar');
		const input = element('input', 'wide');
		input.type = 'text';
		input.placeholder = TEXT.sourcePlaceholder;
		input.id = 'sourceInput';
		input.value = typed;
		const send = () => { if (input.value.trim()) { errorText = ''; vscode.postMessage({ command: 'openSource', source: input.value.trim() }); } };
		input.addEventListener('keydown', event => { if (event.key === 'Enter') { send(); } });
		bar.appendChild(input);
		bar.appendChild(button(TEXT.open, send));
		bar.appendChild(button(TEXT.openPdf, () => { errorText = ''; vscode.postMessage({ command: 'openScannedPdf' }); }));
		box.appendChild(bar);
		if (focused) { input.focus(); }
		if (busy) { box.appendChild(element('p', 'status', busy)); }
		const progressLine = progressText();
		if (progressLine && progress && progress.phase !== 'images') {
			box.appendChild(element('p', 'status', progressLine));
			if (progress.total) { const barNode = element('div', 'progressBar'); const fill = element('div'); fill.style.width = Math.min(100, 100 * progress.done / progress.total).toFixed(1) + '%'; barNode.appendChild(fill); box.appendChild(barNode); }
		}
		showError(box);

		box.appendChild(element('div', 'label', TEXT.works));
		if (!state.works.length) {
			box.appendChild(element('p', 'hint', TEXT.noWorks));
		} else {
			const table = element('table', 'list');
			const head = element('tr');
			for (const heading of [TEXT.titleColumn, TEXT.authorColumn, TEXT.yearColumn, TEXT.languagesColumn, TEXT.sourceColumn]) { head.appendChild(element('th', '', heading)); }
			table.appendChild(head);
			for (const work of state.works) {
				const row = element('tr', 'pick' + (state.current && state.current.id === work.id ? ' row-current' : ''));
				row.appendChild(element('td', '', work.title || work.id));
				row.appendChild(element('td', '', work.author || ''));
				row.appendChild(element('td', '', work.year ? String(work.year) : ''));
				row.appendChild(element('td', '', (work.languages || []).join(', ')));
				const source = work.scan.archive ? 'Internet Archive' : work.scan.gutenberg ? 'Project Gutenberg' : 'PDF';
				row.appendChild(element('td', '', source + (work.inWorkspace ? ' · ' + TEXT.inWorkspace : '')));
				row.addEventListener('click', () => { errorText = ''; vscode.postMessage({ command: 'selectWork', id: work.id }); });
				table.appendChild(row);
			}
			box.appendChild(table);
		}
		// The record of the work open, its fields shown empty before one is open, a click saying to open one first
		const work = state.current;
		const record = work || {};
		box.appendChild(element('div', 'label', TEXT.record));
		const fields = element('div', 'fields');
		const inputs = {};
		const add = (key, label, value, multiline, help) => {
			fields.appendChild(element('span', '', label));
			const field = element(multiline ? 'textarea' : 'input');
			if (!multiline) { field.type = 'text'; }
			field.value = value || '';
			if (help) { field.title = help; }
			inputs[key] = field;
			fields.appendChild(field);
		};
		add('title', TEXT.fieldTitle, record.title);
		add('author', TEXT.fieldAuthor, record.author);
		add('editor', TEXT.fieldEditor, record.editor);
		add('translator', TEXT.fieldTranslator, record.translator);
		add('year', TEXT.fieldYear, record.year ? String(record.year) : '');
		add('languages', TEXT.fieldLanguages, (record.languages || []).join(', '), false, TEXT.fieldLanguagesHelp);
		add('entryType', TEXT.fieldEntryType, record.entryType);
		add('referenceKey', TEXT.fieldReferenceKey, record.referenceKey);
		add('summary', TEXT.fieldSummary, record.summary, true);
		add('summarySource', TEXT.fieldSummarySource, record.summarySource);
		if (!work) { box.appendChild(element('p', 'hint', TEXT.noRecord)); }
		const recordBox = box.appendChild(element('div'));
		if (!work) { inactive(recordBox, TEXT.noRecord); }
		recordBox.appendChild(fields);
		recordBox.appendChild(element('p', 'hint', TEXT.fieldLanguagesHelp));
		const saveBar = element('div', 'bar');
		saveBar.appendChild(button(TEXT.saveRecord, () => {
			const record = {};
			for (const key of Object.keys(inputs)) { record[key] = inputs[key].value; }
			vscode.postMessage({ command: 'saveRecord', record });
		}));
		if (!work || work.scan.archive) {
			saveBar.appendChild(button(TEXT.openScan, () => vscode.postMessage({ command: 'openScan' })));
			saveBar.appendChild(button(TEXT.openArchive, () => vscode.postMessage({ command: 'openOnline' })));
		} else if (work.scan.gutenberg) {
			saveBar.appendChild(button(TEXT.openEbook, () => vscode.postMessage({ command: 'openScan' })));
			saveBar.appendChild(button(TEXT.openGutenberg, () => vscode.postMessage({ command: 'openOnline' })));
		} else if (work.scan.sha256) {
			saveBar.appendChild(button(TEXT.openPdfViewer, () => vscode.postMessage({ command: 'openScan' })));
		}
		if (!state.inWorkspace) { saveBar.appendChild(button(TEXT.addToWorkspace, () => vscode.postMessage({ command: 'addToWorkspace' }))); }
		recordBox.appendChild(saveBar);
		recordBox.appendChild(element('span', 'small', '')).id = 'recordStatus';
		if (!work) { return; }
		if (work.scan.archive && scanSize) {
			box.appendChild(element('div', 'label', TEXT.scan));
			box.appendChild(element('p', 'hint', format(TEXT.scanSize, scanSize.pages, bytes(scanSize.bytes), bytes(scanSize.free))));
			if (scanSize.fetched) { box.appendChild(element('p', 'hint', format(TEXT.scanFetched, scanSize.fetched, scanSize.pages))); }
			const scanBar = element('div', 'bar');
			if (progress && progress.phase === 'images' && progress.done < progress.total) {
				scanBar.appendChild(element('span', 'small', progressText()));
				scanBar.appendChild(button(TEXT.stopDownload, () => vscode.postMessage({ command: 'stopDownload' })));
			} else if (scanSize.fetched < scanSize.pages) {
				scanBar.appendChild(button(TEXT.downloadScan, () => vscode.postMessage({ command: 'downloadScan' })));
			}
			box.appendChild(scanBar);
		}
	}

	// ---- 2. Read
	function flagText(word) {
		if (word.flag === 'dictionary') { return TEXT.flagDictionary; }
		if (word.flag === 'confidence') { return format(TEXT.flagConfidence, word.confidence); }
		if (word.flag === 'secondScan') { return TEXT.flagSecondScan; }
		return TEXT.flagModel;
	}
	function drawRead() {
		const box = document.getElementById('read');
		const head = document.getElementById('head-read');
		box.textContent = '';
		head.textContent = '';
		// Before a work is open: the page's controls, the legend and the contents, shown as they are, a click saying why it does nothing
		const noWork = !state.current || !state.pages;
		if (noWork) { box.appendChild(element('p', 'hint', TEXT.noWork)); }
		const nav = element('div', 'bar');
		const number = element('input');
		number.type = 'number';
		number.min = '1';
		number.max = String(state.pages);
		number.style.width = '70px';
		number.value = page ? String(page.page) : '1';
		number.addEventListener('change', () => vscode.postMessage({ command: 'page', page: Number(number.value) }));
		nav.appendChild(button(TEXT.previous, () => page && vscode.postMessage({ command: 'page', page: page.page - 1 })));
		nav.appendChild(number);
		nav.appendChild(element('span', 'small', format(TEXT.pageOf, state.pages || '\\u2013')));
		nav.appendChild(button(TEXT.next, () => vscode.postMessage({ command: 'page', page: (page ? page.page : 0) + 1 })));
		if (page && !noWork) {
			nav.appendChild(element('span', 'small', page.printed ? format(TEXT.printedPage, page.printed) : TEXT.noPrinted));
			head.textContent = (state.current.title || state.current.id) + ' · ' + page.page + '/' + state.pages;
		}
		if (noWork) {
			const shown = inactive(box.appendChild(element('div')), TEXT.noWork);
			shown.appendChild(nav);
			const empty = element('div', 'reader noImage');
			const legend = element('div');
			legend.appendChild(element('p', 'hint', TEXT.legend));
			empty.appendChild(legend);
			empty.appendChild(contentsSide());
			shown.appendChild(empty);
			return;
		}
		box.appendChild(nav);
		if (!page) { box.appendChild(element('p', 'status', TEXT.loadingPage)); return; }
		const reader = element('div', 'reader' + (state.hasImages ? '' : ' noImage'));
		// The scan, the flagged words marked on it
		if (state.hasImages) {
			const scanBox = element('div', 'scanBox');
			if (page.image) {
				const image = element('img');
				image.src = page.image;
				scanBox.appendChild(image);
				if (page.width && page.height) {
					for (const word of page.words) {
						if (!word.flag) { continue; }
						const mark = element('div', 'mark ' + word.flag + (chosenWord === word ? ' chosen' : ''));
						mark.style.left = (100 * word.box[0] / page.width) + '%';
						mark.style.top = (100 * word.box[1] / page.height) + '%';
						mark.style.width = (100 * (word.box[2] - word.box[0]) / page.width) + '%';
						mark.style.height = (100 * (word.box[3] - word.box[1]) / page.height) + '%';
						scanBox.appendChild(mark);
					}
				}
			} else {
				scanBox.appendChild(element('p', 'hint', TEXT.noImage));
			}
			reader.appendChild(scanBox);
		}
		// The text, a paragraph at a time, the flagged words highlighted
		const textBox = element('div', 'pageText');
		if (!page.words.length) { textBox.appendChild(element('p', 'hint', TEXT.noText)); }
		let paragraph;
		let paragraphNumber = -1;
		let line = -1;
		for (const word of page.words) {
			if (word.paragraph !== paragraphNumber) { paragraph = element('p'); textBox.appendChild(paragraph); paragraphNumber = word.paragraph; line = word.line; }
			else if (word.line !== line) { paragraph.appendChild(document.createElement('br')); line = word.line; }
			const span = element('span', 'w' + (word.flag ? ' ' + word.flag : '') + (chosenWord === word ? ' chosen' : ''), word.text);
			if (word.flag) { span.addEventListener('click', () => { chosenWord = word; drawRead(); }); }
			paragraph.appendChild(span);
			paragraph.appendChild(document.createTextNode(' '));
		}
		const textColumn = element('div');
		textColumn.appendChild(textBox);
		if (chosenWord && page.words.includes(chosenWord)) {
			const why = element('div', 'why');
			why.appendChild(element('div', '', chosenWord.text + ' · ' + flagText(chosenWord)));
			if (chosenWord.suggestions && chosenWord.suggestions.length) { why.appendChild(element('div', 'small', format(TEXT.suggestions, chosenWord.suggestions.join(', ')))); }
			why.appendChild(buttonRow(button(TEXT.acceptWord, () => vscode.postMessage({ command: 'acceptWord', word: chosenWord.text }))));
			textColumn.appendChild(why);
		}
		textColumn.appendChild(element('p', 'hint', TEXT.legend));
		reader.appendChild(textColumn);
		reader.appendChild(contentsSide());
		box.appendChild(reader);
		showError(box);
	}
	// The contents at the side: each entry opens its first page; an entry starts at the page shown
	function contentsSide() {
		const side = element('div', 'side');
		side.appendChild(element('div', 'label', TEXT.contents));
		const contents = (state.current && state.current.contents) || [];
		if (!contents.length) { side.appendChild(element('p', 'hint', TEXT.noContents)); }
		contents.forEach((entry, index) => {
			const row = element('div', 'entry');
			const label = element('div', 'entryLabel', entry.label);
			label.addEventListener('click', () => {
				const start = firstScanPage(entry.pages);
				if (start) { vscode.postMessage({ command: 'page', page: start }); }
			});
			row.appendChild(label);
			row.appendChild(element('div', 'pages', entry.pages || TEXT.noPagesYet));
			row.appendChild(buttonRow(
				button(TEXT.entryHere, () => vscode.postMessage({ command: 'entryHere', index, page: page.page })),
				button(TEXT.removeEntry, () => vscode.postMessage({ command: 'removeEntry', index }))));
			side.appendChild(row);
		});
		const input = element('input', 'wide');
		input.type = 'text';
		input.placeholder = TEXT.entryLabel;
		input.style.width = '100%';
		input.style.marginTop = '8px';
		side.appendChild(input);
		side.appendChild(buttonRow(button(TEXT.addEntry, () => { if (page && input.value.trim()) { vscode.postMessage({ command: 'addEntry', label: input.value.trim(), page: page.page }); } })));
		// A scan without printed numbers: the number printed on this page sets the difference for the whole work
		if (page && state.current && !(state.printed || []).some(label => label)) {
			side.appendChild(element('div', 'label', TEXT.setPrinted));
			const bar = element('div', 'bar');
			const printedInput = element('input');
			printedInput.type = 'number';
			printedInput.style.width = '70px';
			printedInput.value = String(page.page - (state.current.scan.offset || 0));
			bar.appendChild(printedInput);
			bar.appendChild(button(TEXT.setOffset, () => vscode.postMessage({ command: 'setOffset', page: page.page, printed: Number(printedInput.value) })));
			side.appendChild(bar);
		}
		return side;
	}
	function firstScanPage(pages) {
		const start = (pages || '').split('-')[0].trim();
		if (!start) { return undefined; }
		const index = (state.printed || []).indexOf(start);
		if (index >= 0) { return index + 1; }
		const number = Number(start);
		return Number.isInteger(number) ? number + (state.current.scan.offset || 0) : undefined;
	}

	// ---- 3. Choose Parts
	function drawParts() {
		const step = document.getElementById('parts');
		step.textContent = '';
		// Before a work is open, the step shown as it is, doing nothing
		if (!state.current) { step.appendChild(element('p', 'hint', TEXT.noWork)); }
		const box = step.appendChild(element('div'));
		if (!state.current) { inactive(box, TEXT.noWork); }
		box.appendChild(element('p', 'hint', TEXT.partsHelp));
		const contents = (state.current && state.current.contents) || [];
		if (contents.length) {
			box.appendChild(element('div', 'label', TEXT.contents));
			contents.forEach((entry, index) => {
				const choice = element('label', 'choice');
				const tick = element('input');
				tick.type = 'checkbox';
				tick.checked = chosenEntries.has(index);
				tick.disabled = !entry.pages;
				tick.addEventListener('change', () => { if (tick.checked) { chosenEntries.add(index); } else { chosenEntries.delete(index); } });
				choice.appendChild(tick);
				choice.appendChild(document.createTextNode(entry.label + ' · ' + (entry.pages || TEXT.noPagesYet)));
				box.appendChild(choice);
			});
		}
		box.appendChild(element('div', 'label', TEXT.pagesLabel));
		const bar = element('div', 'bar');
		const input = element('input');
		input.type = 'text';
		input.placeholder = TEXT.pagesPlaceholder;
		input.value = range;
		input.addEventListener('input', () => { range = input.value; });
		bar.appendChild(input);
		bar.appendChild(button(TEXT.extract, () => { errorText = ''; vscode.postMessage({ command: 'extract', entries: [...chosenEntries], range: input.value }); }));
		box.appendChild(bar);
		if (busy && busy.startsWith(TEXT.extracting.split('{0}')[0])) { box.appendChild(element('p', 'status', busy)); }
	}

	// ---- 4. Extract and Correct
	let textArea;
	function contextOf(text, start, end) {
		const before = text.slice(Math.max(0, start - 40), start);
		const after = text.slice(end, end + 40);
		const node = element('span', 'context');
		node.appendChild(document.createTextNode((start > 40 ? '…' : '') + before));
		node.appendChild(element('b', '', text.slice(start, end)));
		node.appendChild(document.createTextNode(after + (end + 40 < text.length ? '…' : '')));
		return node;
	}
	// A flagged word's place, found again near where it was when the text was changed by hand
	function locate(flag, text) {
		if (text.slice(flag.start, flag.end) === flag.word) { return flag; }
		let best = -1;
		for (let at = text.indexOf(flag.word); at >= 0; at = text.indexOf(flag.word, at + 1)) {
			if (best < 0 || Math.abs(at - flag.start) < Math.abs(best - flag.start)) { best = at; }
		}
		return best < 0 ? undefined : Object.assign({}, flag, { start: best, end: best + flag.word.length });
	}
	function crop(flag) {
		const image = extractState && extractState.images.find(item => item.page === flag.page);
		const node = element('div', 'crop');
		if (!image || !image.image || !flag.box || !image.width) { return node; }
		// The word with a margin around it, scaled to the crop's height
		const margin = Math.max(20, (flag.box[3] - flag.box[1]) * 0.6);
		const x0 = Math.max(0, flag.box[0] - margin * 3);
		const y0 = Math.max(0, flag.box[1] - margin);
		const x1 = Math.min(image.width, flag.box[2] + margin * 3);
		const y1 = Math.min(image.height, flag.box[3] + margin);
		const scale = 48 / (y1 - y0);
		node.style.width = Math.min(220, (x1 - x0) * scale) + 'px';
		node.style.backgroundImage = 'url("' + image.image + '")';
		node.style.backgroundSize = (image.width * scale) + 'px ' + (image.height * scale) + 'px';
		node.style.backgroundPosition = (-x0 * scale) + 'px ' + (-y0 * scale) + 'px';
		return node;
	}
	function drawExtract() {
		const step = document.getElementById('extract');
		const head = document.getElementById('head-extract');
		step.textContent = '';
		head.textContent = '';
		// Before parts are extracted, the step shown as it is, empty and doing nothing
		if (!extractState) { step.appendChild(element('p', 'hint', TEXT.noExtract)); }
		const box = step.appendChild(element('div'));
		if (!extractState) { inactive(box, TEXT.noExtract); }
		const shown = extractState || { label: '', text: '', saved: '' };
		if (extractState) { head.textContent = format(TEXT.pagesOfExtract, extractState.pagesLabel); }
		const labelBar = element('div', 'bar');
		labelBar.appendChild(element('span', 'small', TEXT.snippetLabel));
		const labelInput = element('input', 'wide');
		labelInput.type = 'text';
		labelInput.value = shown.label;
		labelInput.addEventListener('input', () => { extractState.label = labelInput.value; });
		labelBar.appendChild(labelInput);
		box.appendChild(labelBar);
		box.appendChild(element('div', 'label', TEXT.snippetText));
		textArea = element('textarea', 'snippetText');
		textArea.value = shown.text;
		textArea.addEventListener('input', () => { extractState.text = textArea.value; });
		textArea.addEventListener('change', () => drawChecks());
		box.appendChild(textArea);
		box.appendChild(element('div', 'label', TEXT.flagged));
		const checks = element('div', 'checks');
		checks.id = 'checks';
		box.appendChild(checks);
		if (extractState) { drawChecks(); } else { checks.appendChild(element('p', 'hint', TEXT.noFlagged)); }
		// The other checks: another copy of the same edition, and the language model
		const tools = element('div', 'bar');
		tools.appendChild(button(TEXT.recheck, () => vscode.postMessage({ command: 'recheck', text: extractState.text })));
		if (state.current && state.current.scan.archive) {
			if (!copies) {
				tools.appendChild(button(TEXT.findCopies, () => vscode.postMessage({ command: 'copies' })));
			} else if (copies.length) {
				const select = element('select');
				for (const copy of copies) { const option = element('option', '', copy.identifier + (copy.contributor ? ' · ' + copy.contributor : '')); option.value = copy.identifier; select.appendChild(option); }
				tools.appendChild(element('span', 'small', TEXT.copiesLabel));
				tools.appendChild(select);
				tools.appendChild(button(TEXT.compare, () => vscode.postMessage({ command: 'compare', identifier: select.value, text: extractState.text })));
			} else {
				tools.appendChild(element('span', 'small', TEXT.noCopies));
			}
		}
		if (state.models.length) {
			const select = modelSelect();
			tools.appendChild(element('span', 'small', TEXT.modelLabel));
			tools.appendChild(select);
			tools.appendChild(button(TEXT.checkWithModel, () => vscode.postMessage({ command: 'checkWithModel', text: extractState.text, model: select.value })));
		}
		box.appendChild(tools);
		if (busy && shown.busy) { box.appendChild(element('p', 'status', busy)); }
		const saveBar = element('div', 'bar');
		saveBar.appendChild(button(TEXT.saveSnippet, () => vscode.postMessage({ command: 'saveSnippet', label: extractState.label, text: extractState.text })));
		const status = element('span', 'small', shown.saved ? format(TEXT.saved, shown.saved) : '');
		saveBar.appendChild(status);
		box.appendChild(saveBar);
		box.appendChild(element('p', 'hint', TEXT.correctionsKept));
		showError(box);
	}
	function drawChecks() {
		const checks = document.getElementById('checks');
		if (!checks || !extractState) { return; }
		checks.textContent = '';
		const text = extractState.text;
		const shown = flags.map(flag => locate(flag, text)).filter(Boolean);
		if (!shown.length) { checks.appendChild(element('p', 'hint', TEXT.noFlagged)); return; }
		for (const flag of shown) {
			const row = element('div', 'check');
			row.appendChild(crop(flag));
			const body = element('div', 'checkBody');
			const why = element('div');
			why.appendChild(element('span', 'flagWord ' + (flag.flag === 'confidence' ? 'confidence' : 'dictionary'), flag.word));
			why.appendChild(document.createTextNode(' · ' + flagText(flag)));
			body.appendChild(why);
			body.appendChild(contextOf(text, flag.start, flag.end));
			const bar = element('div', 'bar');
			const input = element('input');
			input.type = 'text';
			input.value = (flag.suggestions && flag.suggestions[0]) || flag.word;
			bar.appendChild(input);
			if (flag.suggestions && flag.suggestions.length > 1) {
				for (const suggestion of flag.suggestions.slice(1)) { bar.appendChild(button(suggestion, () => { input.value = suggestion; })); }
			}
			bar.appendChild(button(TEXT.correct, () => correct(flag, input.value)));
			bar.appendChild(button(TEXT.keep, () => dismiss(flag)));
			bar.appendChild(button(TEXT.acceptWord, () => { vscode.postMessage({ command: 'acceptWord', word: flag.word }); flags = flags.filter(other => other.word !== flag.word); drawChecks(); }));
			body.appendChild(bar);
			row.appendChild(body);
			checks.appendChild(row);
		}
	}
	function dismiss(flag) {
		flags = flags.filter(other => !(other.start === flag.start && other.word === flag.word));
		drawChecks();
	}
	function correct(flag, value) {
		const at = locate(flag, extractState.text);
		if (!at) { return; }
		const delta = value.length - (at.end - at.start);
		extractState.text = extractState.text.slice(0, at.start) + value + extractState.text.slice(at.end);
		flags = flags.filter(other => other !== flag).map(other => other.start > at.start ? Object.assign({}, other, { start: other.start + delta, end: other.end + delta }) : other);
		if (textArea) { textArea.value = extractState.text; }
		drawChecks();
	}
	function addFlags(found, kind) {
		// The checks of one kind replace those of the same kind; the others stay
		flags = flags.filter(flag => flag.flag !== kind);
		for (const flag of found) {
			if (!flags.some(other => other.start === flag.start && other.end === flag.end)) { flags.push(flag); }
		}
		flags.sort((a, b) => a.start - b.start);
		drawChecks();
	}
	function modelSelect() {
		const select = element('select');
		for (const model of state.models) {
			const option = element('option', '', model.name);
			option.value = model.value;
			option.selected = model.value === state.model;
			select.appendChild(option);
		}
		return select;
	}

	// ---- 5. Translate
	let translateLanguage;
	function drawTranslate() {
		const step = document.getElementById('translate');
		step.textContent = '';
		const snippet = state.snippet;
		// Before there is a snippet, its controls shown as they are, doing nothing; the glossary of a work open works
		step.appendChild(element(snippet ? 'div' : 'p', snippet ? 'label' : 'hint', snippet ? snippet.label : TEXT.noSnippet));
		const box = step.appendChild(element('div'));
		if (!snippet) { inactive(box, TEXT.noSnippet); }
		const bar = element('div', 'bar');
		bar.appendChild(element('span', 'small', TEXT.into));
		const language = element('input');
		language.type = 'text';
		language.style.width = '60px';
		language.value = translateLanguage || state.language || 'en';
		language.title = languageName(language.value);
		language.addEventListener('change', () => { translateLanguage = language.value.trim(); glossaryRows = undefined; drawTranslate(); });
		bar.appendChild(language);
		bar.appendChild(element('span', 'small', languageName(language.value)));
		if (!state.models.length) {
			box.appendChild(bar);
			box.appendChild(element('p', 'hint', TEXT.noModels));
		} else {
			bar.appendChild(element('span', 'small', TEXT.modelLabel));
			const select = modelSelect();
			bar.appendChild(select);
			if (state.translating) {
				bar.appendChild(button(TEXT.stop, () => vscode.postMessage({ command: 'stopTranslation' })));
			} else {
				bar.appendChild(button(TEXT.translate, () => { state.translating = true; errorText = ''; vscode.postMessage({ command: 'translate', language: language.value.trim(), model: select.value }); drawTranslate(); }));
			}
			box.appendChild(bar);
			box.appendChild(element('p', 'hint', TEXT.translationNote));
			(state.units || []).forEach((unit, index) => {
				const row = element('div', 'unit');
				row.appendChild(element('div', 'source', unit.source));
				const target = element('div', 'target' + (unit.writing ? ' writing' : ''), unit.text || (unit.writing ? TEXT.writing : ''));
				row.appendChild(target);
				if (unit.text && !state.translating) {
					const again = button(TEXT.translateAgain, () => { state.translating = true; vscode.postMessage({ command: 'translate', language: language.value.trim(), model: select.value, unit: index }); drawTranslate(); });
					again.title = TEXT.translateAgainHelp;
					row.appendChild(element('div'));
					row.appendChild(buttonRow(again));
				}
				box.appendChild(row);
			});
		}
		showError(box);
		drawGlossary(step);
	}
	function drawGlossary(box) {
		const language = translateLanguage || state.language || 'en';
		const section = element('div', 'glossary');
		section.id = 'glossary';
		// Before a work is open, the glossary shown empty, doing nothing
		if (!state.current) { inactive(section, TEXT.noWork); }
		section.appendChild(element('div', 'label', TEXT.glossary + ' · ' + languageName(language)));
		section.appendChild(element('p', 'hint', TEXT.glossaryHelp));
		glossaryRows = glossaryRows || ((state.current && state.current.glossary) || []).map(term => ({ term: term.term, translation: term.translations[language] || '' }));
		const table = element('table', 'list');
		const head = element('tr');
		head.appendChild(element('th', '', TEXT.term));
		head.appendChild(element('th', '', TEXT.translation));
		head.appendChild(element('th', '', ''));
		table.appendChild(head);
		glossaryRows.forEach((row, index) => {
			const line = element('tr');
			for (const key of ['term', 'translation']) {
				const cell = element('td');
				const input = element('input');
				input.type = 'text';
				input.value = row[key];
				input.addEventListener('input', () => { row[key] = input.value; });
				cell.appendChild(input);
				line.appendChild(cell);
			}
			const remove = element('td');
			remove.appendChild(buttonRow(button(TEXT.removeEntry, () => { glossaryRows.splice(index, 1); drawTranslate(); })));
			line.appendChild(remove);
			table.appendChild(line);
		});
		section.appendChild(table);
		const bar = element('div', 'bar');
		bar.appendChild(button(TEXT.addTerm, () => { glossaryRows.push({ term: '', translation: '' }); drawTranslate(); }));
		bar.appendChild(button(TEXT.saveGlossary, () => vscode.postMessage({ command: 'saveGlossary', language, terms: glossaryRows })));
		section.appendChild(bar);
		box.appendChild(section);
	}

	// ---- Read Aloud, a card of Interpret in Next Steps: drawn in its panel while the panel is open
	let aloudChoice = 0;
	function drawAloud() {
		const panel = document.getElementById('aloudStep');
		if (!panel) { return; }
		panel.className = 'ocr';
		panel.textContent = '';
		const snippet = state.snippet;
		// Before there is a snippet, its controls shown as they are, doing nothing
		panel.appendChild(element(snippet ? 'div' : 'p', snippet ? 'label' : 'hint', snippet ? snippet.label : TEXT.noSnippet));
		const box = panel.appendChild(element('div'));
		if (!snippet) { inactive(box, TEXT.noSnippet); }
		const shown = snippet || { text: '', language: 'en' };
		const options = [{ text: shown.text, language: shown.language, label: format(TEXT.theSnippet, languageName(shown.language || 'en')) }];
		for (const translation of shown.translations || []) {
			options.push({ text: translation.text, language: translation.language, label: format(TEXT.itsTranslation, languageName(translation.language), translation.model) });
		}
		aloudChoice = Math.min(aloudChoice, options.length - 1);
		options.forEach((option, index) => {
			const choice = element('label', 'choice');
			const radio = element('input');
			radio.type = 'radio';
			radio.name = 'aloud';
			radio.checked = index === aloudChoice;
			radio.addEventListener('change', () => { aloudChoice = index; drawAloud(); });
			choice.appendChild(radio);
			choice.appendChild(document.createTextNode(option.label));
			box.appendChild(choice);
		});
		const chosen = options[aloudChoice];
		const voices = (window.speechSynthesis ? speechSynthesis.getVoices() : []).filter(voice => voice.lang && voice.lang.toLowerCase().startsWith((chosen.language || 'en').toLowerCase().split('-')[0]));
		const bar = element('div', 'bar');
		bar.appendChild(element('span', 'small', TEXT.voice));
		const select = element('select');
		const any = element('option', '', TEXT.anyVoice);
		any.value = '';
		select.appendChild(any);
		for (const voice of voices) { const option = element('option', '', voice.name + ' (' + voice.lang + ')'); option.value = voice.name; select.appendChild(option); }
		bar.appendChild(select);
		const speak = button('', () => {
			if (!window.speechSynthesis) { return; }
			speechSynthesis.cancel();
			const utterance = new SpeechSynthesisUtterance(chosen.text);
			utterance.lang = chosen.language || 'en';
			const voice = voices.find(item => item.name === select.value) || voices[0];
			if (voice) { utterance.voice = voice; }
			utterance.onend = () => { speaking = false; drawAloud(); };
			speaking = true;
			speechSynthesis.speak(utterance);
			drawAloud();
		});
		const icon = element('span', 'speaker');
		icon.innerHTML = SPEAKER;
		speak.appendChild(icon);
		speak.appendChild(document.createTextNode(TEXT.readAloud));
		bar.appendChild(speak);
		if (speaking) {
			bar.appendChild(button(speechSynthesis.paused ? TEXT.resume : TEXT.pause, () => { if (speechSynthesis.paused) { speechSynthesis.resume(); } else { speechSynthesis.pause(); } drawAloud(); }));
			bar.appendChild(button(TEXT.stop, () => { speechSynthesis.cancel(); speaking = false; drawAloud(); }));
		}
		box.appendChild(bar);
		if (!voices.length) { box.appendChild(element('p', 'hint', format(TEXT.noVoice, languageName(chosen.language || 'en')))); }
	}
	if (window.speechSynthesis) { speechSynthesis.addEventListener('voiceschanged', () => drawAloud()); }
	window.addEventListener('pollis-aloud-step', () => drawAloud());

	// ---- 6. Use It
	function drawUse() {
		const box = document.getElementById('use');
		document.getElementById('head-use').textContent = state.snippets.length ? String(state.snippets.length) : '';
		box.textContent = '';
		box.appendChild(element('div', 'label', TEXT.snippets));
		if (!state.snippets.length) { box.appendChild(element('p', 'hint', TEXT.noSnippets)); }
		else {
			const table = element('table', 'list');
			const head = element('tr');
			for (const heading of [TEXT.labelColumn, TEXT.workColumn, TEXT.languagesColumn, TEXT.translationsColumn, '']) { head.appendChild(element('th', '', heading)); }
			table.appendChild(head);
			for (const snippet of state.snippets) {
				const row = element('tr', state.snippet && state.snippet.name === snippet.name && state.snippet.work === snippet.work ? 'row-current' : '');
				row.appendChild(element('td', '', snippet.label));
				row.appendChild(element('td', '', snippet.workTitle));
				row.appendChild(element('td', '', snippet.language));
				row.appendChild(element('td', '', (snippet.translations || []).map(item => item.language + ' (' + item.model + ', ' + item.made + ')').join('; ')));
				const actions = element('td');
				const links = element('div', 'bar');
				const act = action => () => vscode.postMessage({ command: 'snippet', work: snippet.work, name: snippet.name, action });
				links.appendChild(button(TEXT.copy, act('copy')));
				links.appendChild(button(TEXT.copyCitation, act('citation')));
				links.appendChild(button(TEXT.sendToNotebook, act('notebook')));
				links.appendChild(button(TEXT.openFile, act('open')));
				links.appendChild(button(TEXT.translate, act('translate')));
				links.appendChild(button(TEXT.readAloud, act('aloud')));
				actions.appendChild(links);
				row.appendChild(actions);
				table.appendChild(row);
			}
			box.appendChild(table);
		}
		if (state.current && !state.inWorkspace) {
			const bar = element('div', 'bar');
			bar.appendChild(button(TEXT.addToWorkspace, () => vscode.postMessage({ command: 'addToWorkspace' })));
			box.appendChild(bar);
		}
		if (box.dataset.note) { box.appendChild(element('p', 'status', box.dataset.note)); }
	}

	function drawAll() {
		drawOpen();
		drawRead();
		drawParts();
		drawExtract();
		drawTranslate();
		drawAloud();
		drawUse();
	}

	window.addEventListener('message', event => {
		const message = event.data;
		switch (message.command) {
			case 'state':
				state = Object.assign(state, message, { translating: state.translating });
				if (extractState && (!state.current || extractState.work !== state.current.id)) { extractState = undefined; flags = []; }
				if (!message.current) { page = undefined; }
				else if (page && state.current && page.work !== state.current.id) { page = undefined; }
				glossaryRows = undefined;
				drawAll();
				break;
			case 'step':
				openStep(message.step);
				if (message.place === 'glossary') { const glossary = document.getElementById('glossary'); if (glossary) { glossary.scrollIntoView({ block: 'start' }); } }
				if (message.place === 'source') { const source = document.getElementById('sourceInput'); if (source) { source.focus(); } }
				break;
			case 'opening':
				busy = format(TEXT.opening, message.source);
				errorText = '';
				drawOpen();
				break;
			case 'opened':
				busy = '';
				progress = undefined;
				drawOpen();
				break;
			case 'progress':
				progress = message.progress;
				if (progress.phase === 'images') { drawOpen(); } else { drawOpen(); }
				break;
			case 'scanSize':
				scanSize = message.size;
				drawOpen();
				break;
			case 'page':
				busy = '';
				progress = undefined;
				page = Object.assign(message.page, { work: state.current && state.current.id });
				chosenWord = undefined;
				drawRead();
				drawOpen();
				break;
			case 'accepted':
				chosenWord = undefined;
				if (page) { for (const word of page.words) { if (word.text.replace(/[^\\p{L}\\p{N}]/gu, '') === message.word) { word.flag = undefined; } } }
				drawRead();
				break;
			case 'extracting':
				busy = format(TEXT.extracting, message.pages);
				drawParts();
				break;
			case 'extract':
				busy = '';
				extractState = { work: state.current && state.current.id, text: message.extract.text, label: message.label, images: message.extract.images, pagesLabel: message.pagesLabel, saved: '' };
				flags = message.extract.flagged.slice();
				drawParts();
				drawExtract();
				openStep('extract');
				break;
			case 'flags':
				busy = '';
				if (extractState) { extractState.busy = false; addFlags(message.flagged, message.kind); drawExtract(); }
				break;
			case 'copies':
				copies = message.copies;
				drawExtract();
				break;
			case 'comparing':
				busy = TEXT.comparing;
				if (extractState) { extractState.busy = true; }
				drawExtract();
				break;
			case 'modelChecking':
				busy = TEXT.modelChecking;
				if (extractState) { extractState.busy = true; }
				drawExtract();
				break;
			case 'saved':
				if (extractState) { extractState.saved = message.name; }
				drawExtract();
				break;
			case 'translation': {
				const unit = state.units[message.index];
				if (unit) { unit.text = message.text; unit.writing = message.writing; }
				drawTranslate();
				break;
			}
			case 'translationDone':
				state.translating = false;
				for (const unit of state.units || []) { unit.writing = false; }
				drawTranslate();
				break;
			case 'recordSaved': {
				const status = document.getElementById('recordStatus');
				if (status) { status.textContent = TEXT.recordSaved; }
				break;
			}
			case 'glossarySaved':
				glossaryRows = undefined;
				drawTranslate();
				break;
			case 'copied': {
				const box = document.getElementById('use');
				box.dataset.note = TEXT.copied;
				drawUse();
				setTimeout(() => { box.dataset.note = ''; drawUse(); }, 1500);
				break;
			}
			case 'info': {
				const box = document.getElementById('use');
				box.dataset.note = message.message;
				drawUse();
				break;
			}
			case 'error':
				busy = '';
				state.translating = false;
				if (extractState) { extractState.busy = false; }
				errorText = message.message;
				drawAll();
				break;
		}
	});
	drawAll();
	vscode.postMessage({ command: 'ready' });
	})();
`,
	});
}

// ---- Commands and the menu items' actions

const CATEGORY = localize2('ocrFiles.category', "OCR Files and Snippets");

registerAction2(class extends Action2 {
	constructor() {
		super({ id: OCR_FILES_COMMANDS.openWork, title: localize2('ocrFiles.openWorkAction', "Open Work..."), category: CATEGORY, f1: true });
	}
	run(accessor: ServicesAccessor): Promise<void> {
		// The page at Open a Work, the cursor in the field of its source
		return ocrFilesPageOpener(accessor)('open', page => page.show('open', 'source'));
	}
});

for (const [id, step, title] of [
	[OCR_FILES_COMMANDS.works, 'open', localize2('ocrFiles.worksAction', "Works")],
	[OCR_FILES_COMMANDS.read, 'read', localize2('ocrFiles.readAction', "Read")],
	[OCR_FILES_COMMANDS.extract, 'extract', localize2('ocrFiles.extractAction', "Extract Snippet")],
	[OCR_FILES_COMMANDS.translate, 'translate', localize2('ocrFiles.translateAction', "Translate Snippet")],
	[OCR_FILES_COMMANDS.readAloud, 'aloud', localize2('ocrFiles.readAloudAction', "Read Aloud")],
	[OCR_FILES_COMMANDS.snippets, 'use', localize2('ocrFiles.snippetsAction', "Snippets")],
] as const) {
	registerAction2(class extends Action2 {
		constructor() {
			super({ id, title, category: CATEGORY, f1: true });
		}
		run(accessor: ServicesAccessor): Promise<void> {
			return ocrFilesPageOpener(accessor)(step);
		}
	});
}

registerAction2(class extends Action2 {
	constructor() {
		super({ id: OCR_FILES_COMMANDS.glossary, title: localize2('ocrFiles.glossaryAction', "Glossary"), category: CATEGORY, f1: true });
	}
	run(accessor: ServicesAccessor): Promise<void> {
		return ocrFilesPageOpener(accessor)('translate', page => page.show('translate', 'glossary'));
	}
});

registerAction2(class extends Action2 {
	constructor() {
		super({ id: OCR_FILES_COMMANDS.addToWorkspace, title: localize2('ocrFiles.addToWorkspaceAction', "Add to Workspace"), category: CATEGORY, f1: true });
	}
	run(accessor: ServicesAccessor): Promise<void> {
		return ocrFilesPageOpener(accessor)('use', async page => {
			await page.show('use');
			await page.addToWorkspace();
		});
	}
});
