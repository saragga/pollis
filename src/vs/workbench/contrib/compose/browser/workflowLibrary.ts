/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { RunOnceScheduler } from '../../../../base/common/async.js';
import { toErrorMessage } from '../../../../base/common/errorMessage.js';
import { DisposableStore } from '../../../../base/common/lifecycle.js';
import { AppResourcePath, FileAccess } from '../../../../base/common/network.js';
import { language } from '../../../../base/common/platform.js';
import { basename, joinPath } from '../../../../base/common/resources.js';
import { URI } from '../../../../base/common/uri.js';
import { localize, localize2 } from '../../../../nls.js';
import { Action2, registerAction2 } from '../../../../platform/actions/common/actions.js';
import { IClipboardService } from '../../../../platform/clipboard/common/clipboardService.js';
import { ByteSize, IFileService } from '../../../../platform/files/common/files.js';
import { IInstantiationService, ServicesAccessor } from '../../../../platform/instantiation/common/instantiation.js';
import { INotificationService } from '../../../../platform/notification/common/notification.js';
import { ICommandService } from '../../../../platform/commands/common/commands.js';
import { IEditorService } from '../../../services/editor/common/editorService.js';
import { IPathService } from '../../../services/path/common/pathService.js';
import { parseToml, TomlValue } from '../../model/browser/common/tomlPanelData.js';
import { WebviewInput } from '../../webviewPanel/browser/webviewEditorInput.js';
import { IWebviewWorkbenchService } from '../../webviewPanel/browser/webviewWorkbenchService.js';
import { LIBRARY_PAGE_HELPERS, LIBRARY_PAGE_MINIMAL_STYLE, LIBRARY_PAGE_STYLE } from './libraryPage.js';
import { sortHeadingsCss, sortHeadingsScript, sortHint, stickyHeadCss } from '../../model/browser/webviews/webviewPager.js';
import { ContentKind, IDownloadedEntry, IPollisContentService } from './pollisContent.js';
import { BROWSE_METHODS_COMMAND_ID, deleteUserMethods, openUserMethod, readMethodSummaries, userMethodsFolder } from './newMethods.js';
import { BROWSE_REPLICATIONS_COMMAND_ID, deleteUserReplications, openUserReplication, readReplicationSummaries, userReplicationsFolder } from './replicateArticle.js';
import { OPEN_LINK_COMMAND_ID } from '../../monitor/browser/openLink.js';
import { IOpenerService } from '../../../../platform/opener/common/opener.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
import { INotebookEditorModelResolverService } from '../../notebook/common/notebookEditorModelResolverService.js';
import { INotebookKernelService } from '../../notebook/common/notebookKernelService.js';
import { IScaffoldPanelData } from '../../model/browser/common/model.types.js';
import { registerScaffoldPageHandlers } from '../../model/browser/handlers/scaffoldPage.handler.js';
import { BROWSEMETHODS_METADATA } from '../../model/browser/webviews/browseMethods.data.js';
import { BROWSEREPLICATIONS_METADATA } from '../../model/browser/webviews/browseReplications.data.js';
import { buildWebviewHtml, voiceButtonsCss, voiceButtonsHtml, voiceButtonsScript } from '../../model/browser/webviews/webviewScaffold.js';

export const SEARCH_WORKFLOW_LIBRARY_COMMAND_ID = BROWSE_REPLICATIONS_COMMAND_ID;
export const PUBLISHED_BENCHMARKS_COMMAND_ID = 'pollis.correctness.publishedBenchmarks';

/** A notebook library shipped with Pollis: one folder per entry, holding its notebook and data files. */
interface INotebookLibrary {
	/** Its id and metadata when it is a page in the Minimal style of the scaffold, with Learn More. */
	readonly page?: { readonly id: string; readonly data: IScaffoldPanelData };
	/** The library's folder, relative to the app root. */
	readonly base: AppResourcePath;
	/** The folder under `~/.pollis/` that holds the user's own copies. */
	readonly userFolder: string;
	readonly title: string;
	readonly intro: string;
	/** The heading of the column of the entries' names. */
	readonly entry: string;
	readonly empty: string;
	/** The message shown when an entry cannot be opened: `{0}` is its title, `{1}` the error. */
	readonly openFailed: (label: string, error: string) => string;
	/** Whether the library's entries are methods, each a folder with a method.toml, which open as the user's own (Browse Article Methods). */
	readonly userMethods?: boolean;
	/** The user's own work, listed above the library: their methods or their replications. */
	readonly yours?: IYours;
	/** The kind of content the library gets between releases (pollisContent.ts). */
	readonly content?: ContentKind;
}

/** One of the user's own methods or replications, as a library page lists it. */
interface IYourSummary {
	/** Its folder, as a URI string. */
	readonly id: string;
	readonly name: string;
	readonly title: string;
	readonly citation?: string;
	readonly inputs: number;
	readonly targets: number;
	/** No article, tables or work on it yet. */
	readonly empty: boolean;
	/** Listed under In Progress, else under the heading of those finished. */
	readonly inProgress: boolean;
}

/** The user's own work that a library page lists above the library, in progress and finished. */
interface IYours {
	/** The heading of those finished, Done by You; without it, those finished are entries of the library (published methods). */
	readonly finished?: string;
	/** What the page says when none is in progress. */
	readonly none: string;
	/** The link that deletes the empty ones: `{0}` is their number. */
	readonly deleteEmpty: string;
	folder(pathService: IPathService): URI;
	read(fileService: IFileService, pathService: IPathService): Promise<IYourSummary[]>;
	open(accessor: ServicesAccessor, id: string): Promise<void>;
	/** Deletes one, by id, or all the empty ones, after asking. */
	delete(accessor: ServicesAccessor, which: string | 'empty'): Promise<void>;
}

/** Compose > Replication > Browse Replications: famous analyses replicated from their articles. The folder and content key stay `workflows`, for the copies already made and the content repository. */
const WORKFLOWS: INotebookLibrary = {
	page: { id: 'browseReplications', data: BROWSEREPLICATIONS_METADATA.browseReplications },
	base: 'vs/workbench/contrib/compose/browser/media/workflows',
	userFolder: 'workflows',
	title: localize('workflowLibrary.title', "Replications"),
	intro: localize('workflowLibrary.intro', "Each replication reproduces a published analysis on its public data, printing every published value beside Julia's. The page lists the replications in three groups. In Progress holds those you have started with Replicate an Article and not yet added to yours: click a title to go on with one. Done by You follows, then the Library: click a name to open your own copy of the notebook, made in {0} the first time.", '<code class="pollisPath">~/.pollis/workflows</code>'),
	entry: localize('workflowLibrary.entry', "Replication"),
	empty: localize('workflowLibrary.empty', "There are no replications yet."),
	openFailed: (label, error) => localize('workflowLibrary.openFailed', "Could not open the replication {0}: {1}", label, error),
	content: 'workflows',
	yours: {
		finished: localize('workflowLibrary.done', "Done by You"),
		none: localize('workflowLibrary.yours.none', "None: Compose > Replication > Replicate an Article starts one."),
		deleteEmpty: localize('workflowLibrary.yours.deleteEmpty', "Delete Empty Replications ({0})"),
		folder: userReplicationsFolder,
		read: readReplicationSummaries,
		open: openUserReplication,
		delete: deleteUserReplications,
	},
};

/** Compose > Replication, below Replicate an Article: methods no Julia package has, each tested on data against published results. */
const NEW_METHODS: INotebookLibrary = {
	page: { id: 'browseMethods', data: BROWSEMETHODS_METADATA.browseMethods },
	base: 'vs/workbench/contrib/compose/browser/media/methods',
	userFolder: 'methods',
	title: localize('newMethods.title', "Article Methods"),
	intro: localize('newMethods.intro', "A method here is a published method that no Julia package has, written in Julia with its tests: the data of the article and the results it reports for them, printed beside Julia's. A method needs both, data and published results, to be added. The page lists the methods in two groups. In Progress holds those you have started and not yet published: click a title to go on with one. The Library holds the published methods, those that come with Pollis and those pushed with Package and Publish, each with its author: click a name to open the page of your own copy of the method, which Pollis makes in {0} the first time you open it.", '<code class="pollisPath">~/.pollis/methods</code>'),
	entry: localize('newMethods.entry', "Method"),
	empty: localize('newMethods.empty', "There are no new methods yet."),
	openFailed: (label, error) => localize('newMethods.openFailed', "Could not open the method {0}: {1}", label, error),
	userMethods: true,
	yours: {
		none: localize('newMethods.yours.none', "None: Compose > Replication > Create Article Method starts one."),
		deleteEmpty: localize('newMethods.yours.deleteEmpty', "Delete Empty Article Methods ({0})"),
		folder: userMethodsFolder,
		read: readMethodSummaries,
		open: openUserMethod,
		delete: deleteUserMethods,
	},
};

/** Compose > Correctness Tests: a method's results checked against a published benchmark. */
const PUBLISHED_BENCHMARKS: INotebookLibrary = {
	base: 'vs/workbench/contrib/compose/browser/media/correctness',
	userFolder: 'correctness',
	title: localize('publishedBenchmarks.title', "Published Benchmarks"),
	intro: localize('publishedBenchmarks.intro', "Each benchmark checks Julia's results against published or certified values. Click a name to open your own copy of the notebook, made in {0} the first time.", '<code class="pollisPath">~/.pollis/correctness</code>'),
	entry: localize('publishedBenchmarks.entry', "Benchmark"),
	empty: localize('publishedBenchmarks.empty', "There are no published benchmarks yet."),
	openFailed: (label, error) => localize('publishedBenchmarks.openFailed', "Could not open the benchmark {0}: {1}", label, error),
	content: 'benchmarks',
};

/** The `pollis.workflow` block of a notebook's metadata. */
interface IWorkflowMetadata {
	/** The date of the last change, `YYYY-MM-DD`. */
	readonly updated?: string;
	/** The article the notebook replicates, if it replicates one. */
	readonly article?: { readonly citation: string; readonly doi?: string; readonly url?: string; readonly bibtex?: string };
	/** The data the notebook uses; `bytes` marks a file it downloads, `optional` one it downloads only if asked. */
	readonly datasets?: readonly { readonly name: string; readonly source: string; readonly url?: string; readonly bytes?: number; readonly optional?: boolean }[];
}

/** An entry of a library, as the page shows it. */
interface ILibraryEntry {
	/** The entry's folder name, e.g. `garch`. */
	readonly folder: string;
	/** The folder of the library original. */
	readonly location: URI;
	/** The file shown under the title: the notebook, e.g. `garch.ipynb`, or a method's package code, e.g. `src/ThresholdAR.jl`. */
	readonly file: string;
	readonly title: string;
	/** A method's author, from its method.toml. */
	readonly author?: string;
	/** The GitHub page of a method's package, from its method.toml. */
	readonly repository?: string;
	readonly description: string;
	readonly article: IWorkflowMetadata['article'];
	readonly packages: readonly string[];
	/** The datasets by source, e.g. `PollisDatasets` with `pbc`, and what is said of how the source is read; `listed` shows every name, however many. */
	readonly datasets: readonly { readonly source: string; readonly note?: string; readonly url?: string; readonly names: readonly string[]; readonly listed?: boolean }[];
	/** The size of the shipped files. */
	readonly size: string;
	/** The same in bytes, to sort by. */
	readonly bytes: number;
	/** The size of the files the notebook downloads, always or only if asked. */
	readonly download?: string;
	readonly optionalDownload?: string;
	readonly updated?: string;
	/** The notebook's `updated` date, `YYYY-MM-DD`. */
	readonly updatedDate?: string;
	/** Marked until opened: an entry downloaded since the release, new or newer than the shipped one. */
	readonly status?: 'new' | 'updated';
	/** Whether the user's copy is older than the library's notebook. */
	readonly copyOutdated?: boolean;
}

interface INotebook {
	readonly cells: readonly { readonly cell_type: string; readonly source: string | string[] }[];
	readonly metadata?: { readonly pollis?: { readonly workflow?: IWorkflowMetadata } };
}

/** The packages a notebook installs: the names in its `Pollis.packages(...)` calls, without the URLs of packages from GitHub. */
function packagesOf(code: string): string[] {
	const packages = new Set<string>();
	for (const call of code.matchAll(/Pollis\.packages\((?<args>[^;\n]*)/g)) {
		for (const name of call.groups!.args.matchAll(/"(?<name>[^"]+)"(?:\s*=>\s*"[^"]*")?/g)) {
			packages.add(name.groups!.name);
		}
	}
	return [...packages];
}

/** A dataset's source, with the note in brackets at its end apart: `Dehejia's NBER data page (read into memory, not saved)`. */
function splitSource(source: string): { source: string; note?: string } {
	const parts = /^(?<name>.+?)\s*\((?<note>[a-z][^)]*)\)$/.exec(source)?.groups;
	return parts ? { source: parts.name, note: parts.note[0].toUpperCase() + parts.note.slice(1) } : { source };
}

function formatDate(date: string | undefined): string | undefined {
	return date && new Date(`${date}T00:00:00`).toLocaleDateString(language, { year: 'numeric', month: 'short', day: 'numeric' });
}

/** The size of the files in a folder and its subfolders. */
async function folderSize(fileService: IFileService, folder: URI): Promise<number> {
	let total = 0;
	for (const child of (await fileService.resolve(folder, { resolveMetadata: true })).children ?? []) {
		total += child.isDirectory ? await folderSize(fileService, child.resource) : child.size;
	}
	return total;
}

/**
 * Reads a method of the Methods library from its method.toml: its title, description, article
 * and packages, and its inputs as datasets: an input with a `label` as that label alone (none when
 * empty), the others
 * by the source each names before a colon, the names of PollisDatasets' tables all listed.
 * Undefined when the folder has no method.toml.
 */
async function readMethodEntry(fileService: IFileService, folder: URI): Promise<Omit<ILibraryEntry, 'folder' | 'location' | 'size' | 'bytes'> | undefined> {
	const tomlFile = joinPath(folder, 'method.toml');
	if (!await fileService.exists(tomlFile)) {
		return undefined;
	}
	const toml = parseToml((await fileService.readFile(tomlFile)).value.toString());
	const text = (value: unknown) => typeof value === 'string' && value ? value : undefined;
	const name = text(toml.name) ?? basename(folder);
	const citation = text(toml.citation);
	const doi = text(toml.doi);
	const datasets = new Map<string, { source: string; names: string[]; listed: boolean }>();
	for (const [input, value] of Object.entries(toml.inputs && typeof toml.inputs === 'object' ? toml.inputs : {})) {
		// An empty label leaves the input out
		if ((value as TomlValue).label === '') {
			continue;
		}
		const label = text((value as TomlValue).label);
		const source = label ?? (text((value as TomlValue).source) ?? '').split(':')[0].trim();
		let group = datasets.get(source);
		if (!group) {
			group = { source, names: [], listed: source === 'PollisDatasets' };
			datasets.set(source, group);
		}
		if (!label) {
			group.names.push(input);
		}
	}
	return {
		file: `src/${name}.jl`,
		title: text(toml.title) ?? name,
		author: text(toml.author),
		repository: text(toml.repository),
		description: text(toml.description) ?? '',
		article: citation ? { citation, doi, url: text(toml.article) } : undefined,
		packages: Array.isArray(toml.packages) ? toml.packages.filter((value): value is string => typeof value === 'string') : [],
		datasets: [...datasets.values()],
		// The date of its last push, which Package and Publish writes
		updated: formatDate(text(toml.updated)),
		updatedDate: text(toml.updated),
	};
}

/**
 * Reads a library: each folder with a notebook is an entry, its title the notebook's first `# `
 * heading, its description the paragraph after it, its packages those of its `Pollis.packages`
 * cells, and its article, datasets and date the `pollis.workflow` block of its metadata. The New
 * Methods library has no notebooks: each folder with a method.toml is an entry, read from it.
 */
async function readLibrary(fileService: IFileService, library: INotebookLibrary, downloaded: readonly IDownloadedEntry[] = [], unseen: ReadonlySet<string> = new Set()): Promise<ILibraryEntry[]> {
	const root = FileAccess.asFileUri(library.base);
	// The shipped folders, those downloaded since the release in place of theirs, and the new ones
	const folders = new Map<string, { name: string; resource: URI; isDirectory: boolean; status?: 'new' | 'updated' }>();
	if (await fileService.exists(root)) {
		for (const folder of (await fileService.resolve(root)).children ?? []) {
			folders.set(folder.name, folder);
		}
	}
	for (const { entry, folder, isNew } of downloaded) {
		folders.set(entry.id, { name: entry.id, resource: folder, isDirectory: true, status: unseen.has(entry.id) ? (isNew ? 'new' : 'updated') : undefined });
	}
	const entries: ILibraryEntry[] = [];
	for (const folder of folders.values()) {
		if (!folder.isDirectory) {
			continue;
		}
		if (library.userMethods) {
			const method = await readMethodEntry(fileService, folder.resource);
			if (method) {
				const bytes = await folderSize(fileService, folder.resource);
				entries.push({ ...method, folder: folder.name, location: folder.resource, size: ByteSize.formatSize(bytes), bytes });
			}
			continue;
		}
		const files = (await fileService.resolve(folder.resource, { resolveMetadata: true })).children ?? [];
		const notebook = files.find(child => child.name.endsWith('.ipynb'));
		if (!notebook) {
			continue;
		}
		const content: INotebook = JSON.parse((await fileService.readFile(notebook.resource)).value.toString());
		const source = (cell: INotebook['cells'][number]) => Array.isArray(cell.source) ? cell.source.join('') : cell.source;
		const markdown = content.cells.find(cell => cell.cell_type === 'markdown');
		const [heading, ...paragraphs] = (markdown ? source(markdown) : '').split(/\n\s*\n/).map(paragraph => paragraph.trim());
		const metadata = content.metadata?.pollis?.workflow ?? {};

		const datasets = new Map<string, { source: string; note?: string; url?: string; names: string[] }>();
		let download = 0;
		let optionalDownload = 0;
		for (const dataset of metadata.datasets ?? []) {
			let group = datasets.get(dataset.source);
			if (!group) {
				group = { ...splitSource(dataset.source), url: dataset.url, names: [] };
				datasets.set(dataset.source, group);
			}
			group.names.push(dataset.name);
			if (dataset.optional) {
				optionalDownload += dataset.bytes ?? 0;
			} else {
				download += dataset.bytes ?? 0;
			}
		}
		const bytes = await folderSize(fileService, folder.resource);
		entries.push({
			folder: folder.name,
			location: folder.resource,
			file: notebook.name,
			title: heading?.startsWith('# ') ? heading.slice(2) : folder.name,
			description: paragraphs[0]?.replace(/\s+/g, ' ') ?? '',
			article: metadata.article,
			packages: packagesOf(content.cells.filter(cell => cell.cell_type === 'code').map(source).join('\n')),
			datasets: [...datasets.values()],
			size: ByteSize.formatSize(bytes),
			bytes,
			download: download > 0 ? ByteSize.formatSize(download) : undefined,
			optionalDownload: optionalDownload > 0 ? ByteSize.formatSize(optionalDownload) : undefined,
			updated: formatDate(metadata.updated),
			updatedDate: metadata.updated,
			status: folder.status,
		});
	}
	return entries.sort((a, b) => a.title.localeCompare(b.title));
}

type LibraryMessage =
	| { readonly command: 'ready' }
	| { readonly command: 'open'; readonly folder: string }
	| { readonly command: 'openUpdated'; readonly folder: string }
	| { readonly command: 'copyBibtex'; readonly folder: string }
	| { readonly command: 'link'; readonly url: string }
	| { readonly command: 'openYours'; readonly id: string }
	| { readonly command: 'deleteYours'; readonly id: string }
	| { readonly command: 'deleteEmpty' };

/** The open pages, by library, so a second request shows the same page. */
const openPages = new Map<INotebookLibrary, WebviewInput>();

/**
 * Opens the page of a library: a table of its entries. Clicking an entry opens its notebook from
 * the user's own copy under `~/.pollis/`, made on first use, so it can be run and changed while the
 * library original stays as shipped. The notebook kernel runs in that folder, so the notebook finds
 * its files beside it.
 */
async function openLibraryPage(accessor: ServicesAccessor, library: INotebookLibrary): Promise<void> {
	const webviewWorkbenchService = accessor.get(IWebviewWorkbenchService);
	const fileService = accessor.get(IFileService);
	const editorService = accessor.get(IEditorService);
	const pathService = accessor.get(IPathService);
	const notificationService = accessor.get(INotificationService);
	const clipboardService = accessor.get(IClipboardService);
	const commandService = accessor.get(ICommandService);
	const instantiationService = accessor.get(IInstantiationService);
	const contentService = accessor.get(IPollisContentService);
	const openerService = accessor.get(IOpenerService);
	const notebookEditorModelResolverService = accessor.get(INotebookEditorModelResolverService);
	const notebookKernelService = accessor.get(INotebookKernelService);
	const storageService = accessor.get(IStorageService);

	const open = openPages.get(library);
	if (open && !open.isDisposed()) {
		webviewWorkbenchService.revealWebview(open, open.group ?? -1, false);
		return;
	}

	const userFolder = joinPath(await pathService.userHome({ preferLocal: true }), '.pollis', library.userFolder);
	// A library without a heading for the user's finished work lists them as its own entries: the methods the user
	// published, beside those shipped (a shipped method's copy is the shipped one, whatever its folder is called,
	// e.g. arcfs for ArcFS)
	const readPublished = async (shipped: readonly ILibraryEntry[]): Promise<ILibraryEntry[]> => {
		if (!library.userMethods || !library.yours || library.yours.finished) {
			return [];
		}
		const names = new Set(shipped.flatMap(entry => [entry.folder.toLowerCase(), entry.file.toLowerCase()]));
		const published: ILibraryEntry[] = [];
		for (const item of await library.yours.read(fileService, pathService)) {
			const folder = URI.parse(item.id);
			if (item.inProgress || names.has(basename(folder).toLowerCase())) {
				continue;
			}
			const method = await readMethodEntry(fileService, folder);
			if (method && !names.has(method.file.toLowerCase())) {
				const bytes = await folderSize(fileService, folder);
				published.push({ ...method, folder: basename(folder), location: folder, size: ByteSize.formatSize(bytes), bytes });
			}
		}
		return published;
	};
	const readEntries = async () => {
		const read = library.content
			? await readLibrary(fileService, library, await contentService.downloaded(library.content), contentService.unseen(library.content))
			: await readLibrary(fileService, library);
		const all = [...read, ...await readPublished(read)];
		// A user's copy older than the library's notebook: the page offers the new version beside it
		return Promise.all(all.map(async entry => {
			const copy = joinPath(userFolder, entry.folder, entry.file);
			if (library.userMethods || !entry.updatedDate || !await fileService.exists(copy)) {
				return entry;
			}
			try {
				const notebook: INotebook = JSON.parse((await fileService.readFile(copy)).value.toString());
				const copied = notebook.metadata?.pollis?.workflow?.updated;
				return { ...entry, copyOutdated: !!copied && copied < entry.updatedDate };
			} catch {
				return entry;
			}
		}));
	};
	let entries = await readEntries();
	if (entries.length === 0 && !library.yours) {
		notificationService.info(library.empty);
		return;
	}
	const webviewInput = webviewWorkbenchService.openWebview(
		{
			title: library.title,
			options: { retainContextWhenHidden: true },
			contentOptions: { allowScripts: true, localResourceRoots: [] },
			extension: undefined,
		},
		'pollis.workflowLibrary',
		library.title,
		undefined,
		{ group: undefined, preserveFocus: false }
	);
	webviewInput.webview.setHtml(pageHtml(library));
	openPages.set(library, webviewInput);

	const disposables = new DisposableStore();
	if (library.page) {
		disposables.add(registerScaffoldPageHandlers(webviewInput, library.page.id, library.title, library.page.data, openerService, editorService, commandService, notificationService, notebookEditorModelResolverService, notebookKernelService, fileService, pathService, storageService));
	}
	disposables.add(webviewInput.webview.onDidDispose(() => {
		openPages.delete(library);
		disposables.dispose();
	}));

	// The user's own methods or replications, sent again when their folder changes or the page gets the focus back
	const yours = library.yours;
	const sendYours = async () => {
		if (yours) {
			// The library's entries, the user's copies of shipped ones and their published ones, are not listed again
			// among their own, nor those finished when the library lists them
			entries = await readEntries();
			sendEntries();
			const listed = new Set(entries.map(entry => entry.folder));
			const own = (await yours.read(fileService, pathService)).filter(item => !listed.has(basename(URI.parse(item.id))) && (item.inProgress || !!yours.finished));
			webviewInput.webview.postMessage({ command: 'yours', yours: own });
		}
	};
	if (yours) {
		const root = yours.folder(pathService);
		await fileService.createFolder(root);
		const refresh = disposables.add(new RunOnceScheduler(() => sendYours(), 300));
		const watcher = disposables.add(fileService.createWatcher(root, { recursive: false, excludes: [] }));
		disposables.add(watcher.onDidChange(() => refresh.schedule()));
		disposables.add(webviewInput.webview.onDidFocus(() => refresh.schedule()));
	}

	// Copies the files of the library original that the user's copy lacks, keeping those the user has
	const copyMissing = async (source: URI, target: URI): Promise<void> => {
		for (const child of (await fileService.resolve(source)).children ?? []) {
			const destination = joinPath(target, child.name);
			if (child.isDirectory) {
				await copyMissing(child.resource, destination);
			} else if (!await fileService.exists(destination)) {
				await fileService.copy(child.resource, destination);
			}
		}
	};

	const sendEntries = () => webviewInput.webview.postMessage({ command: 'entries', entries: entries.map(({ location, ...rest }) => rest) });
	const seen = async (entry: ILibraryEntry) => {
		if (library.content && entry.status) {
			contentService.markSeen(library.content, entry.folder);
			entries = await readEntries();
			sendEntries();
		}
	};

	// The library's notebook, newer than the user's copy, copied beside it as NAME (DATE).ipynb with the files the copy lacks
	const openUpdated = async (entry: ILibraryEntry) => {
		try {
			const copy = joinPath(userFolder, entry.folder);
			await copyMissing(entry.location, copy);
			const updated = joinPath(copy, `${entry.file.replace(/\.ipynb$/, '')} (${entry.updatedDate}).ipynb`);
			if (!await fileService.exists(updated)) {
				await fileService.copy(joinPath(entry.location, entry.file), updated);
			}
			await editorService.openEditor({ resource: updated });
			await seen(entry);
		} catch (error) {
			notificationService.error(library.openFailed(entry.title, toErrorMessage(error)));
		}
	};

	const openEntry = async (entry: ILibraryEntry) => {
		try {
			const copy = joinPath(userFolder, entry.folder);
			if (library.userMethods) {
				// A library method becomes one of the user's methods: its page opens
				await copyMissing(entry.location, copy);
				await instantiationService.invokeFunction(openUserMethod, copy.toString());
				return;
			}
			if (!await fileService.exists(copy)) {
				await fileService.copy(entry.location, copy);
			}
			await editorService.openEditor({ resource: joinPath(copy, entry.file) });
			await seen(entry);
		} catch (error) {
			notificationService.error(library.openFailed(entry.title, toErrorMessage(error)));
		}
	};

	disposables.add(webviewInput.webview.onMessage((e: { message: LibraryMessage }) => {
		const message = e.message;
		const entry = message.command === 'open' || message.command === 'openUpdated' || message.command === 'copyBibtex' ? entries.find(candidate => candidate.folder === message.folder) : undefined;
		if (message.command === 'ready') {
			sendEntries();
			sendYours();
		} else if (message.command === 'openYours' && yours) {
			instantiationService.invokeFunction(yours.open, message.id);
		} else if ((message.command === 'deleteYours' || message.command === 'deleteEmpty') && yours) {
			instantiationService.invokeFunction(yours.delete, message.command === 'deleteEmpty' ? 'empty' : message.id).then(sendYours, error => notificationService.error(toErrorMessage(error)));
		} else if (message.command === 'open' && entry) {
			openEntry(entry);
		} else if (message.command === 'openUpdated' && entry?.copyOutdated) {
			openUpdated(entry);
		} else if (message.command === 'copyBibtex' && entry?.article?.bibtex) {
			clipboardService.writeText(entry.article.bibtex);
		} else if (message.command === 'link' && /^https:\/\//.test(message.url)) {
			commandService.executeCommand(OPEN_LINK_COMMAND_ID, message.url);
		}
	}));
}

/** The page: its texts come from here, its entries from the `entries` message. */
function pageHtml(library: INotebookLibrary): string {
	const text = {
		entry: library.entry,
		author: library.userMethods ? localize('workflowLibrary.author', "Author") : undefined,
		article: localize('workflowLibrary.article', "Article"),
		packages: localize('workflowLibrary.packages', "Packages"),
		datasets: localize('workflowLibrary.datasets', "Datasets"),
		size: localize('workflowLibrary.size', "Size"),
		updated: localize('workflowLibrary.updated', "Last Updated"),
		noArticle: localize('workflowLibrary.noArticle', "None"),
		noDatasets: localize('workflowLibrary.noDatasets', "None"),
		sortHint: sortHint(),
		webPage: localize('workflowLibrary.webPage', "Web Page"),
		copyBibtex: localize('workflowLibrary.copyBibtex', "Copy BibTeX"),
		copied: localize('workflowLibrary.copied', "Copied"),
		count: localize('workflowLibrary.count', "{0} datasets"),
		download: localize('workflowLibrary.download', "+ {0} download"),
		optionalDownload: localize('workflowLibrary.optionalDownload', "+ {0} download if asked"),
		more: localize('workflowLibrary.more', "more"),
		less: localize('workflowLibrary.less', "less"),
		inProgress: localize('newMethods.inProgress', "In Progress"),
		finished: library.yours?.finished,
		library: localize('newMethods.library.heading', "Library"),
		noYours: library.yours?.none,
		tables: localize('newMethods.yours.tables', "Tables"),
		tableCount: localize('newMethods.yours.tableCount', "{0} input, {1} target"),
		delete: localize('newMethods.yours.delete', "Delete"),
		deleteEmpty: library.yours?.deleteEmpty,
		new: localize('workflowLibrary.new', "New"),
		updatedBadge: localize('workflowLibrary.updatedBadge', "Updated"),
		copyOutdated: localize('workflowLibrary.copyOutdated', "Your copy is older than this version."),
		openUpdated: localize('workflowLibrary.openUpdated', "Open Updated Version"),
	};
	const yours = library.yours ? `
	<h2>${text.inProgress}</h2>
	<p class="small" id="noYours" hidden>${text.noYours}</p>
	<table id="yoursTable" hidden>
		<thead><tr><th>${library.entry}</th><th>${text.article}</th><th>${text.tables}</th><th></th></tr></thead>
		<tbody id="yours"></tbody>
	</table>
	<p><button class="link small" id="deleteEmpty" hidden></button></p>${text.finished ? `
	<div id="finishedYours" hidden>
		<h2>${text.finished}</h2>
		<table>
			<thead><tr><th>${library.entry}</th><th>${text.article}</th><th>${text.tables}</th><th></th></tr></thead>
			<tbody id="finished"></tbody>
		</table>
	</div>` : ''}
	<h2>${text.library}</h2>` : '';
	const heading = (column: string, label: string) => `<th class="sortable" data-sort="${column}" title="${text.sortHint}">${label}</th>`;
	const body = `
${yours}
	<table class="stickyHead">
		<thead><tr>
			${heading('title', text.entry)}${text.author ? heading('author', text.author) : ''}${heading('citation', text.article)}${heading('packages', text.packages)}${heading('datasets', text.datasets)}${heading('bytes', text.size)}${heading('updatedDate', text.updated)}
		</tr></thead>
		<tbody id="entries"></tbody>
	</table>`;
	const script = `
	const TEXT = ${JSON.stringify(text)};
	/** A source with more datasets than this shows their count, and their names on request. */
	const LISTED = 4;
	const body = document.getElementById('entries');
	let entries = [];
	let sortColumn = 'title';
	let sortDescending = false;

${LIBRARY_PAGE_HELPERS}
${sortHeadingsScript()}

	function nameCell(row, entry) {
		const td = cell(row, 'name');
		const title = element('div', 'title', entry.title);
		title.addEventListener('click', () => vscode.postMessage({ command: 'open', folder: entry.folder }));
		if (entry.status) {
			title.appendChild(element('span', 'badge', entry.status === 'new' ? TEXT.new : TEXT.updatedBadge));
		}
		td.appendChild(title);
		// A method's package, linked to its GitHub page once published
		if (entry.repository) {
			const name = link(entry.file.replace(/^src\//, ''), () => vscode.postMessage({ command: 'link', url: entry.repository }));
			name.classList.add('file');
			const line = element('div');
			line.appendChild(name);
			td.appendChild(line);
		} else {
			td.appendChild(element('div', 'file', entry.file));
		}
		if (entry.copyOutdated) {
			const note = element('div', 'small', TEXT.copyOutdated + ' ');
			note.appendChild(link(TEXT.openUpdated, () => vscode.postMessage({ command: 'openUpdated', folder: entry.folder })));
			td.appendChild(note);
		}
		const description = element('p', 'description clamped', entry.description);
		td.appendChild(description);
		// The toggle shows only when the description is longer than its three lines
		const toggle = link(TEXT.more, () => {
			const clamped = description.classList.toggle('clamped');
			toggle.textContent = clamped ? TEXT.more : TEXT.less;
		});
		toggle.classList.add('small');
		td.appendChild(toggle);
		requestAnimationFrame(() => { toggle.hidden = description.scrollHeight <= description.clientHeight; });
	}

	function articleCell(row, entry) {
		const td = cell(row, 'article');
		const article = entry.article;
		if (!article) {
			td.appendChild(element('span', 'small', TEXT.noArticle));
			return;
		}
		td.appendChild(element('p', 'citation small', article.citation));
		const links = element('div', 'links');
		if (article.doi) {
			links.appendChild(link('doi:' + article.doi, () => vscode.postMessage({ command: 'link', url: 'https://doi.org/' + article.doi })));
		} else if (article.url) {
			links.appendChild(link(TEXT.webPage, () => vscode.postMessage({ command: 'link', url: article.url })));
		}
		if (article.bibtex) {
			const copy = link(TEXT.copyBibtex, () => {
				vscode.postMessage({ command: 'copyBibtex', folder: entry.folder });
				copy.textContent = TEXT.copied;
				setTimeout(() => { copy.textContent = TEXT.copyBibtex; }, 1500);
			});
			links.appendChild(copy);
		}
		td.appendChild(links);
	}

	function datasetsCell(row, entry) {
		const td = cell(row);
		if (!entry.datasets.length) {
			td.appendChild(element('span', 'small', TEXT.noDatasets));
			return;
		}
		// Each source on its own line, its datasets under it, then how it is read
		for (const group of entry.datasets) {
			const block = element('div', 'source');
			if (group.source) {
				const source = group.url
					? link(group.source, () => vscode.postMessage({ command: 'link', url: group.url }))
					: element('div', group.source.startsWith('Pollis') ? 'pollisPackage' : '', group.source);
				source.classList.add('source-name');
				block.appendChild(source);
			}
			const names = element('div', '', group.names.join(', '));
			if (!group.listed && group.names.length > LISTED) {
				names.hidden = true;
				block.appendChild(link(TEXT.count.replace('{0}', group.names.length), () => { names.hidden = !names.hidden; }));
			}
			block.appendChild(names);
			if (group.note) {
				block.appendChild(element('div', 'small', group.note));
			}
			td.appendChild(block);
		}
	}

	function sortValue(entry) {
		switch (sortColumn) {
			case 'citation': return entry.article ? entry.article.citation : '';
			case 'packages': return entry.packages.join(', ');
			case 'datasets': return entry.datasets.map(group => group.source).join(', ');
			default: return entry[sortColumn] || '';
		}
	}

	// By the column chosen, from the smallest or reversed; empty cells last; then by title
	function compare(a, b) {
		const x = sortValue(a), y = sortValue(b);
		if (!x || !y) {
			return x === y ? a.title.localeCompare(b.title) : x ? -1 : 1;
		}
		const order = typeof x === 'number' ? x - y : x.localeCompare(y);
		return (sortDescending ? -order : order) || a.title.localeCompare(b.title);
	}

	function showSort() {
		for (const header of document.querySelectorAll('th.sortable')) {
			header.dataset.label ??= header.textContent;
			setSortArrow(header, header.dataset.label, header.dataset.sort === sortColumn, sortDescending);
		}
	}

	for (const header of document.querySelectorAll('th.sortable')) {
		header.addEventListener('click', () => {
			sortDescending = sortColumn === header.dataset.sort ? !sortDescending : false;
			sortColumn = header.dataset.sort;
			showSort();
			render();
		});
	}
	showSort();

	function render() {
		body.textContent = '';
		for (const entry of [...entries].sort(compare)) {
			const row = element('tr');
			nameCell(row, entry);
			if (TEXT.author) {
				cell(row).textContent = entry.author || '';
			}
			articleCell(row, entry);
			const packages = cell(row);
			for (const name of entry.packages) {
				packages.appendChild(element('span', 'package', name));
			}
			datasetsCell(row, entry);
			const size = cell(row, 'nowrap');
			size.appendChild(element('div', '', entry.size));
			if (entry.download) {
				size.appendChild(element('div', 'small', TEXT.download.replace('{0}', entry.download)));
			}
			if (entry.optionalDownload) {
				size.appendChild(element('div', 'small', TEXT.optionalDownload.replace('{0}', entry.optionalDownload)));
			}
			cell(row, 'nowrap').textContent = entry.updated || '';
			body.appendChild(row);
		}
	}

	// The user's own methods or replications: those in progress first, then those finished
	function renderYours(yours) {
		const inProgress = yours.filter(item => item.inProgress);
		const finished = yours.filter(item => !item.inProgress);
		document.getElementById('noYours').hidden = inProgress.length > 0;
		document.getElementById('yoursTable').hidden = inProgress.length === 0;
		renderYourRows(document.getElementById('yours'), inProgress);
		if (document.getElementById('finishedYours')) {
			document.getElementById('finishedYours').hidden = finished.length === 0;
			renderYourRows(document.getElementById('finished'), finished);
		}
		const empty = yours.filter(item => item.empty).length;
		const deleteEmpty = document.getElementById('deleteEmpty');
		deleteEmpty.hidden = empty === 0;
		deleteEmpty.textContent = TEXT.deleteEmpty.replace('{0}', empty);
	}
	function renderYourRows(container, yours) {
		container.textContent = '';
		for (const item of yours) {
			const row = element('tr');
			const name = cell(row, 'name');
			const title = element('div', 'title', item.title);
			title.addEventListener('click', () => vscode.postMessage({ command: 'openYours', id: item.id }));
			name.appendChild(title);
			name.appendChild(element('div', 'file', item.name));
			cell(row, 'article').appendChild(element('p', 'citation small', item.citation || TEXT.noArticle));
			cell(row, 'nowrap').textContent = TEXT.tableCount.replace('{0}', item.inputs).replace('{1}', item.targets);
			cell(row, 'nowrap').appendChild(link(TEXT.delete, () => vscode.postMessage({ command: 'deleteYours', id: item.id })));
			container.appendChild(row);
		}
	}
	if (document.getElementById('deleteEmpty')) {
		document.getElementById('deleteEmpty').addEventListener('click', () => vscode.postMessage({ command: 'deleteEmpty' }));
	}

	window.addEventListener('message', event => {
		if (event.data.command === 'entries') {
			entries = event.data.entries;
			render();
		} else if (event.data.command === 'yours') {
			renderYours(event.data.yours);
		}
	});
	vscode.postMessage({ command: 'ready' });
`;
	const rules = `
	${stickyHeadCss}
	${sortHeadingsCss}
	h2 { font-size: 16px; font-weight: 600; margin: 20px 0 6px 0; }
	/* The packages and the files, in the yellow of the folder in the intro */
	.file, .link.file, .package, .pollisPackage { color: #e8a33d; }`;
	// The folder in the intro, which the scaffold draws outside the libraryPage element
	const introRules = `
	.subtitle code.pollisPath { font-family: var(--vscode-editor-font-family); color: #e8a33d; background: var(--vscode-textPreformat-background); border-radius: 3px; padding: 0 3px; }
	body.vscode-light .subtitle code.pollisPath { color: #a8650d; }`;
	const lightRules = 'body.vscode-light .libraryPage .file, body.vscode-light .libraryPage .package, body.vscode-light .libraryPage .pollisPackage { color: #a8650d; }';
	if (library.page) {
		return buildWebviewHtml({
			title: library.title,
			omitPoweredBy: !library.page.data.packages.length,
			introHtml: library.intro,
			extraCss: `
${LIBRARY_PAGE_MINIMAL_STYLE}
	.libraryPage {${rules}
	}
	${lightRules}
	${introRules}
`,
			bodyHtml: `<div class="libraryPage">${body}</div>`,
			pageScriptJs: script,
		});
	}
	return `<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline';">
	<style>
		${voiceButtonsCss}
${LIBRARY_PAGE_STYLE}
	${rules}
	body.vscode-light .file, body.vscode-light .package, body.vscode-light .pollisPackage { color: #a8650d; }
	</style>
</head>
<body>
<div class="container">
	<div class="title-row">
		<h1>${library.title}</h1>
		${voiceButtonsHtml}
	</div>
	<p class="subtitle">${library.intro}</p>
${body}
</div>
<script>
	const vscode = acquireVsCodeApi();
	${voiceButtonsScript}
${script}
</script>
</body>
</html>`;
}

registerAction2(class extends Action2 {
	constructor() {
		super({
			id: SEARCH_WORKFLOW_LIBRARY_COMMAND_ID,
			title: localize2('workflowLibrary.open', "Browse Replications..."),
			category: localize2('replication.category', "Replication"),
			f1: true,
		});
	}
	run(accessor: ServicesAccessor): Promise<void> {
		return openLibraryPage(accessor, WORKFLOWS);
	}
});

registerAction2(class extends Action2 {
	constructor() {
		super({
			id: PUBLISHED_BENCHMARKS_COMMAND_ID,
			title: localize2('publishedBenchmarks.open', "Published Benchmarks"),
			category: localize2('correctness.category', "Correctness Tests"),
			f1: true,
		});
	}
	run(accessor: ServicesAccessor): Promise<void> {
		return openLibraryPage(accessor, PUBLISHED_BENCHMARKS);
	}
});

registerAction2(class extends Action2 {
	constructor() {
		super({
			id: BROWSE_METHODS_COMMAND_ID,
			title: localize2('newMethods.open', "Browse Article Methods"),
			category: localize2('newMethods.category', "Article Methods"),
			f1: true,
		});
	}
	run(accessor: ServicesAccessor): Promise<void> {
		return openLibraryPage(accessor, NEW_METHODS);
	}
});
