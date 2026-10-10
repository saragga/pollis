/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { toErrorMessage } from '../../../../base/common/errorMessage.js';
import { DisposableStore } from '../../../../base/common/lifecycle.js';
import { AppResourcePath, FileAccess } from '../../../../base/common/network.js';
import { language } from '../../../../base/common/platform.js';
import { joinPath } from '../../../../base/common/resources.js';
import { URI } from '../../../../base/common/uri.js';
import { localize, localize2 } from '../../../../nls.js';
import { Action2, registerAction2 } from '../../../../platform/actions/common/actions.js';
import { IClipboardService } from '../../../../platform/clipboard/common/clipboardService.js';
import { ByteSize, IFileService } from '../../../../platform/files/common/files.js';
import { ServicesAccessor } from '../../../../platform/instantiation/common/instantiation.js';
import { INotificationService } from '../../../../platform/notification/common/notification.js';
import { IOpenerService } from '../../../../platform/opener/common/opener.js';
import { IEditorService } from '../../../services/editor/common/editorService.js';
import { IPathService } from '../../../services/path/common/pathService.js';
import { WebviewInput } from '../../webviewPanel/browser/webviewEditorInput.js';
import { IWebviewWorkbenchService } from '../../webviewPanel/browser/webviewWorkbenchService.js';

export const SEARCH_WORKFLOW_LIBRARY_COMMAND_ID = 'chiara.statistics.wfl_sl';
export const PUBLISHED_BENCHMARKS_COMMAND_ID = 'pollis.correctness.publishedBenchmarks';
export const NEW_METHODS_COMMAND_ID = 'pollis.compose.createMethod';

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
}

/** Compose > Workflows: famous analyses replicated from their articles. */
const WORKFLOWS: INotebookLibrary = {
	base: 'vs/workbench/contrib/compose/browser/media/workflows',
	userFolder: 'workflows',
	title: localize('workflowLibrary.title', "Workflow Library"),
	intro: localize('workflowLibrary.intro', "Each workflow replicates a published analysis on its public data, printing every published value beside Julia's. Click a name to open your own copy of the notebook, made in ~/.pollis/workflows the first time."),
	entry: localize('workflowLibrary.entry', "Workflow"),
	empty: localize('workflowLibrary.empty', "The workflow library is empty."),
	openFailed: (label, error) => localize('workflowLibrary.openFailed', "Could not open the workflow {0}: {1}", label, error),
};

/** Compose > New Methods: methods no Julia package has, each tested on data against published results. */
const NEW_METHODS: INotebookLibrary = {
	base: 'vs/workbench/contrib/compose/browser/media/methods',
	userFolder: 'methods',
	title: localize('newMethods.title', "New Methods"),
	intro: localize('newMethods.intro', "Each method is one no Julia package has, written out with its tests: data and the results published for them, printed beside Julia's. Without data and expected results there is no new method. Click a name to open your own copy of the notebook, made in ~/.pollis/methods the first time."),
	entry: localize('newMethods.entry', "Method"),
	empty: localize('newMethods.empty', "There are no new methods yet."),
	openFailed: (label, error) => localize('newMethods.openFailed', "Could not open the method {0}: {1}", label, error),
};

/** Compose > Correctness Tests: a method's results checked against a published benchmark. */
const PUBLISHED_BENCHMARKS: INotebookLibrary = {
	base: 'vs/workbench/contrib/compose/browser/media/correctness',
	userFolder: 'correctness',
	title: localize('publishedBenchmarks.title', "Published Benchmarks"),
	intro: localize('publishedBenchmarks.intro', "Each benchmark checks Julia's results against published or certified values. Click a name to open your own copy of the notebook, made in ~/.pollis/correctness the first time."),
	entry: localize('publishedBenchmarks.entry', "Benchmark"),
	empty: localize('publishedBenchmarks.empty', "There are no published benchmarks yet."),
	openFailed: (label, error) => localize('publishedBenchmarks.openFailed', "Could not open the benchmark {0}: {1}", label, error),
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
	/** The notebook's file name, e.g. `garch.ipynb`. */
	readonly notebook: string;
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

/**
 * Reads a library: each folder with a notebook is an entry, its title the notebook's first `# `
 * heading, its description the paragraph after it, its packages those of its `Pollis.packages`
 * cells, and its article, datasets and date the `pollis.workflow` block of its metadata.
 */
async function readLibrary(fileService: IFileService, library: INotebookLibrary): Promise<ILibraryEntry[]> {
	const root = FileAccess.asFileUri(library.base);
	if (!await fileService.exists(root)) {
		return [];
	}
	const entries: ILibraryEntry[] = [];
	for (const folder of (await fileService.resolve(root)).children ?? []) {
		if (!folder.isDirectory) {
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
			notebook: notebook.name,
			title: heading?.startsWith('# ') ? heading.slice(2) : folder.name,
			description: paragraphs[0]?.replace(/\s+/g, ' ') ?? '',
			article: metadata.article,
			packages: packagesOf(content.cells.filter(cell => cell.cell_type === 'code').map(source).join('\n')),
			datasets: [...datasets.values()],
			size: ByteSize.formatSize(files.reduce((total, file) => total + (file.isDirectory ? 0 : file.size), 0)),
			download: download > 0 ? ByteSize.formatSize(download) : undefined,
			optionalDownload: optionalDownload > 0 ? ByteSize.formatSize(optionalDownload) : undefined,
			updated: formatDate(metadata.updated),
		});
	}
	return entries.sort((a, b) => a.title.localeCompare(b.title));
}

type LibraryMessage =
	| { readonly command: 'ready' }
	| { readonly command: 'open'; readonly folder: string }
	| { readonly command: 'copyBibtex'; readonly folder: string }
	| { readonly command: 'link'; readonly url: string };

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
	const openerService = accessor.get(IOpenerService);

	const open = openPages.get(library);
	if (open && !open.isDisposed()) {
		webviewWorkbenchService.revealWebview(open, open.group ?? -1, false);
		return;
	}

	const entries = await readLibrary(fileService, library);
	if (entries.length === 0) {
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

	const openEntry = async (entry: ILibraryEntry) => {
		try {
			const copy = joinPath(await pathService.userHome({ preferLocal: true }), '.pollis', library.userFolder, entry.folder);
			if (!await fileService.exists(copy)) {
				await fileService.copy(entry.location, copy);
			}
			await editorService.openEditor({ resource: joinPath(copy, entry.notebook) });
		} catch (error) {
			notificationService.error(library.openFailed(entry.title, toErrorMessage(error)));
		}
	};

	disposables.add(webviewInput.webview.onMessage((e: { message: LibraryMessage }) => {
		const message = e.message;
		const entry = message.command === 'open' || message.command === 'copyBibtex' ? entries.find(candidate => candidate.folder === message.folder) : undefined;
		if (message.command === 'ready') {
			webviewInput.webview.postMessage({ command: 'entries', entries: entries.map(({ location, ...rest }) => rest) });
		} else if (message.command === 'open' && entry) {
			openEntry(entry);
		} else if (message.command === 'copyBibtex' && entry?.article?.bibtex) {
			clipboardService.writeText(entry.article.bibtex);
		} else if (message.command === 'link' && /^https:\/\//.test(message.url)) {
			openerService.open(URI.parse(message.url), { openExternal: true });
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
	};
	return `<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline';">
	<style>
		* { box-sizing: border-box; }
		body { font-family: var(--vscode-font-family); font-size: 13px; margin: 0; color: var(--vscode-foreground); background-color: var(--vscode-editor-background); }
		.container { max-width: 1400px; margin: 0 auto; padding: 24px; }
		h1 { font-size: 32px; font-weight: 300; margin: 0 0 4px 0; line-height: 1.2; }
		.subtitle { font-size: 14px; color: var(--vscode-descriptionForeground); margin: 0 0 16px 0; line-height: 1.4; max-width: 900px; }
		table { width: 100%; border-collapse: collapse; }
		th { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; color: var(--vscode-descriptionForeground); text-align: left; padding: 6px 8px; border-bottom: 1px solid var(--vscode-widget-border); }
		td { vertical-align: top; padding: 10px 8px; border-bottom: 1px solid var(--vscode-widget-border); line-height: 1.4; }
		tr:hover td { background: var(--vscode-list-hoverBackground); }
		.name { width: 34%; }
		.title { font-size: 14px; font-weight: 600; color: var(--vscode-textLink-foreground); cursor: pointer; }
		.title:hover { text-decoration: underline; }
		.file { font-family: var(--vscode-editor-font-family); font-size: 12px; color: var(--vscode-descriptionForeground); }
		.description { margin: 4px 0 0 0; color: var(--vscode-descriptionForeground); }
		.description.clamped { display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
		.article { width: 22%; }
		.citation { margin: 0 0 4px 0; }
		.small { font-size: 12px; color: var(--vscode-descriptionForeground); }
		.nowrap { white-space: nowrap; }
		.link { color: var(--vscode-textLink-foreground); cursor: pointer; background: none; border: none; padding: 0; font: inherit; }
		.link:hover { text-decoration: underline; }
		.links { display: flex; flex-wrap: wrap; gap: 12px; font-size: 12px; }
		.package { display: inline-block; font-size: 12px; border: 1px solid var(--vscode-widget-border); border-radius: 2px; padding: 0 4px; margin: 0 4px 4px 0; }
		.source { margin: 0 0 4px 0; }
		.source-name { font-weight: 600; }
	</style>
</head>
<body>
<div class="container">
	<h1>${library.title}</h1>
	<p class="subtitle">${library.intro}</p>
	<table>
		<thead><tr>
			<th>${text.entry}</th><th>${text.article}</th><th>${text.packages}</th><th>${text.datasets}</th><th>${text.size}</th><th>${text.updated}</th>
		</tr></thead>
		<tbody id="entries"></tbody>
	</table>
</div>
<script>
	const vscode = acquireVsCodeApi();
	const TEXT = ${JSON.stringify(text)};
	/** A source with more datasets than this shows their count, and their names on request. */
	const LISTED = 4;
	const body = document.getElementById('entries');

	function element(tag, className, content) {
		const node = document.createElement(tag);
		if (className) { node.className = className; }
		if (content) { node.textContent = content; }
		return node;
	}

	function link(label, onClick) {
		const button = element('button', 'link', label);
		button.addEventListener('click', onClick);
		return button;
	}

	function cell(row, className) {
		const td = element('td', className);
		row.appendChild(td);
		return td;
	}

	function nameCell(row, entry) {
		const td = cell(row, 'name');
		const title = element('div', 'title', entry.title);
		title.addEventListener('click', () => vscode.postMessage({ command: 'open', folder: entry.folder }));
		td.appendChild(title);
		td.appendChild(element('div', 'file', entry.notebook));
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

	window.addEventListener('message', event => {
		if (event.data.command === 'entries') {
			render(event.data.entries);
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
			title: localize2('workflowLibrary.open', "Library"),
			category: localize2('workflows.category', "Workflows"),
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
			id: NEW_METHODS_COMMAND_ID,
			title: localize2('newMethods.open', "New Methods"),
			category: localize2('compose.category', "Compose"),
			f1: true,
		});
	}
	run(accessor: ServicesAccessor): Promise<void> {
		return openLibraryPage(accessor, NEW_METHODS);
	}
});
