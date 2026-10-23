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
import { LIBRARY_PAGE_HELPERS, LIBRARY_PAGE_STYLE } from './libraryPage.js';
import { ContentKind, IDownloadedEntry, IPollisContentService } from './pollisContent.js';
import { BROWSE_METHODS_COMMAND_ID, deleteUserMethods, openUserMethod, readMethodSummaries, userMethodsFolder } from './newMethods.js';
import { OPEN_LINK_COMMAND_ID } from '../../monitor/browser/openLink.js';
import { voiceButtonsCss, voiceButtonsHtml, voiceButtonsScript } from '../../model/browser/webviews/webviewScaffold.js';

export const SEARCH_WORKFLOW_LIBRARY_COMMAND_ID = 'chiara.statistics.wfl_sl';
export const PUBLISHED_BENCHMARKS_COMMAND_ID = 'pollis.correctness.publishedBenchmarks';

/** A notebook library shipped with Pollis: one folder per entry, holding its notebook and data files. */
interface INotebookLibrary {
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
	/** Whether the page also lists the user's own methods, above the library (Browse Methods). */
	readonly userMethods?: boolean;
	/** The kind of content the library gets between releases (pollisContent.ts). */
	readonly content?: ContentKind;
}

/** Compose > Replication > Browse Replications: famous analyses replicated from their articles. The folder and content key stay `workflows`, for the copies already made and the content repository. */
const WORKFLOWS: INotebookLibrary = {
	base: 'vs/workbench/contrib/compose/browser/media/workflows',
	userFolder: 'workflows',
	title: localize('workflowLibrary.title', "Replications"),
	intro: localize('workflowLibrary.intro', "Each replication reproduces a published analysis on its public data, printing every published value beside Julia's. Click a name to open your own copy of the notebook, made in {0} the first time.", '<code>~/.pollis/workflows</code>'),
	entry: localize('workflowLibrary.entry', "Replication"),
	empty: localize('workflowLibrary.empty', "There are no replications yet."),
	openFailed: (label, error) => localize('workflowLibrary.openFailed', "Could not open the replication {0}: {1}", label, error),
	content: 'workflows',
};

/** Compose > Methods: methods no Julia package has, each tested on data against published results. */
const NEW_METHODS: INotebookLibrary = {
	base: 'vs/workbench/contrib/compose/browser/media/methods',
	userFolder: 'methods',
	title: localize('newMethods.title', "Methods"),
	intro: localize('newMethods.intro', "Each method is one no Julia package has, written out with its tests: data and the results published for them, printed beside Julia's. Without data and expected results there is no new method. The methods you started and have not published yet come first, In Progress: click a title to go on with it. Then those you published, and the library: click a name to open the page of your own copy of the method, made in {0} the first time.", '<code>~/.pollis/methods</code>'),
	entry: localize('newMethods.entry', "Method"),
	empty: localize('newMethods.empty', "There are no new methods yet."),
	openFailed: (label, error) => localize('newMethods.openFailed', "Could not open the method {0}: {1}", label, error),
	userMethods: true,
};

/** Compose > Correctness Tests: a method's results checked against a published benchmark. */
const PUBLISHED_BENCHMARKS: INotebookLibrary = {
	base: 'vs/workbench/contrib/compose/browser/media/correctness',
	userFolder: 'correctness',
	title: localize('publishedBenchmarks.title', "Published Benchmarks"),
	intro: localize('publishedBenchmarks.intro', "Each benchmark checks Julia's results against published or certified values. Click a name to open your own copy of the notebook, made in {0} the first time.", '<code>~/.pollis/correctness</code>'),
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
	readonly description: string;
	readonly article: IWorkflowMetadata['article'];
	readonly packages: readonly string[];
	/** The datasets by source, e.g. `PollisDatasets` with `pbc`. */
	readonly datasets: readonly { readonly source: string; readonly url?: string; readonly names: readonly string[] }[];
	/** The size of the shipped files. */
	readonly size: string;
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
 * and packages, and its inputs as datasets, by the source each names before a colon. Undefined
 * when the folder has no method.toml.
 */
async function readMethodEntry(fileService: IFileService, folder: URI): Promise<Omit<ILibraryEntry, 'folder' | 'location' | 'size'> | undefined> {
	const tomlFile = joinPath(folder, 'method.toml');
	if (!await fileService.exists(tomlFile)) {
		return undefined;
	}
	const toml = parseToml((await fileService.readFile(tomlFile)).value.toString());
	const text = (value: unknown) => typeof value === 'string' && value ? value : undefined;
	const name = text(toml.name) ?? basename(folder);
	const citation = text(toml.citation);
	const doi = text(toml.doi);
	const datasets = new Map<string, { source: string; names: string[] }>();
	for (const [input, value] of Object.entries(toml.inputs && typeof toml.inputs === 'object' ? toml.inputs : {})) {
		const source = (text((value as TomlValue).source) ?? '').split(':')[0].trim();
		let group = datasets.get(source);
		if (!group) {
			group = { source, names: [] };
			datasets.set(source, group);
		}
		group.names.push(input);
	}
	return {
		file: `src/${name}.jl`,
		title: text(toml.title) ?? name,
		description: text(toml.description) ?? '',
		article: citation ? { citation, doi, url: text(toml.article) } : undefined,
		packages: Array.isArray(toml.packages) ? toml.packages.filter((value): value is string => typeof value === 'string') : [],
		datasets: [...datasets.values()],
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
				entries.push({ ...method, folder: folder.name, location: folder.resource, size: ByteSize.formatSize(await folderSize(fileService, folder.resource)) });
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

		const datasets = new Map<string, { source: string; url?: string; names: string[] }>();
		let download = 0;
		let optionalDownload = 0;
		for (const dataset of metadata.datasets ?? []) {
			let group = datasets.get(dataset.source);
			if (!group) {
				group = { source: dataset.source, url: dataset.url, names: [] };
				datasets.set(dataset.source, group);
			}
			group.names.push(dataset.name);
			if (dataset.optional) {
				optionalDownload += dataset.bytes ?? 0;
			} else {
				download += dataset.bytes ?? 0;
			}
		}
		entries.push({
			folder: folder.name,
			location: folder.resource,
			file: notebook.name,
			title: heading?.startsWith('# ') ? heading.slice(2) : folder.name,
			description: paragraphs[0]?.replace(/\s+/g, ' ') ?? '',
			article: metadata.article,
			packages: packagesOf(content.cells.filter(cell => cell.cell_type === 'code').map(source).join('\n')),
			datasets: [...datasets.values()],
			size: ByteSize.formatSize(await folderSize(fileService, folder.resource)),
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
	| { readonly command: 'openMethod'; readonly id: string }
	| { readonly command: 'deleteMethod'; readonly id: string }
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

	const open = openPages.get(library);
	if (open && !open.isDisposed()) {
		webviewWorkbenchService.revealWebview(open, open.group ?? -1, false);
		return;
	}

	const userFolder = joinPath(await pathService.userHome({ preferLocal: true }), '.pollis', library.userFolder);
	const readEntries = async () => {
		const read = library.content
			? await readLibrary(fileService, library, await contentService.downloaded(library.content), contentService.unseen(library.content))
			: await readLibrary(fileService, library);
		// A user's copy older than the library's notebook: the page offers the new version beside it
		return Promise.all(read.map(async entry => {
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
	if (entries.length === 0 && !library.userMethods) {
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
	disposables.add(webviewInput.webview.onDidDispose(() => {
		openPages.delete(library);
		disposables.dispose();
	}));

	// The user's methods, sent again when their folder changes or the page gets the focus back
	const sendMethods = async () => {
		webviewInput.webview.postMessage({ command: 'methods', methods: await readMethodSummaries(fileService, pathService) });
	};
	if (library.userMethods) {
		const root = userMethodsFolder(pathService);
		await fileService.createFolder(root);
		const refresh = disposables.add(new RunOnceScheduler(() => sendMethods(), 300));
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
			if (library.userMethods) {
				sendMethods();
			}
		} else if (message.command === 'openMethod') {
			instantiationService.invokeFunction(openUserMethod, message.id);
		} else if (message.command === 'deleteMethod' || message.command === 'deleteEmpty') {
			instantiationService.invokeFunction(deleteUserMethods, message.command === 'deleteEmpty' ? 'empty' : message.id).then(sendMethods, error => notificationService.error(toErrorMessage(error)));
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
		article: localize('workflowLibrary.article', "Article"),
		packages: localize('workflowLibrary.packages', "Packages"),
		datasets: localize('workflowLibrary.datasets', "Datasets"),
		size: localize('workflowLibrary.size', "Size"),
		updated: localize('workflowLibrary.updated', "Last Updated"),
		noArticle: localize('workflowLibrary.noArticle', "None"),
		webPage: localize('workflowLibrary.webPage', "Web Page"),
		copyBibtex: localize('workflowLibrary.copyBibtex', "Copy BibTeX"),
		copied: localize('workflowLibrary.copied', "Copied"),
		count: localize('workflowLibrary.count', "{0} files"),
		download: localize('workflowLibrary.download', "+ {0} download"),
		optionalDownload: localize('workflowLibrary.optionalDownload', "+ {0} download if asked"),
		more: localize('workflowLibrary.more', "more"),
		less: localize('workflowLibrary.less', "less"),
		inProgress: localize('newMethods.inProgress', "In Progress"),
		published: localize('newMethods.published', "Published by You"),
		library: localize('newMethods.library.heading', "Library"),
		noMethods: localize('newMethods.yours.none', "None: Compose > Under Construction... starts one."),
		tables: localize('newMethods.yours.tables', "Tables"),
		tableCount: localize('newMethods.yours.tableCount', "{0} input, {1} target"),
		delete: localize('newMethods.yours.delete', "Delete"),
		deleteEmpty: localize('newMethods.yours.deleteEmpty', "Delete Empty Methods ({0})"),
		new: localize('workflowLibrary.new', "New"),
		updatedBadge: localize('workflowLibrary.updatedBadge', "Updated"),
		copyOutdated: localize('workflowLibrary.copyOutdated', "Your copy is older than this version."),
		openUpdated: localize('workflowLibrary.openUpdated', "Open Updated Version"),
	};
	const userMethods = library.userMethods ? `
	<h2>${text.inProgress}</h2>
	<p class="small" id="noMethods" hidden>${text.noMethods}</p>
	<table id="methodsTable" hidden>
		<thead><tr><th>${library.entry}</th><th>${text.article}</th><th>${text.tables}</th><th></th></tr></thead>
		<tbody id="methods"></tbody>
	</table>
	<p><button class="link small" id="deleteEmpty" hidden></button></p>
	<div id="publishedMethods" hidden>
		<h2>${text.published}</h2>
		<table>
			<thead><tr><th>${library.entry}</th><th>${text.article}</th><th>${text.tables}</th><th></th></tr></thead>
			<tbody id="published"></tbody>
		</table>
	</div>
	<h2>${text.library}</h2>` : '';
	return `<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline';">
	<style>
		${voiceButtonsCss}
${LIBRARY_PAGE_STYLE}
	h2 { font-size: 16px; font-weight: 600; margin: 20px 0 6px 0; }
	</style>
</head>
<body>
<div class="container">
	<div class="title-row">
		<h1>${library.title}</h1>
		${voiceButtonsHtml}
	</div>
	<p class="subtitle">${library.intro}</p>
${userMethods}
	<table>
		<thead><tr>
			<th>${text.entry}</th><th>${text.article}</th><th>${text.packages}</th><th>${text.datasets}</th><th>${text.size}</th><th>${text.updated}</th>
		</tr></thead>
		<tbody id="entries"></tbody>
	</table>
</div>
<script>
	const vscode = acquireVsCodeApi();
	${voiceButtonsScript}
	const TEXT = ${JSON.stringify(text)};
	/** A source with more datasets than this shows their count, and their names on request. */
	const LISTED = 4;
	const body = document.getElementById('entries');

${LIBRARY_PAGE_HELPERS}

	function nameCell(row, entry) {
		const td = cell(row, 'name');
		const title = element('div', 'title', entry.title);
		title.addEventListener('click', () => vscode.postMessage({ command: 'open', folder: entry.folder }));
		if (entry.status) {
			title.appendChild(element('span', 'badge', entry.status === 'new' ? TEXT.new : TEXT.updatedBadge));
		}
		td.appendChild(title);
		td.appendChild(element('div', 'file', entry.file));
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
		for (const group of entry.datasets) {
			const line = element('div', 'source');
			const source = group.url
				? link(group.source, () => vscode.postMessage({ command: 'link', url: group.url }))
				: element('span', '', group.source);
			source.classList.add('source-name');
			line.appendChild(source);
			line.appendChild(document.createTextNode(': '));
			const names = element('span', '', group.names.join(', '));
			if (group.names.length > LISTED) {
				names.hidden = true;
				line.appendChild(link(TEXT.count.replace('{0}', group.names.length), () => { names.hidden = !names.hidden; }));
				line.appendChild(document.createTextNode(' '));
			}
			line.appendChild(names);
			td.appendChild(line);
		}
	}

	function render(entries) {
		body.textContent = '';
		for (const entry of entries) {
			const row = element('tr');
			nameCell(row, entry);
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

	// The methods the user started: those in progress first, then those published
	function renderMethods(methods) {
		const inProgress = methods.filter(method => method.inProgress);
		const published = methods.filter(method => !method.inProgress);
		document.getElementById('noMethods').hidden = inProgress.length > 0;
		document.getElementById('methodsTable').hidden = inProgress.length === 0;
		document.getElementById('publishedMethods').hidden = published.length === 0;
		renderMethodRows(document.getElementById('methods'), inProgress);
		renderMethodRows(document.getElementById('published'), published);
		const empty = methods.filter(method => method.empty).length;
		const deleteEmpty = document.getElementById('deleteEmpty');
		deleteEmpty.hidden = empty === 0;
		deleteEmpty.textContent = TEXT.deleteEmpty.replace('{0}', empty);
	}
	function renderMethodRows(container, methods) {
		container.textContent = '';
		for (const method of methods) {
			const row = element('tr');
			const name = cell(row, 'name');
			const title = element('div', 'title', method.title);
			title.addEventListener('click', () => vscode.postMessage({ command: 'openMethod', id: method.id }));
			name.appendChild(title);
			name.appendChild(element('div', 'file', method.name));
			cell(row, 'article').appendChild(element('p', 'citation small', method.citation || TEXT.noArticle));
			cell(row, 'nowrap').textContent = TEXT.tableCount.replace('{0}', method.inputs).replace('{1}', method.targets);
			cell(row, 'nowrap').appendChild(link(TEXT.delete, () => vscode.postMessage({ command: 'deleteMethod', id: method.id })));
			container.appendChild(row);
		}
	}
	if (document.getElementById('deleteEmpty')) {
		document.getElementById('deleteEmpty').addEventListener('click', () => vscode.postMessage({ command: 'deleteEmpty' }));
	}

	window.addEventListener('message', event => {
		if (event.data.command === 'entries') {
			render(event.data.entries);
		} else if (event.data.command === 'methods') {
			renderMethods(event.data.methods);
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
			title: localize2('newMethods.open', "Browse Methods"),
			category: localize2('newMethods.category', "Methods"),
			f1: true,
		});
	}
	run(accessor: ServicesAccessor): Promise<void> {
		return openLibraryPage(accessor, NEW_METHODS);
	}
});
