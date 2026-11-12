/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IntervalTimer, RunOnceScheduler } from '../../../../base/common/async.js';
import { encodeBase64, streamToBuffer, VSBuffer } from '../../../../base/common/buffer.js';
import { CancellationToken } from '../../../../base/common/cancellation.js';
import { DisposableStore, MutableDisposable } from '../../../../base/common/lifecycle.js';
import { isLinux } from '../../../../base/common/platform.js';
import { basename, dirname, extname, isEqual, joinPath, relativePath } from '../../../../base/common/resources.js';
import Severity from '../../../../base/common/severity.js';
import { hasKey } from '../../../../base/common/types.js';
import { URI } from '../../../../base/common/uri.js';
import { localize, localize2 } from '../../../../nls.js';
import { Categories } from '../../../../platform/action/common/actionCommonCategories.js';
import { Action2, registerAction2 } from '../../../../platform/actions/common/actions.js';
import { ICommandService } from '../../../../platform/commands/common/commands.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { IDialogService, IFileDialogService } from '../../../../platform/dialogs/common/dialogs.js';
import { IFileService } from '../../../../platform/files/common/files.js';
import { ServicesAccessor } from '../../../../platform/instantiation/common/instantiation.js';
import { INotificationService } from '../../../../platform/notification/common/notification.js';
import { IOpenerService } from '../../../../platform/opener/common/opener.js';
import { IProgressService, ProgressLocation } from '../../../../platform/progress/common/progress.js';
import { IQuickInputService } from '../../../../platform/quickinput/common/quickInput.js';
import { asJson, asText, IRequestService, isSuccess } from '../../../../platform/request/common/request.js';
import { IStorageService, StorageScope, StorageTarget } from '../../../../platform/storage/common/storage.js';
import { IWorkspaceContextService } from '../../../../platform/workspace/common/workspace.js';
import { IEditorService } from '../../../services/editor/common/editorService.js';
import { IHostService } from '../../../services/host/browser/host.js';
import { IPathService } from '../../../services/path/common/pathService.js';
import { WebviewInput } from '../../webviewPanel/browser/webviewEditorInput.js';
import { IWebviewWorkbenchService } from '../../webviewPanel/browser/webviewWorkbenchService.js';
import { registerScaffoldPageHandlers } from '../../model/browser/handlers/scaffoldPage.handler.js';
import { KNOWLEDGEBASE_METADATA } from '../../model/browser/webviews/knowledgeBase.data.js';
import { choiceSwitchCss, choiceSwitchHtml, choiceSwitchJs } from '../../model/browser/webviews/scaffoldShared.js';
import { FEWEST_ROWS, isRowsChoice, rowsChoiceCss, rowsChoiceScript, sortHeadingsCss, sortHeadingsScript, sortHint, stickyHeadCss, stickyHeadScript, storedRows, storeRows } from '../../model/browser/webviews/webviewPager.js';
import { buildWebviewHtml, spinnerCss, spinnerSvg } from '../../model/browser/webviews/webviewScaffold.js';
import { INotebookEditorModelResolverService } from '../../notebook/common/notebookEditorModelResolverService.js';
import { INotebookKernelService } from '../../notebook/common/notebookKernelService.js';
import { OPEN_LINK_COMMAND_ID } from '../../monitor/browser/openLink.js';
import { openPdfInViewer } from '../../../common/pdfViewer.js';
import { ASK_EMBEDDING_MODEL, embeddingPrefixes, IAskPollisService } from '../common/askPollis.js';
import { compareCss, pageHelpersScript } from './compareShared.js';
import { LIBRARY_PAGE_HELPERS, LIBRARY_PAGE_MINIMAL_STYLE } from './libraryPage.js';
import { IInstalledModel } from './modelsInstalledPage.js';
import { findPollisWorkspace, OPEN_POLLIS_WORKSPACE_COMMAND_ID, pollisWorkspaceFolder } from '../../pollisWorkspace/browser/pollisWorkspace.contribution.js';

// The Knowledge Base, from Compose > Knowledge for AI Models > Knowledge Base, in the Minimal style of the scaffold: the
// openly licensed texts of PollisKnowledge.jl, books and other written works, in a table with each text's type,
// licence, source, size, what is kept of it and how it is cut into passages. A text switched on is downloaded once, by
// the Julia extension (language-julia.pollisKnowledgeBase, scripts/terminalserver/knowledge_base.jl), from the release
// of PollisKnowledge.jl that holds it; Build the Index cuts the texts switched on into passages and embeds them, as
// Retrieval-Augmented Generation does a collection of the user's (language-julia.pollisIndexCollection), into
// ~/.pollis/rag/knowledge-base.duckdb. Above the table, each published book has a card, in thanks to its authors: its
// cover, as they show it, which comes with PollisKnowledge.jl, its title, edition, authors, publisher and year, their
// page and the publisher's, where the printed book is sold. The user's own texts, the PDF, Markdown and text files in
// the knowledge folder of the Pollis Workspace open, are in the same table, with Yours as their source, the type of
// their folder (books/, articles/ or reports/) and switched on until the user switches them off; the table reads the
// folder again each time the page or the window gets the focus.

export const KNOWLEDGE_BASE_COMMAND_ID = 'pollis.knowledgeBase';

/** The texts switched on, the words of a passage and the embedding model, as IKnowledgeSettings. */
const SETTINGS_KEY = 'pollis.knowledgeBase.collection';
/** The name of the collection, as Ask Pollis shows it. */
const COLLECTION_NAME = 'Knowledge Base';
/** The file of the index, in ~/.pollis/rag. */
const INDEX_FILE = 'knowledge-base.duckdb';
/** The lengths a passage can have, in words, as Retrieval-Augmented Generation offers them. */
const PASSAGE_WORDS = [100, 150, 200, 250, 300, 400, 500];
const DEFAULT_WORDS = 250;
/** The page's name for the rows it shows at a time, and how many it shows until the user chooses. */
const ROWS_PAGE = 'knowledgeBase';
const DEFAULT_ROWS = 40;

interface IKnowledgeSettings {
	on: string[];
	/** The user's own texts switched off, by their paths. */
	off: string[];
	words: number;
	embeddingModel: string;
}

/** The kinds of document a text can be. */
type TextFormat = 'pdf' | 'markdown' | 'text';

/** A document of a text on this computer. */
interface ITextDocument {
	readonly file: string;
	readonly title: string;
	readonly kind: TextFormat;
}

/** A text of the user's own, a file in the knowledge folder of the Pollis Workspace open. */
interface IYourText {
	/** Its path, which names it. */
	readonly id: string;
	readonly type: string;
	/** Its path in the Pollis Workspace. */
	readonly path: string;
	readonly size: number;
	readonly document: ITextDocument;
}

/** The files the Knowledge Base reads as the user's texts, by their extensions. */
const YOUR_EXTENSIONS: Record<string, TextFormat> = { '.pdf': 'pdf', '.md': 'markdown', '.markdown': 'markdown', '.txt': 'text' };
/** How deep in the knowledge folder the user's texts are looked for. */
const YOUR_DEPTH = 4;
/** The subfolders of the knowledge folder a text of the user's is added to, one a type. */
const YOUR_FOLDERS = ['books', 'articles', 'reports'] as const;

/** A DOI, alone, after doi:, or as a link of doi.org. */
const DOI_PATTERN = /^(?:https?:\/\/(?:dx\.)?doi\.org\/|doi:\s*)?(?<doi>10\.\d{4,9}\/\S+)$/i;
/** An arXiv identifier, after arXiv:, or in the link of its page or of its PDF. */
const ARXIV_PATTERN = /^(?:arxiv:\s*|(?:https?:\/\/)?(?:www\.|export\.)?arxiv\.org\/(?:abs|pdf)\/)(?<id>[^\s?#]+?)(?:\.pdf)?\/?(?:[?#]\S*)?$/i;
/** How long a request for a text may take, in milliseconds. */
const LINK_TIMEOUT = 60000;

/** A work of OpenAlex, as much of it as finding an open copy needs. */
interface IOpenAlexWork {
	readonly display_name?: string | null;
	readonly best_oa_location?: { readonly pdf_url?: string | null } | null;
	readonly locations?: readonly { readonly pdf_url?: string | null }[];
}

/** What a link, a DOI or an arXiv identifier leads to: where its PDF may be, its page, and its title when known. */
interface ILinkedText {
	readonly pdf?: string;
	readonly page: string;
	readonly title?: string;
}

/** Whether the bytes are those of a PDF. */
function isPdf(content: VSBuffer): boolean {
	return content.slice(0, 1024).toString().includes('%PDF-');
}

/** The content of the meta tag `name` of a web page, as publishers give Google Scholar (citation_pdf_url, citation_title). */
function metaContent(html: string, name: string): string | undefined {
	for (const tag of html.match(/<meta\b[^>]*>/gi) ?? []) {
		if (new RegExp(`\\bname\\s*=\\s*["']${name}["']`, 'i').test(tag)) {
			const content = /\bcontent\s*=\s*(?:"(?<double>[^"]*)"|'(?<single>[^']*)')/i.exec(tag)?.groups;
			const value = (content?.double ?? content?.single)?.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, '\'').trim();
			if (value) {
				return value;
			}
		}
	}
	return undefined;
}

/** A file name from a title: a colon becomes a dash, and the characters a file name cannot hold are left out. */
function fileNameOf(title: string): string {
	return [...title].filter(character => character >= ' ').join('')
		.replace(/\s*:\s*/g, ' - ')
		.replace(/[\\/*?"<>|]/g, '')
		.replace(/\s+/g, ' ')
		.trim()
		.replace(/[. ]+$/, '')
		.slice(0, 180);
}

/** A text of the catalogue of PollisKnowledge.jl, as knowledge_base.jl answers it. */
interface IKnowledgeText {
	readonly id: string;
	readonly title: string;
	readonly type: string;
	readonly edition: string;
	readonly authors: readonly string[];
	readonly publisher: string;
	readonly year: number;
	readonly subject: string;
	readonly format: 'pdf' | 'markdown';
	readonly licence: string;
	readonly licence_url: string;
	readonly page: string;
	readonly size_mb: number;
	readonly changes?: string;
	/** The page of its publisher where the printed book is sold, for a published book. */
	readonly hard_copy?: string;
	/** The path of its cover, in PollisKnowledge.jl; "" for a text without one. */
	readonly cover_file?: string;
	downloaded: boolean;
	documents: ITextDocument[];
}

/** How far the index has come, from language-julia.pollisCollectionProgress. */
interface IKnowledgeProgress {
	readonly stage: 'compiling' | 'installing' | 'reading' | 'embedding';
	readonly done: number;
	readonly total: number;
}

type KnowledgeMessage =
	| { readonly command: 'ready' }
	| { readonly command: 'switch'; readonly id: string; readonly on: boolean }
	| { readonly command: 'switchShown'; readonly ids: readonly string[]; readonly on: boolean }
	| { readonly command: 'rows'; readonly rows: number }
	| { readonly command: 'open'; readonly id: string }
	| { readonly command: 'link'; readonly url: string }
	| { readonly command: 'words'; readonly words: number }
	| { readonly command: 'model'; readonly model: string }
	| { readonly command: 'build' }
	| { readonly command: 'add' }
	| { readonly command: 'rename'; readonly id: string };

/** The open page, so a second request shows it again. */
let openPage: WebviewInput | undefined;

/** Opens the Knowledge Base page, or shows it again when it is open. */
function openKnowledgeBasePage(accessor: ServicesAccessor): void {
	const webviewWorkbenchService = accessor.get(IWebviewWorkbenchService);
	const commandService = accessor.get(ICommandService);
	const storageService = accessor.get(IStorageService);
	const configurationService = accessor.get(IConfigurationService);
	const askPollisService = accessor.get(IAskPollisService);
	const editorService = accessor.get(IEditorService);
	const openerService = accessor.get(IOpenerService);
	const notificationService = accessor.get(INotificationService);
	const notebookEditorModelResolverService = accessor.get(INotebookEditorModelResolverService);
	const notebookKernelService = accessor.get(INotebookKernelService);
	const fileService = accessor.get(IFileService);
	const pathService = accessor.get(IPathService);
	const hostService = accessor.get(IHostService);
	const contextService = accessor.get(IWorkspaceContextService);
	const fileDialogService = accessor.get(IFileDialogService);
	const dialogService = accessor.get(IDialogService);
	const quickInputService = accessor.get(IQuickInputService);
	const requestService = accessor.get(IRequestService);
	const progressService = accessor.get(IProgressService);

	if (openPage && !openPage.isDisposed()) {
		webviewWorkbenchService.revealWebview(openPage, openPage.group ?? -1, false);
		return;
	}
	const title = localize('knowledgeBase.title', "Knowledge Base");
	const webviewInput = webviewWorkbenchService.openWebview(
		{
			title,
			options: { retainContextWhenHidden: true },
			contentOptions: { allowScripts: true, localResourceRoots: [] },
			extension: undefined,
		},
		'pollis.knowledgeBase',
		title,
		undefined,
		{ group: undefined, preserveFocus: false }
	);
	webviewInput.webview.setHtml(pageHtml(storedRows(storageService, ROWS_PAGE, DEFAULT_ROWS)));
	openPage = webviewInput;
	const post = (message: object) => webviewInput.webview.postMessage(message);

	const disposables = new DisposableStore();
	disposables.add(registerScaffoldPageHandlers(webviewInput, 'knowledgeBase', title, KNOWLEDGEBASE_METADATA.knowledgeBase, openerService, editorService, commandService, notificationService, notebookEditorModelResolverService, notebookKernelService, fileService, pathService, storageService));
	disposables.add(webviewInput.webview.onDidDispose(() => {
		openPage = undefined;
		disposables.dispose();
	}));

	let settings: IKnowledgeSettings = { on: [], off: [], words: DEFAULT_WORDS, embeddingModel: '' };
	try {
		settings = { ...settings, ...JSON.parse(storageService.get(SETTINGS_KEY, StorageScope.APPLICATION, '{}')) };
	} catch {
		// Settings that cannot be read: the defaults
	}
	const save = () => storageService.store(SETTINGS_KEY, JSON.stringify(settings), StorageScope.APPLICATION, StorageTarget.USER);

	/** The catalogue, once knowledge_base.jl has answered, or why it could not. */
	let texts: IKnowledgeText[] | undefined;
	let catalogueError: string | undefined;
	/** The texts downloading, and those whose download failed, with why. */
	const downloading = new Set<string>();
	const failed = new Map<string, string>();
	/** The covers of the books, by their ids, as the page shows them: data URIs, which its policy allows. */
	const covers: Record<string, string> = {};

	const databaseFile = async () => joinPath(await pathService.userHome(), '.pollis', 'rag', INDEX_FILE);
	const indexFile = async () => {
		const resource = await databaseFile();
		return await fileService.exists(resource) ? resource.fsPath : undefined;
	};
	/** The embedding models of this computer. */
	const embeddingModels = async () => (await commandService.executeCommand<IInstalledModel[]>('language-julia.pollisInstalledModels').catch(() => undefined) ?? [])
		.filter(model => model.kind === 'embedding')
		.map(model => ({ value: model.value ?? model.file, label: model.name, size: model.sizeLabel ?? '' }));
	/** The embedding model of the collection: its own, else that of Ask Pollis, else the first of this computer. */
	const modelOf = (models: readonly { value: string }[]) =>
		[settings.embeddingModel, configurationService.getValue<string>('pollis.ask.embeddingModel') || ASK_EMBEDDING_MODEL].find(value => value && models.some(model => model.value === value)) ?? models[0]?.value ?? '';
	const progressOf = async () => commandService.executeCommand<IKnowledgeProgress | undefined>('language-julia.pollisCollectionProgress', (await databaseFile()).fsPath).catch(() => undefined);
	const progressTimer = disposables.add(new IntervalTimer());
	const watchProgress = () => progressTimer.cancelAndSet(async () => post({ command: 'progress', progress: await progressOf() }), 1000);
	/** The user's own texts, in the knowledge folder of the Pollis Workspace open, by their paths. */
	let yours: IYourText[] = [];
	/** The type of a text of the user's, by the subfolder of the knowledge folder it is in. */
	const yourTypes: Record<string, string> = {
		books: localize('knowledgeBase.typeBook', "Book"),
		articles: localize('knowledgeBase.typeArticle', "Article"),
		reports: localize('knowledgeBase.typeReport', "Report"),
	};
	const otherType = localize('knowledgeBase.typeOther', "Other");
	/** The knowledge folder of the Pollis Workspace open, once read; undefined without one. */
	let knowledgeFolder: URI | undefined;
	// The knowledge folder and its subfolders are watched, each on its own (a correlated watcher sees one folder), so
	// that a file put in them or taken out shows at once
	const watchers = disposables.add(new MutableDisposable<DisposableStore>());
	let watched = '';
	const yoursChanged = disposables.add(new RunOnceScheduler(() => readYoursAgain(), 300));
	const watch = (folders: readonly URI[]) => {
		const key = folders.map(folder => folder.toString()).join('\n');
		if (key === watched) {
			return;
		}
		watched = key;
		const store = new DisposableStore();
		for (const folder of folders) {
			const watcher = store.add(fileService.createWatcher(folder, { recursive: false, excludes: [] }));
			store.add(watcher.onDidChange(() => yoursChanged.schedule()));
		}
		watchers.value = store;
	};
	/** Reads the user's texts again; whether they have changed. */
	const readYours = async () => {
		const found: IYourText[] = [];
		const workspace = await findPollisWorkspace(contextService, fileService);
		const knowledge = workspace && await pollisWorkspaceFolder(fileService, workspace, 'knowledge').catch(() => undefined);
		knowledgeFolder = knowledge;
		const folders = knowledge ? [knowledge] : [];
		const visit = async (folder: URI, type: string, depth: number): Promise<void> => {
			const stat = await fileService.resolve(folder, { resolveMetadata: true }).catch(() => undefined);
			for (const child of stat?.children ?? []) {
				const format = YOUR_EXTENSIONS[extname(child.resource).toLowerCase()];
				if (child.isDirectory && !depth) {
					folders.push(child.resource);
				}
				if (child.isDirectory && depth < YOUR_DEPTH) {
					await visit(child.resource, depth ? type : yourTypes[child.name.toLowerCase()] ?? otherType, depth + 1);
				} else if (!child.isDirectory && format && child.name.toLowerCase() !== 'readme.md') {
					const name = basename(child.resource);
					found.push({
						id: child.resource.fsPath, type, path: workspace ? relativePath(workspace, child.resource) ?? name : name,
						size: Math.max(0.1, Math.round(child.size / 1e5) / 10),
						document: { file: child.resource.fsPath, title: name.slice(0, name.length - extname(child.resource).length), kind: format },
					});
				}
			}
		};
		if (knowledge) {
			await visit(knowledge, otherType, 0);
		}
		watch(folders);
		found.sort((a, b) => a.path.localeCompare(b.path));
		const changed = JSON.stringify(found) !== JSON.stringify(yours);
		yours = found;
		return changed;
	};

	/** The Downloads folder of this computer, where a text to add most likely is: on Linux, as its user directories name it. */
	const downloadsFolder = async () => {
		const home = await pathService.userHome();
		if (isLinux) {
			const directories = await fileService.readFile(joinPath(home, '.config', 'user-dirs.dirs')).then(content => content.value.toString(), () => '');
			const named = /^XDG_DOWNLOAD_DIR="(?<folder>[^"]+)"/m.exec(directories)?.groups?.folder;
			const folder = named && URI.file(named.replace(/^\$HOME/, home.fsPath));
			if (folder && await fileService.exists(folder)) {
				return folder;
			}
		}
		const folder = joinPath(home, 'Downloads');
		return await fileService.exists(folder) ? folder : home;
	};
	/** The title the user writes for the file `name`, starting from `title`; undefined when they cancel. */
	const askTitle = (title: string, name: string) => quickInputService.input({
		value: title,
		prompt: localize('knowledgeBase.titlePrompt', "The title of {0}: Pollis names the file by it, and shows it in the table and in the sources of an answer.", name),
		validateInput: async value => fileNameOf(value) ? undefined : localize('knowledgeBase.titleNeeded', "Write the title of the text."),
	});
	/** Where the file named `name` goes in `folder`: there, unless a file has that name and the user keeps both or skips it. */
	const targetFor = async (folder: URI, name: string, extension: string) => {
		const target = joinPath(folder, name + extension);
		if (!await fileService.exists(target)) {
			return target;
		}
		const { result } = await dialogService.prompt<'replace' | 'both' | undefined>({
			type: Severity.Warning,
			message: localize('knowledgeBase.exists', "{0} is in the knowledge folder already.", name + extension),
			buttons: [
				{ label: localize({ key: 'knowledgeBase.replace', comment: ['&& denotes a mnemonic'] }, "&&Replace"), run: () => 'replace' },
				{ label: localize({ key: 'knowledgeBase.keepBoth', comment: ['&& denotes a mnemonic'] }, "&&Keep Both"), run: () => 'both' },
			],
			cancelButton: { label: localize('knowledgeBase.skip', "Skip"), run: () => undefined },
		});
		if (result !== 'both') {
			return result === 'replace' ? target : undefined;
		}
		for (let number = 2; ; number++) {
			const other = joinPath(folder, `${name} (${number})${extension}`);
			if (!await fileService.exists(other)) {
				return other;
			}
		}
	};
	/** The subfolder of the knowledge folder of the type the user chooses for `count` texts; undefined when they cancel. */
	const chooseFolder = async (workspace: URI, count: number) => {
		const type = await quickInputService.pick(YOUR_FOLDERS.map(folder => ({ label: yourTypes[folder], description: `knowledge/${folder}`, folder })), {
			placeHolder: count === 1
				? localize('knowledgeBase.typeOne', "The type of the text: the folder of the knowledge folder it goes in")
				: localize('knowledgeBase.typeMany', "The type of the {0} texts: the folder of the knowledge folder they go in", count),
		});
		return type && joinPath(await pollisWorkspaceFolder(fileService, workspace, 'knowledge'), type.folder);
	};
	/**
	 * Adds texts of the user's, from this computer or from a link, into the subfolder of the knowledge folder of the
	 * type they choose, each named by the title they write. Without a Pollis Workspace open, it opens one.
	 */
	const addTexts = async () => {
		const workspace = await findPollisWorkspace(contextService, fileService);
		if (!workspace) {
			await commandService.executeCommand(OPEN_POLLIS_WORKSPACE_COMMAND_ID);
			return;
		}
		const from = await quickInputService.pick([
			{ label: localize('knowledgeBase.fromComputer', "From This Computer..."), description: localize('knowledgeBase.fromComputerHint', "PDF, Markdown or text files, from the Downloads folder first"), link: false },
			{ label: localize('knowledgeBase.fromLink', "From a Link or DOI..."), description: localize('knowledgeBase.fromLinkHint', "A PDF, an article's page, a DOI or an arXiv identifier"), link: true },
		], { placeHolder: localize('knowledgeBase.addFrom', "Where your texts come from") });
		if (from?.link) {
			await addFromLink(workspace);
		} else if (from) {
			await addFromComputer(workspace);
		}
	};
	/** Adds the files the user chooses, copied, leaving them where they were. */
	const addFromComputer = async (workspace: URI) => {
		const files = await fileDialogService.showOpenDialog({
			title: localize('knowledgeBase.addTitle', "Add Your Texts to the Knowledge Base"),
			openLabel: localize({ key: 'knowledgeBase.addLabel', comment: ['&& denotes a mnemonic'] }, "&&Add"),
			canSelectFiles: true,
			canSelectMany: true,
			defaultUri: await downloadsFolder(),
			filters: [
				{ name: localize('knowledgeBase.documents', "Documents"), extensions: ['pdf', 'md', 'markdown', 'txt'] },
				{ name: 'PDF', extensions: ['pdf'] },
				{ name: 'Markdown', extensions: ['md', 'markdown'] },
				{ name: localize('knowledgeBase.text', "Text"), extensions: ['txt'] },
			],
		});
		const folder = files?.length ? await chooseFolder(workspace, files.length) : undefined;
		if (!files || !folder) {
			return;
		}
		for (const file of files) {
			const name = basename(file);
			const extension = extname(file);
			const title = await askTitle(name.slice(0, name.length - extension.length), name);
			const target = title === undefined ? undefined : await targetFor(folder, fileNameOf(title), extension);
			if (target && !isEqual(target, file)) {
				await fileService.copy(file, target, true).catch(error => notificationService.error(localize('knowledgeBase.addFailed', "{0} could not be added: {1}", name, String(error?.message ?? error))));
			}
		}
		await readYoursAgain();
	};
	const request = (url: string) => requestService.request({ type: 'GET', url, timeout: LINK_TIMEOUT, callSite: 'knowledgeBase.addFromLink' }, CancellationToken.None);
	/** Where a link, a DOI or an arXiv identifier leads: an open copy from OpenAlex for a DOI, the PDF of arXiv for its identifier. */
	const resolveLink = async (link: string): Promise<ILinkedText | undefined> => {
		const doi = DOI_PATTERN.exec(link)?.groups?.doi;
		if (doi) {
			const work = await request(`https://api.openalex.org/works/doi:${encodeURI(doi)}`).then(context => isSuccess(context) ? asJson<IOpenAlexWork>(context) : null, () => null);
			const pdf = work?.best_oa_location?.pdf_url ?? work?.locations?.find(location => location.pdf_url)?.pdf_url ?? undefined;
			return { pdf, page: `https://doi.org/${doi}`, title: work?.display_name ?? undefined };
		}
		const arxiv = ARXIV_PATTERN.exec(link)?.groups?.id;
		if (arxiv) {
			const feed = await request(`https://export.arxiv.org/api/query?id_list=${encodeURIComponent(arxiv)}`).then(context => isSuccess(context) ? asText(context) : null, () => null) ?? '';
			const title = /<entry>[\s\S]*?<title>(?<title>[\s\S]*?)<\/title>/.exec(feed)?.groups?.title.replace(/\s+/g, ' ').trim();
			return { pdf: `https://arxiv.org/pdf/${arxiv}`, page: `https://arxiv.org/abs/${arxiv}`, title: title || undefined };
		}
		return /^https?:\/\//i.test(link) ? { pdf: link, page: link } : undefined;
	};
	/** The PDF at `url`, or, at a web page, at the link to its PDF the page gives; the title the page gives too. */
	const downloadPdf = async (url: string): Promise<{ pdf?: VSBuffer; title?: string }> => {
		const context = await request(url);
		if (!isSuccess(context)) {
			return {};
		}
		const content = await streamToBuffer(context.stream);
		if (isPdf(content)) {
			return { pdf: content };
		}
		const html = content.toString();
		const title = metaContent(html, 'citation_title');
		const pdfUrl = metaContent(html, 'citation_pdf_url');
		if (!pdfUrl) {
			return { title };
		}
		const linked = await request(new URL(pdfUrl, url).toString());
		const pdf = isSuccess(linked) ? await streamToBuffer(linked.stream) : undefined;
		return { pdf: pdf && isPdf(pdf) ? pdf : undefined, title };
	};
	/**
	 * Adds the text of a link, a DOI or an arXiv identifier the user writes: its PDF downloaded, when an open copy is
	 * found; otherwise its page opens, for the user to download it there, with their library's access when it needs one.
	 */
	const addFromLink = async (workspace: URI) => {
		const link = (await quickInputService.input({
			placeHolder: 'https://..., 10.1137/141000671, arXiv:2106.11342',
			prompt: localize('knowledgeBase.linkPrompt', "A link to the text, to its page, its DOI or its arXiv identifier: Pollis downloads it when an open copy is found."),
		}))?.trim();
		if (!link) {
			return;
		}
		const found = await progressService.withProgress({ location: ProgressLocation.Notification, title: localize('knowledgeBase.downloadingLink', "Downloading {0}...", link) }, async () => {
			const linked = await resolveLink(link).catch(() => undefined);
			const downloaded = linked?.pdf ? await downloadPdf(linked.pdf).catch(() => ({ pdf: undefined, title: undefined })) : {};
			return { linked, pdf: downloaded.pdf, title: linked?.title ?? downloaded.title };
		});
		if (!found.linked) {
			notificationService.error(localize('knowledgeBase.notALink', "{0} is not a link, a DOI or an arXiv identifier.", link));
			return;
		}
		if (!found.pdf) {
			const page = found.linked.page;
			const { result } = await dialogService.prompt<boolean>({
				type: Severity.Info,
				message: localize('knowledgeBase.noOpenCopy', "No open copy of {0} could be downloaded.", found.title ?? link),
				detail: localize('knowledgeBase.noOpenCopyDetail', "Download it from its page, with your library's access if it needs one, then add it with Add Your Texts... and From This Computer..."),
				buttons: [{ label: localize({ key: 'knowledgeBase.openPage', comment: ['&& denotes a mnemonic'] }, "&&Open Its Page"), run: () => true }],
				cancelButton: { label: localize('knowledgeBase.close', "Close"), run: () => false },
			});
			if (result) {
				await commandService.executeCommand(OPEN_LINK_COMMAND_ID, page);
			}
			return;
		}
		const folder = await chooseFolder(workspace, 1);
		const lastPart = decodeURIComponent(found.linked.pdf?.split(/[?#]/)[0].split('/').filter(Boolean).pop() ?? '').replace(/\.pdf$/i, '');
		const title = folder && await askTitle(found.title ?? lastPart, found.title ?? link);
		const target = folder && title !== undefined ? await targetFor(folder, fileNameOf(title), '.pdf') : undefined;
		if (target) {
			await fileService.writeFile(target, found.pdf).catch(error => notificationService.error(localize('knowledgeBase.addFailed', "{0} could not be added: {1}", basename(target), String(error?.message ?? error))));
			await readYoursAgain();
		}
	};
	/** Renames the file of a text of the user's by the title they write, in its folder. */
	const renameText = async (id: string) => {
		const text = yours.find(candidate => candidate.id === id);
		if (!text) {
			return;
		}
		const resource = URI.file(text.document.file);
		const title = await askTitle(text.document.title, basename(resource));
		if (title === undefined) {
			return;
		}
		const name = fileNameOf(title) + extname(resource);
		const target = joinPath(dirname(resource), name);
		if (isEqual(target, resource)) {
			return;
		}
		// A file of that name, other than this one with its name in other capitals, is not written over
		if (target.fsPath.toLowerCase() !== resource.fsPath.toLowerCase() && await fileService.exists(target)) {
			notificationService.error(localize('knowledgeBase.renameExists', "{0} is in its folder already: write another title.", name));
			return;
		}
		try {
			await fileService.move(resource, target, false);
		} catch (error) {
			notificationService.error(localize('knowledgeBase.renameFailed', "{0} could not be renamed: {1}", basename(resource), String(error?.message ?? error)));
			return;
		}
		if (settings.off.includes(id)) {
			settings.off = settings.off.map(off => off === id ? target.fsPath : off);
			save();
		}
		await readYoursAgain();
	};

	/** The documents of the texts switched on and on this computer, which the index is built from. */
	const documentsOn = () => [
		...(texts ?? []).filter(text => settings.on.includes(text.id) && text.downloaded).flatMap(text => text.documents),
		...yours.filter(text => !settings.off.includes(text.id)).map(text => text.document),
	];

	const readCatalogue = async () => {
		const answer = await commandService.executeCommand<{ texts?: IKnowledgeText[]; error?: string }>('language-julia.pollisKnowledgeBase', { task: 'texts' }).catch(() => undefined);
		texts = answer?.texts;
		catalogueError = texts ? undefined : answer?.error ?? 'failed';
		for (const id of await commandService.executeCommand<string[]>('language-julia.pollisKnowledgeBaseDownloading').catch(() => undefined) ?? []) {
			downloading.add(id);
		}
		for (const text of texts ?? []) {
			if (text.cover_file && !covers[text.id]) {
				const file = URI.file(text.cover_file);
				const content = await fileService.readFile(file).catch(() => undefined);
				if (content) {
					covers[text.id] = `data:image/${extname(file).toLowerCase() === '.png' ? 'png' : 'jpeg'};base64,${encodeBase64(content.value)}`;
				}
			}
		}
	};

	/** The texts with what the page shows of them, the index and the embedding models. */
	const postState = async () => {
		const index = await indexFile();
		const status = index ? await askPollisService.collectionStatus(index) : undefined;
		const indexed = index ? await askPollisService.indexedDocuments(index) ?? [] : [];
		const passagesOf = (documents: readonly ITextDocument[]) => documents.reduce((sum, document) => sum + (indexed.find(d => d.file === document.file)?.passages ?? 0), 0);
		const files = documentsOn().map(document => document.file).sort();
		const indexedFiles = indexed.map(document => document.file).sort();
		const models = await embeddingModels();
		const progress = await progressOf();
		if (progress) {
			watchProgress();
		} else {
			progressTimer.cancel();
		}
		post({
			command: 'state',
			error: catalogueError,
			reading: !texts && !catalogueError,
			workspace: !!knowledgeFolder,
			texts: texts || yours.length ? [
				...(texts ?? []).map(text => ({
					id: text.id, title: text.title, type: text.type, edition: text.edition, authors: text.authors, publisher: text.publisher, year: text.year, subject: text.subject,
					format: text.format, licence: text.licence, licenceUrl: text.licence_url, page: text.page, hardCopy: text.hard_copy, size: text.size_mb, changes: text.changes,
					on: settings.on.includes(text.id), downloaded: text.downloaded, downloading: downloading.has(text.id), failed: failed.get(text.id),
					passages: passagesOf(text.documents),
				})),
				...yours.map(text => ({
					id: text.id, title: text.document.title, type: text.type, path: text.path, authors: [], subject: '', licence: '', format: text.document.kind, size: text.size,
					yours: true, on: !settings.off.includes(text.id), downloaded: true, passages: passagesOf([text.document]),
				})),
			] : undefined,
			words: settings.words, models, model: modelOf(models), status,
			stale: !!status?.passages && (files.length !== indexedFiles.length || files.some((file, i) => file !== indexedFiles[i])),
			progress,
		});
	};

	/**
	 * Switches the texts `ids` on or off; those switched on and not yet on this computer are downloaded, one at a time,
	 * and one whose download fails is switched off again, with why.
	 */
	const switchTexts = async (ids: readonly string[], on: boolean) => {
		const chosen = (texts ?? []).filter(text => ids.includes(text.id));
		const yoursChosen = yours.filter(text => ids.includes(text.id));
		for (const text of yoursChosen) {
			settings.off = settings.off.filter(id => id !== text.id);
			if (!on) {
				settings.off.push(text.id);
			}
		}
		if (!chosen.length) {
			if (yoursChosen.length) {
				save();
				await postState();
			}
			return;
		}
		for (const text of chosen) {
			failed.delete(text.id);
			settings.on = settings.on.filter(id => id !== text.id);
			if (on) {
				settings.on.push(text.id);
			}
		}
		save();
		const fetched = on ? chosen.filter(text => !text.downloaded && !downloading.has(text.id)) : [];
		for (const text of fetched) {
			downloading.add(text.id);
		}
		await postState();
		for (const text of fetched) {
			const answer = await commandService.executeCommand<{ documents?: ITextDocument[]; error?: string }>('language-julia.pollisKnowledgeBase', { task: 'download', id: text.id }).catch(() => undefined);
			downloading.delete(text.id);
			if (answer?.documents) {
				text.downloaded = true;
				text.documents = answer.documents;
			} else {
				failed.set(text.id, answer?.error ?? 'failed');
				settings.on = settings.on.filter(id => id !== text.id);
				save();
			}
			if (openPage !== webviewInput) {
				return;
			}
			await postState();
		}
	};

	/** Reads the catalogue and the user's texts and shows them, with the covers of the books. */
	const showCatalogue = async () => {
		await readYours();
		await readCatalogue();
		await postState();
		post({ command: 'covers', covers });
	};
	// Until the catalogue is read, as when PollisKnowledge.jl is installed while the page is open, it is read again
	// each time the page or the window gets the focus
	let reading = false;
	const readAgain = async () => {
		if (texts || reading) {
			return;
		}
		reading = true;
		try {
			await showCatalogue();
		} finally {
			reading = false;
		}
	};
	// The user's texts are read again at each focus, as files added to the knowledge folder or taken out of it
	const readYoursAgain = async () => {
		if (await readYours() && openPage === webviewInput) {
			await postState();
		}
	};
	const focused = () => {
		readAgain();
		if (texts) {
			readYoursAgain();
		}
	};
	disposables.add(webviewInput.webview.onDidFocus(focused));
	disposables.add(hostService.onDidChangeFocus(hasFocus => {
		if (hasFocus) {
			focused();
		}
	}));

	disposables.add(webviewInput.webview.onMessage(async (e: { message: KnowledgeMessage }) => {
		const message = e.message;
		if (message.command === 'ready') {
			await postState();
			reading = true;
			try {
				await showCatalogue();
			} finally {
				reading = false;
			}
		} else if (message.command === 'switch' && hasKey(message, { id: true, on: true })) {
			await switchTexts([message.id], !!message.on);
		} else if (message.command === 'switchShown' && hasKey(message, { ids: true, on: true }) && Array.isArray(message.ids)) {
			await switchTexts(message.ids.filter(id => typeof id === 'string'), !!message.on);
		} else if (message.command === 'rows' && hasKey(message, { rows: true }) && isRowsChoice(message.rows)) {
			storeRows(storageService, ROWS_PAGE, message.rows);
		} else if (message.command === 'open' && hasKey(message, { id: true })) {
			const document = texts?.find(t => t.id === message.id && t.downloaded)?.documents[0] ?? yours.find(t => t.id === message.id)?.document;
			if (document?.kind === 'pdf') {
				await openPdfInViewer(commandService, URI.file(document.file));
			} else if (document) {
				await editorService.openEditor({ resource: URI.file(document.file) });
			}
		} else if (message.command === 'link' && hasKey(message, { url: true }) && texts?.some(text => text.page === message.url || text.licence_url === message.url || text.hard_copy === message.url)) {
			await commandService.executeCommand(OPEN_LINK_COMMAND_ID, message.url);
		} else if (message.command === 'words' && hasKey(message, { words: true }) && PASSAGE_WORDS.includes(message.words)) {
			settings.words = message.words;
			save();
			await postState();
		} else if (message.command === 'model' && hasKey(message, { model: true })) {
			settings.embeddingModel = message.model;
			save();
		} else if (message.command === 'add') {
			await addTexts();
		} else if (message.command === 'rename' && hasKey(message, { id: true })) {
			await renameText(message.id);
		} else if (message.command === 'build') {
			const model = modelOf(await embeddingModels());
			const documents = documentsOn();
			if (!model || !documents.length || await progressOf()) {
				return;
			}
			const building = commandService.executeCommand<{ passages?: number; error?: string }>('language-julia.pollisIndexCollection', {
				name: COLLECTION_NAME, database: (await databaseFile()).fsPath, documents, words: settings.words, model, prefix: embeddingPrefixes(model).passage,
			});
			post({ command: 'progress', progress: { stage: 'reading', done: 0, total: 0 } });
			watchProgress();
			const answer = await building.catch(() => ({ error: 'failed' }));
			if (openPage !== webviewInput) {
				return;
			}
			progressTimer.cancel();
			post({ command: 'built', error: answer?.error });
			await postState();
		}
	}));
}

/** The page: its texts come from here, the catalogue from the `state` message. */
function pageHtml(rows: number): string {
	const text = {
		title: localize('knowledgeBase.title', "Knowledge Base"),
		intro: localize('knowledgeBase.intro', "Openly licensed texts that a model can answer from: books, lecture notes, reports and manuals. A text switched on is downloaded once, with its licence, from {0}; Build the Index then cuts the texts switched on into passages and embeds them, in {1}. Each text is shared under its own licence, named in the table. Your own texts, in the {2} folder of the Pollis Workspace open, are in the table too, with Yours as their source.", '<span class="yellow">PollisKnowledge.jl</span>', '<span class="yellow">~/.pollis/rag</span>', '<span class="yellow">knowledge</span>'),
		search: localize('knowledgeBase.search', "Search texts"),
		allTypes: localize('knowledgeBase.allTypes', "All Types ({0})", '{0}'),
		typeCount: localize('knowledgeBase.typeCount', "{0} ({1})", '{0}', '{1}'),
		switchOnShown: localize('knowledgeBase.switchOnShown', "Switch On All Shown"),
		switchOffShown: localize('knowledgeBase.switchOffShown', "Switch Off All Shown"),
		switchOnShownHint: localize('knowledgeBase.switchOnShownHint', "Switch on every text the type and the search leave, on every page; those not on this computer are downloaded, one at a time"),
		switchOffShownHint: localize('knowledgeBase.switchOffShownHint', "Switch off every text the type and the search leave, on every page"),
		addTexts: localize('knowledgeBase.addTexts', "Add Your Texts..."),
		addTextsHint: localize('knowledgeBase.addTextsHint', "Add texts of your own to the knowledge folder of the Pollis Workspace, from this computer or from a link, each named by the title you write"),
		openWorkspace: localize('knowledgeBase.openWorkspace', "Open a Pollis Workspace to Add Your Texts..."),
		openWorkspaceHint: localize('knowledgeBase.openWorkspaceHint', "Your own texts are the files of the knowledge folder of the Pollis Workspace open"),
		rename: localize('knowledgeBase.rename', "Rename..."),
		renameHint: localize('knowledgeBase.renameHint', "Write the title of the text: Pollis renames its file by it"),
		previous: localize('knowledgeBase.previous', "Previous"),
		next: localize('knowledgeBase.next', "Next"),
		page: localize('knowledgeBase.page', "Page {0} of {1}", '{0}', '{1}'),
		reading: localize('knowledgeBase.reading', "Reading the catalogue of PollisKnowledge.jl..."),
		notInstalled: localize('knowledgeBase.notInstalled', "PollisKnowledge.jl is not installed yet: start the Julia REPL, or restart it, and Pollis installs it."),
		noJulia: localize('knowledgeBase.noJulia', "Julia was not found: the texts are downloaded with Julia."),
		failed: localize('knowledgeBase.failed', "The catalogue of PollisKnowledge.jl could not be read."),
		noMatch: localize('knowledgeBase.noMatch', "No text matches."),
		count: localize('knowledgeBase.count', "{0} of {1} texts switched on", '{0}', '{1}'),
		textColumn: localize('knowledgeBase.textColumn', "Text"),
		type: localize('knowledgeBase.type', "Type"),
		source: localize('knowledgeBase.source', "Source"),
		sourceHint: localize('knowledgeBase.sourceHint', "PollisKnowledge.jl, or Yours: a file in the knowledge folder of the Pollis Workspace open"),
		yours: localize('knowledgeBase.yours', "Yours"),
		yourFile: localize('knowledgeBase.yourFile', "Your file, unchanged."),
		cutYourMarkdown: localize('knowledgeBase.cutYourMarkdown', "Cut at its headings into passages of about {0} words.", '{0}'),
		cutText: localize('knowledgeBase.cutText', "Cut at its paragraphs into passages of about {0} words.", '{0}'),
		subject: localize('knowledgeBase.subject', "Subject"),
		licence: localize('knowledgeBase.licence', "Licence"),
		size: localize('knowledgeBase.size', "Size"),
		kept: localize('knowledgeBase.kept', "As Kept"),
		passages: localize('knowledgeBase.passages', "Passages"),
		inCollection: localize('knowledgeBase.inCollection', "In the Knowledge Base"),
		sizeMb: localize('knowledgeBase.sizeMb', "{0} MB", '{0}'),
		authorsPage: localize('knowledgeBase.authorsPage', "Authors' Page"),
		hardCopy: localize('knowledgeBase.hardCopy', "Hard Copy"),
		hardCopyHint: localize('knowledgeBase.hardCopyHint', "The printed book, at its publisher, {0}", '{0}'),
		thanks: localize('knowledgeBase.thanks', "With Thanks to Their Authors"),
		thanksIntro: localize('knowledgeBase.thanksIntro', "These books are open because their authors made them so. Each is also a printed book, from its publisher."),
		coverOf: localize('knowledgeBase.coverOf', "The cover of {0}", '{0}'),
		unchanged: localize('knowledgeBase.unchanged', "The PDF of its authors, unchanged."),
		cutPdf: localize('knowledgeBase.cutPdf', "Cut at its bookmarks into passages of about {0} words.", '{0}'),
		cutMarkdown: localize('knowledgeBase.cutMarkdown', "One document a section, cut at its headings into passages of about {0} words.", '{0}'),
		inIndex: localize('knowledgeBase.inIndex', "{0} in the index", '{0}'),
		downloading: localize('knowledgeBase.downloading', "Downloading..."),
		downloadFailed: localize('knowledgeBase.downloadFailed', "Not downloaded: {0}", '{0}'),
		sizeHint: localize('knowledgeBase.sizeHint', "The size of the text as downloaded."),
		passagesHint: localize('knowledgeBase.passagesHint', "How the text is cut into passages, and how many of them the index holds."),
		switchSlot: choiceSwitchHtml('SWITCH', localize('knowledgeBase.off', "Off"), localize('knowledgeBase.on', "On"), localize('knowledgeBase.switchOff', "Switch the text off"), localize('knowledgeBase.switchOn', "Switch the text on")),
		index: localize('knowledgeBase.index', "The Index"),
		indexIntro: localize('knowledgeBase.indexIntro', "The texts switched on, cut into passages and embedded, which Ask Pollis searches. Each passage is embedded once by each model, ever: building again takes it from {0}.", '<span class="yellow">~/.pollis/documents/embeddings.duckdb</span>'),
		embeddingModel: localize('knowledgeBase.embeddingModel', "Embedding Model"),
		passageLength: localize('knowledgeBase.passageLength', "Passage Length"),
		aboutWords: localize('knowledgeBase.aboutWords', "About {0} words", '{0}'),
		noModels: localize('knowledgeBase.noModels', "No embedding model on this computer yet: Compose > Local AI Models downloads them."),
		build: localize('knowledgeBase.build', "Build the Index"),
		buildNeeds: localize('knowledgeBase.buildNeeds', "Switch a text on, and choose an embedding model."),
		built: localize('knowledgeBase.built', "Built {0}: {1} passages of about {2} words, {3} embedded with {4}.", '{0}', '{1}', '{2}', '{3}', '{4}'),
		stale: localize('knowledgeBase.stale', "The texts switched on have changed since: Build the Index again."),
		otherModel: localize('knowledgeBase.otherModel', "The index was embedded with another model: Build the Index embeds it with this one."),
		otherWords: localize('knowledgeBase.otherWords', "The index was cut into passages of about {0} words: Build the Index cuts them to the new length.", '{0}'),
		stages: {
			compiling: localize('knowledgeBase.stageCompiling', "Compiling"),
			installing: localize('knowledgeBase.stageInstalling', "Installing DuckDB.jl"),
			reading: localize('knowledgeBase.stageReading', "Reading the texts"),
			embedding: localize('knowledgeBase.stageEmbedding', "Embedding"),
		},
		progress: localize('knowledgeBase.progress', "{0}: {1} of {2}", '{0}', '{1}', '{2}'),
		errors: {
			busy: localize('knowledgeBase.errorBusy', "The index is being built already."),
			noJulia: localize('knowledgeBase.errorNoJulia', "Julia was not found: the index is built with Julia."),
			noDuckDB: localize('knowledgeBase.errorNoDuckDB', "DuckDB.jl could not be installed."),
			failed: localize('knowledgeBase.errorFailed', "The index could not be built."),
		},
		sortHint: sortHint(),
	};
	return buildWebviewHtml({
		title: text.title,
		introHtml: text.intro,
		extraCss: `
${compareCss}
${LIBRARY_PAGE_MINIMAL_STYLE}
${stickyHeadCss}
${sortHeadingsCss}
${rowsChoiceCss}
${spinnerCss}
	${choiceSwitchCss}
	.yellow { color: #e8a33d; }
	body.vscode-light .yellow { color: #a8650d; }
	.libraryPage {
	h2 { font-size: 18px; font-weight: 400; margin: 24px 0 4px 0; }
	.filters { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; margin: 0 0 8px 0; }
	.search { width: 100%; max-width: 420px; padding: 4px 6px; font: inherit; color: var(--vscode-input-foreground); background: var(--vscode-input-background); border: 1px solid var(--vscode-input-border, var(--vscode-widget-border)); border-radius: 2px; }
	.search:focus, .types:focus { outline: 1px solid var(--vscode-focusBorder); outline-offset: -1px; }
	.types { padding: 4px 6px; font: inherit; color: var(--vscode-input-foreground); background: var(--vscode-input-background); border: 1px solid var(--vscode-input-border, var(--vscode-widget-border)); border-radius: 2px; }
	.bulk { display: inline-flex; gap: 12px; }
	.link:disabled { color: var(--vscode-disabledForeground); cursor: default; text-decoration: none; }
	.pager { display: flex; justify-content: center; align-items: center; gap: 16px; padding: 12px 8px; font-size: 12px; color: var(--vscode-descriptionForeground); }
	.pager .link { font-size: 12px; }
	.name { width: 28%; }
	.title.unavailable { color: var(--vscode-foreground); cursor: default; }
	.title.unavailable:hover { text-decoration: none; }
	.links { margin-top: 4px; }
	.size { white-space: nowrap; text-align: right; }
	.kept { width: 20%; }
	.cut { width: 17%; }
	.switch { white-space: nowrap; }
	.failed, .missing { color: var(--vscode-errorForeground); }
	.books { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 20px; margin: 8px 0 20px 0; }
	.book { display: flex; flex-direction: column; gap: 3px; }
	/* Every cover the same size, 4:5, cropped from its centre */
	.book img { width: 100%; max-width: 180px; aspect-ratio: 4 / 5; object-fit: cover; object-position: center; border-radius: 2px; box-shadow: 0 2px 8px var(--vscode-widget-shadow); cursor: pointer; margin-bottom: 6px; }
	.book .bookTitle { font-weight: 600; }
	}
`,
		bodyHtml: `
		<div class="libraryPage">
	<section id="thanks" hidden>
		<h2>${text.thanks}</h2>
		<p class="hint">${text.thanksIntro}</p>
		<div class="books" id="books"></div>
	</section>
	<div class="filters stickyBand" id="filters">
		<input class="search" id="search" type="search" placeholder="${text.search}" aria-label="${text.search}">
		<select class="types" id="types" aria-label="${text.type}"></select>
		<span class="bulk"><button class="link" id="onShown" title="${text.switchOnShownHint}">${text.switchOnShown}</button><button class="link" id="offShown" title="${text.switchOffShownHint}">${text.switchOffShown}</button><button class="link" id="addTexts" hidden></button></span>
		<span class="small" id="count"></span>
	</div>
	<p class="hint" id="note">${spinnerSvg}${text.reading}</p>
	<div class="pager" id="pagerTop" hidden></div>
	<table id="table" class="stickyHead" hidden>
		<thead><tr>
			<th class="name sortable" data-sort="title" data-label="${text.textColumn}" title="${text.sortHint}">${text.textColumn}</th>
			<th class="sortable" data-sort="type" data-label="${text.type}" title="${text.sortHint}">${text.type}</th>
			<th class="sortable" data-sort="source" data-label="${text.source}" title="${text.sourceHint}">${text.source}</th>
			<th class="sortable" data-sort="subject" data-label="${text.subject}" title="${text.sortHint}">${text.subject}</th>
			<th class="sortable" data-sort="licence" data-label="${text.licence}" title="${text.sortHint}">${text.licence}</th>
			<th class="size sortable" data-sort="size" data-label="${text.size}" title="${text.sizeHint}">${text.size}</th>
			<th class="kept">${text.kept}</th>
			<th class="cut sortable" data-sort="passages" data-label="${text.passages}" title="${text.passagesHint}">${text.passages}</th>
			<th class="switch sortable" data-sort="on" data-label="${text.inCollection}" title="${text.sortHint}">${text.inCollection}</th>
		</tr></thead>
		<tbody id="rows"></tbody>
	</table>
	<div class="pager" id="pager" hidden></div>
	<h2>${text.index}</h2>
	<p class="hint">${text.indexIntro}</p>
	<div class="row"><span class="small">${text.embeddingModel}</span> <select id="model"></select></div>
	<p class="hint" id="noModels" hidden>${text.noModels}</p>
	<p class="hint" id="otherModel" hidden>${text.otherModel}</p>
	<div class="row"><span class="small">${text.passageLength}</span> <select id="words">${PASSAGE_WORDS.map(words => `<option value="${words}">${text.aboutWords.replace('{0}', String(words))}</option>`).join('')}</select></div>
	<p class="hint" id="otherWords" hidden></p>
	<div class="row bar"><button class="action current" id="build">${text.build}</button><span class="small" id="buildStatus"></span></div>
	<p class="hint" id="stale" hidden>${text.stale}</p>
		</div>
`,
		pageScriptJs: `
	const TEXT = ${JSON.stringify(text)};
	const SPINNER = '${spinnerSvg}';
	${pageHelpersScript}
	${LIBRARY_PAGE_HELPERS}
	${choiceSwitchJs}
	${stickyHeadScript()}
	${sortHeadingsScript()}
	${rowsChoiceScript()}

	let state;
	let rows = ${rows};
	let page = 0;
	const types = document.getElementById('types');
	let covers = {};
	let building = false;
	let buildError;
	let sortColumn = (vscode.getState() || {}).sortColumn || 'title';
	let sortDescending = !!(vscode.getState() || {}).sortDescending;
	const search = document.getElementById('search');
	const modelSelect = document.getElementById('model');
	const wordsSelect = document.getElementById('words');
	const buildStatus = document.getElementById('buildStatus');
	stickBand(document.getElementById('filters'), document.getElementById('table'));

	// The authors in words: A, A and B, A, B and C
	function authorsOf(authors) {
		return authors.length <= 2 ? authors.join(' and ') : authors.slice(0, -1).join(', ') + ' and ' + authors[authors.length - 1];
	}

	// Where a text comes from: PollisKnowledge.jl, or the user
	function sourceOf(item) {
		return item.yours ? TEXT.yours : 'PollisKnowledge.jl';
	}

	function sortValue(item) {
		return sortColumn === 'source' ? sourceOf(item).toLowerCase() : sortColumn === 'size' ? item.size : sortColumn === 'passages' ? item.passages : sortColumn === 'on' ? (item.on ? 1 : 0) : String(item[sortColumn] || '').toLowerCase();
	}

	// (a) the text, its edition, authors and publisher, and its authors' page, or, for a text of the user's, its path in
	// the Pollis Workspace, (b) its type, (c) its source, (d) its subject, (e) its licence, (f) its size, (g) what is kept
	// of it, (h) how it is cut and its passages in the index, (i) its switch
	function row(item) {
		const tr = element('tr');
		const name = cell(tr, 'name');
		const titleLink = element('div', item.downloaded ? 'title' : 'title unavailable', item.title);
		if (item.downloaded) {
			titleLink.addEventListener('click', () => vscode.postMessage({ command: 'open', id: item.id }));
		}
		name.appendChild(titleLink);
		if (item.yours) {
			name.appendChild(element('div', 'small yellow', item.path));
			const links = element('div', 'links');
			const rename = link(TEXT.rename, () => vscode.postMessage({ command: 'rename', id: item.id }));
			rename.title = TEXT.renameHint;
			links.appendChild(rename);
			name.appendChild(links);
		} else {
			name.appendChild(element('div', 'small', item.edition + ' \\u00b7 ' + authorsOf(item.authors) + ' \\u00b7 ' + item.publisher + ', ' + item.year));
			const links = element('div', 'links');
			links.appendChild(link(TEXT.authorsPage, () => vscode.postMessage({ command: 'link', url: item.page })));
			name.appendChild(links);
		}
		cell(tr).textContent = item.type;
		cell(tr).textContent = sourceOf(item);
		cell(tr).textContent = item.subject;
		const licence = cell(tr);
		if (item.licence) {
			licence.appendChild(link(item.licence, () => vscode.postMessage({ command: 'link', url: item.licenceUrl })));
		}
		cell(tr, 'size').textContent = format(TEXT.sizeMb, item.size);
		cell(tr, 'kept small').textContent = item.yours ? TEXT.yourFile : item.changes || TEXT.unchanged;
		const cut = cell(tr, 'cut small');
		const cutText = item.format === 'pdf' ? TEXT.cutPdf : item.format === 'text' ? TEXT.cutText : item.yours ? TEXT.cutYourMarkdown : TEXT.cutMarkdown;
		cut.appendChild(element('div', '', format(cutText, state.words)));
		if (item.passages) {
			cut.appendChild(element('div', '', format(TEXT.inIndex, item.passages.toLocaleString())));
		}
		const toggle = cell(tr, 'switch');
		if (item.downloading) {
			toggle.innerHTML = SPINNER;
			toggle.appendChild(document.createTextNode(TEXT.downloading));
		} else {
			toggle.innerHTML = TEXT.switchSlot.split('SWITCH').join(item.key);
			if (item.failed) {
				toggle.appendChild(element('div', 'small failed', format(TEXT.downloadFailed, item.failed)));
			}
		}
		return tr;
	}

	// A card for each book with a cover: the cover and title, which open its authors' page, its edition, authors,
	// publisher and year, and the links to its authors' page and to the printed book at its publisher
	function renderBooks(shown) {
		const books = shown.filter(item => covers[item.id]);
		const box = document.getElementById('books');
		box.textContent = '';
		for (const item of books) {
			const card = element('div', 'book');
			const cover = element('img');
			cover.src = covers[item.id];
			cover.alt = format(TEXT.coverOf, item.title);
			cover.title = item.page;
			cover.addEventListener('click', () => vscode.postMessage({ command: 'link', url: item.page }));
			card.appendChild(cover);
			card.appendChild(element('div', 'bookTitle', item.title));
			card.appendChild(element('div', 'small', item.edition));
			card.appendChild(element('div', 'small', authorsOf(item.authors)));
			card.appendChild(element('div', 'small', item.publisher + ', ' + item.year));
			const links = element('div', 'links');
			links.appendChild(link(TEXT.authorsPage, () => vscode.postMessage({ command: 'link', url: item.page })));
			if (item.hardCopy) {
				links.appendChild(document.createTextNode(' \u00b7 '));
				const hardCopy = link(TEXT.hardCopy, () => vscode.postMessage({ command: 'link', url: item.hardCopy }));
				hardCopy.title = format(TEXT.hardCopyHint, item.publisher);
				links.appendChild(hardCopy);
			}
			card.appendChild(links);
			box.appendChild(card);
		}
		document.getElementById('thanks').hidden = !books.length;
	}

	// The types of the texts, each with how many texts it has, keeping the one chosen
	function fillTypes() {
		const chosen = types.value;
		const counts = new Map();
		for (const item of state.texts) {
			counts.set(item.type, (counts.get(item.type) || 0) + 1);
		}
		types.textContent = '';
		types.appendChild(new Option(format(TEXT.allTypes, state.texts.length), ''));
		for (const type of [...counts.keys()].sort()) {
			types.appendChild(new Option(format(TEXT.typeCount, type, counts.get(type)), type));
		}
		types.value = counts.has(chosen) ? chosen : '';
	}

	// The texts the type and the search leave, in the order chosen
	function shownTexts() {
		const query = search.value.trim().toLowerCase();
		const shown = state.texts.filter(item => (!types.value || item.type === types.value)
			&& (!query || [item.title, item.type, sourceOf(item), item.subject, item.licence, item.edition, item.publisher, item.path, ...item.authors].some(field => String(field || '').toLowerCase().includes(query))));
		return shown.sort((a, b) => {
			const x = sortValue(a), y = sortValue(b);
			return (x < y ? -1 : x > y ? 1 : 0) * (sortDescending ? -1 : 1);
		});
	}

	// The same pager above the table and under it, with the Rows choice while there are more than the fewest rows
	function fillPagers(shown, pages) {
		for (const pager of [document.getElementById('pagerTop'), document.getElementById('pager')]) {
			pager.textContent = '';
			pager.hidden = shown <= ${FEWEST_ROWS};
			if (pages > 1) {
				const turn = (label, to) => {
					const button = element('button', 'link', label);
					button.disabled = to < 0 || to >= pages;
					button.addEventListener('click', () => { page = to; render(); });
					return button;
				};
				pager.append(turn(TEXT.previous, page - 1), element('span', '', format(TEXT.page, page + 1, pages)), turn(TEXT.next, page + 1));
			}
			pager.append(rowsChoice(rows, chosen => {
				page = firstPageAfter(page, rows, chosen);
				rows = chosen;
				vscode.postMessage({ command: 'rows', rows });
				render();
			}));
		}
	}

	// Says the catalogue is being read, or why it could not be; false once it is read
	function showCatalogueNote(note) {
		if (state.reading) {
			note.innerHTML = SPINNER;
			note.appendChild(document.createTextNode(TEXT.reading));
		} else if (state.error !== undefined) {
			note.textContent = state.error === 'noJulia' ? TEXT.noJulia : state.error === 'notInstalled' ? TEXT.notInstalled : TEXT.failed;
		} else {
			return false;
		}
		note.hidden = false;
		return true;
	}

	// Add Your Texts..., or, without a Pollis Workspace open, the way to open one
	function renderAdd() {
		const add = document.getElementById('addTexts');
		add.textContent = state.workspace ? TEXT.addTexts : TEXT.openWorkspace;
		add.title = state.workspace ? TEXT.addTextsHint : TEXT.openWorkspaceHint;
		add.hidden = false;
	}

	function render() {
		const note = document.getElementById('note');
		const table = document.getElementById('table');
		renderAdd();
		if (!state.texts) {
			showCatalogueNote(note);
			table.hidden = true;
			return;
		}
		fillTypes();
		const shown = shownTexts();
		renderBooks(shown);
		const size = rowsPerPage(rows, shown.length);
		const pages = Math.max(1, Math.ceil(shown.length / size));
		page = Math.min(page, pages - 1);
		const onPage = shown.slice(page * size, (page + 1) * size);
		fillPagers(shown.length, pages);
		const body = document.getElementById('rows');
		body.textContent = '';
		for (const item of onPage) {
			body.appendChild(row(item));
		}
		for (const item of onPage) {
			if (!item.downloading) {
				const show = choiceSwitch(item.key, on => vscode.postMessage({ command: 'switch', id: item.id, on }));
				show(item.on);
			}
		}
		for (const heading of document.querySelectorAll('th.sortable')) {
			setSortArrow(heading, heading.dataset.label, heading.dataset.sort === sortColumn, sortDescending);
		}
		document.getElementById('count').textContent = format(TEXT.count, state.texts.filter(item => item.on).length, state.texts.length);
		if (!showCatalogueNote(note)) {
			note.textContent = shown.length ? '' : TEXT.noMatch;
			note.hidden = !!shown.length;
		}
		table.hidden = !shown.length;
		document.getElementById('onShown').disabled = !shown.some(item => !item.on && !item.downloading);
		document.getElementById('offShown').disabled = !shown.some(item => item.on);
	}

	function showProgress(progress) {
		building = !!progress;
		if (progress) {
			buildError = undefined;
			const stage = TEXT.stages[progress.stage] || '';
			buildStatus.innerHTML = SPINNER + ' ';
			buildStatus.appendChild(document.createTextNode(progress.total ? format(TEXT.progress, stage, progress.done, progress.total) : stage));
		}
		updateBuild();
	}

	function modelLabel(value) {
		const model = state && state.models.find(m => m.value === value);
		return model ? model.label : String(value || '').split('/').pop();
	}

	function updateBuild() {
		const ready = !!state && !!state.model && !!state.texts && state.texts.some(item => item.on && item.downloaded);
		document.getElementById('build').disabled = building || !ready;
		if (building) { return; }
		const status = state && state.status;
		buildStatus.textContent = buildError ? (TEXT.errors[buildError] || TEXT.errors.failed)
			: !ready ? TEXT.buildNeeds
			: status && status.passages ? format(TEXT.built, status.builtAt ? new Date(Number(status.builtAt)).toLocaleString() : '', status.passages.toLocaleString(), status.words, status.embedded.toLocaleString(), modelLabel(status.embedder))
			: '';
		buildStatus.classList.toggle('missing', !!buildError);
	}

	function renderIndex() {
		modelSelect.textContent = '';
		for (const model of state.models) {
			modelSelect.appendChild(new Option(model.size ? model.label + ' (' + model.size + ')' : model.label, model.value));
		}
		modelSelect.value = state.model;
		modelSelect.disabled = !state.models.length;
		wordsSelect.value = String(state.words);
		const status = state.status;
		document.getElementById('noModels').hidden = !!state.models.length;
		document.getElementById('otherModel').hidden = !status || !status.passages || !state.model || status.embedder === state.model;
		const otherWords = document.getElementById('otherWords');
		otherWords.textContent = status && status.passages ? format(TEXT.otherWords, status.words) : '';
		otherWords.hidden = !status || !status.passages || status.words === state.words;
		document.getElementById('stale').hidden = !state.stale;
		showProgress(state.progress);
	}

	for (const heading of document.querySelectorAll('th.sortable')) {
		heading.addEventListener('click', () => {
			sortDescending = heading.dataset.sort === sortColumn ? !sortDescending : false;
			sortColumn = heading.dataset.sort;
			page = 0;
			vscode.setState({ ...(vscode.getState() || {}), sortColumn, sortDescending });
			render();
		});
	}
	for (const filter of [search, types]) {
		filter.addEventListener(filter === search ? 'input' : 'change', () => {
			page = 0;
			if (state) {
				render();
			}
		});
	}
	for (const [id, on] of [['onShown', true], ['offShown', false]]) {
		document.getElementById(id).addEventListener('click', () => state && state.texts && vscode.postMessage({ command: 'switchShown', ids: shownTexts().map(item => item.id), on }));
	}
	document.getElementById('addTexts').addEventListener('click', () => vscode.postMessage({ command: 'add' }));
	modelSelect.addEventListener('change', () => {
		state.model = modelSelect.value;
		vscode.postMessage({ command: 'model', model: modelSelect.value });
		renderIndex();
	});
	wordsSelect.addEventListener('change', () => vscode.postMessage({ command: 'words', words: Number(wordsSelect.value) }));
	document.getElementById('build').addEventListener('click', () => {
		buildError = undefined;
		vscode.postMessage({ command: 'build' });
	});

	window.addEventListener('message', event => {
		const message = event.data;
		if (message.command === 'state') {
			state = message;
			// The switch of each text by its place, as the path of a text of the user's is no id of an element
			(state.texts || []).forEach((item, i) => item.key = 'switch-' + i);
			render();
			renderIndex();
		} else if (message.command === 'covers') {
			covers = message.covers;
			if (state) { render(); }
		} else if (message.command === 'progress') {
			showProgress(message.progress);
		} else if (message.command === 'built') {
			building = false;
			buildError = message.error;
			updateBuild();
		}
	});
	vscode.postMessage({ command: 'ready' });
`,
	});
}

registerAction2(class extends Action2 {
	constructor() {
		super({
			id: KNOWLEDGE_BASE_COMMAND_ID,
			title: localize2('knowledgeBase.action', "Knowledge Base"),
			category: Categories.Help,
			f1: true,
		});
	}
	run(accessor: ServicesAccessor): void {
		openKnowledgeBasePage(accessor);
	}
});
