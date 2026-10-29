/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { RunOnceScheduler } from '../../../../base/common/async.js';
import { CancellationToken } from '../../../../base/common/cancellation.js';
import { toErrorMessage } from '../../../../base/common/errorMessage.js';
import { DisposableStore } from '../../../../base/common/lifecycle.js';
import { joinPath } from '../../../../base/common/resources.js';
import { URI } from '../../../../base/common/uri.js';
import { localize, localize2 } from '../../../../nls.js';
import { Action2, MenuId, registerAction2 } from '../../../../platform/actions/common/actions.js';
import { Categories } from '../../../../platform/action/common/actionCommonCategories.js';
import { BrowserViewCommandId } from '../../../../platform/browserView/common/browserView.js';
import { ICommandService } from '../../../../platform/commands/common/commands.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { IFileService } from '../../../../platform/files/common/files.js';
import { ServicesAccessor } from '../../../../platform/instantiation/common/instantiation.js';
import { INotificationService } from '../../../../platform/notification/common/notification.js';
import { IProgressService, ProgressLocation } from '../../../../platform/progress/common/progress.js';
import { asText, IRequestService, isSuccess } from '../../../../platform/request/common/request.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
import { IPathService } from '../../../services/path/common/pathService.js';
import { parseToml, TomlValue } from '../../model/browser/common/tomlPanelData.js';
import { WebviewInput } from '../../webviewPanel/browser/webviewEditorInput.js';
import { IWebviewWorkbenchService } from '../../webviewPanel/browser/webviewWorkbenchService.js';
import { LIBRARY_PAGE_HELPERS, LIBRARY_PAGE_STYLE } from './libraryPage.js';
import { vignettesIndex } from './newMethods.js';
import { OPEN_LINK_COMMAND_ID } from '../../monitor/browser/openLink.js';
import { voiceButtonsCss, voiceButtonsHtml, voiceButtonsScript } from '../../model/browser/webviews/webviewScaffold.js';
import { FEWEST_ROWS, rowsChoiceCss, rowsChoiceScript, sortHeadingsCss, sortHeadingsScript, sortHint, stickyHeadCss, stickyHeadScript, storedRows, storeRows } from '../../model/browser/webviews/webviewPager.js';

// Help > Documentation > Package Vignettes, the Package Vignettes page: a vignette belongs to its package, as in R. One list:
// the vignettes of the Pollis registry, in Vignettes.toml at its root, which Package and Publish adds to on
// registration, and those of the Julia packages on this computer, marked Installed and read without an Internet
// connection: installed (~/.julia/packages/NAME/SLUG/vignette/Vignette.toml, which Package and Publish
// (media/methods/package.jl) writes into every package with a vignette) or developed (~/.julia/dev/NAME/vignette).
// A package on this computer shows its own vignette, in place of the registry's. A package carries
// its vignette's LaTeX sources, not a PDF: Pollis compiles the vignette with PollisTeX the first time it is opened
// (the Julia extension's command language-julia.pollisCompileVignette, scripts/terminalserver/compile_vignette.jl),
// from the installed package's vignette/ folder, or from the package's repository on GitHub for one in the registry,
// into ~/.pollis/documents/vignettes/NAME-VERSION.pdf, and opens it in the integrated browser. A vignette published
// before, with a PDF and no sources, opens its PDF.

export const VIGNETTES_COMMAND_ID = 'pollis.documentation.vignettes';

const COMPILE_VIGNETTE_COMMAND_ID = 'language-julia.pollisCompileVignette';

/** A vignette: a table of Vignettes.toml in the registry, or the vignette/Vignette.toml of an installed package. */
interface IVignette {
	readonly package: string;
	readonly title: string;
	readonly method: string;
	readonly version: string;
	readonly author: string;
	readonly description: string;
	readonly citation: string;
	/** A link to read the article. */
	readonly article: string;
	readonly topic: string;
	readonly license: string;
	readonly repository: string;
	/** The main LaTeX file of the vignette, NAME.tex in the package's vignette/ folder. */
	readonly source: string;
	/** The vignette/ folder of an installed package, its URI; empty in the registry. */
	readonly folder: string;
	/** The PDF of a vignette published with one: a link on GitHub in the registry, the file's URI for an installed package. */
	readonly pdf: string;
}

type VignettesMessage =
	| { readonly command: 'ready' | 'refresh' }
	| { readonly command: 'open'; readonly package: string; readonly installed: boolean }
	| { readonly command: 'link'; readonly url: string }
	| { readonly command: 'rows'; readonly rows: number };

/** A vignette from a table of a Vignettes.toml; the PDF as written in it. */
function vignette(name: string, table: TomlValue): IVignette {
	const text = (key: string) => typeof table[key] === 'string' ? table[key] as string : '';
	return {
		package: text('package') || name,
		title: text('title'),
		method: text('method'),
		version: text('version'),
		author: text('author'),
		description: text('description'),
		citation: text('citation'),
		article: text('article'),
		topic: text('topic'),
		license: text('license'),
		repository: text('repository'),
		source: /^[A-Za-z0-9_-]+\.tex$/.test(text('source')) ? text('source') : '',
		folder: '',
		pdf: text('pdf'),
	};
}

function isTable(value: unknown): value is TomlValue {
	return !!value && typeof value === 'object' && !Array.isArray(value);
}

function byTitle(a: IVignette, b: IVignette): number {
	return a.title.localeCompare(b.title);
}

/** The vignettes listed in the registry's Vignettes.toml, those with a package, a title, a repository on GitHub and their sources there, or a PDF. */
function registryVignettes(content: string): IVignette[] {
	return Object.entries(parseToml(content))
		.filter((entry): entry is [string, TomlValue] => isTable(entry[1]))
		.map(([name, table]) => vignette(name, table))
		.filter(entry => entry.title && entry.repository.startsWith('https://github.com/') && (entry.source || entry.pdf.startsWith('https://github.com/')))
		.sort(byTitle);
}

/** Compares versions such as 0.10.1 and 0.9.0 by their numbers. */
function compareVersions(a: string, b: string): number {
	const pa = a.split('.').map(Number);
	const pb = b.split('.').map(Number);
	for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
		const difference = (pa[i] || 0) - (pb[i] || 0);
		if (difference) {
			return difference;
		}
	}
	return 0;
}

/** The folders inside `folder`, none when it does not exist. */
async function subfolders(fileService: IFileService, folder: URI): Promise<URI[]> {
	try {
		return ((await fileService.resolve(folder)).children ?? []).filter(child => child.isDirectory).map(child => child.resource);
	} catch {
		return [];
	}
}

/** The vignette of the package in `root`, when its vignette/Vignette.toml names its source beside it, or a PDF. */
async function packageVignette(fileService: IFileService, root: URI): Promise<IVignette | undefined> {
	try {
		const table = parseToml((await fileService.readFile(joinPath(root, 'vignette', 'Vignette.toml'))).value.toString());
		const entry = vignette('', table);
		const folder = joinPath(root, 'vignette');
		if (!entry.title) {
			return undefined;
		}
		if (entry.source && await fileService.exists(joinPath(folder, entry.source))) {
			return { ...entry, folder: folder.toString(), pdf: '' };
		}
		const pdf = joinPath(folder, entry.pdf);
		return entry.pdf && !entry.pdf.includes('/') && await fileService.exists(pdf) ? { ...entry, pdf: pdf.toString() } : undefined;
	} catch {
		return undefined;
	}
}

/**
 * The vignettes of the packages on this computer: those developed, ~/.julia/dev/NAME, and those installed in the
 * Julia depot, ~/.julia/packages/NAME/SLUG, of a package installed in several versions the newest. A package
 * developed shows its vignette as it is being written, in place of an installed version's.
 */
async function installedVignettes(fileService: IFileService, pathService: IPathService): Promise<IVignette[]> {
	const julia = joinPath(pathService.userHome({ preferLocal: true }), '.julia');
	const developed = (await Promise.all((await subfolders(fileService, joinPath(julia, 'dev'))).map(root => packageVignette(fileService, root))))
		.filter((entry): entry is IVignette => !!entry);
	const installed = await Promise.all((await subfolders(fileService, joinPath(julia, 'packages'))).map(async folder => {
		const entries = await Promise.all((await subfolders(fileService, folder)).map(version => packageVignette(fileService, version)));
		return entries.filter((entry): entry is IVignette => !!entry).sort((a, b) => compareVersions(b.version, a.version))[0];
	}));
	return [
		...developed,
		...installed.filter((entry): entry is IVignette => !!entry && !developed.some(other => other.package === entry.package)),
	].sort(byTitle);
}

/** The open page, so a second request shows it again. */
let openPage: WebviewInput | undefined;

/** Opens the Vignettes page, or shows it again when it is open. */
async function openVignettesPage(accessor: ServicesAccessor): Promise<void> {
	const webviewWorkbenchService = accessor.get(IWebviewWorkbenchService);
	const fileService = accessor.get(IFileService);
	const pathService = accessor.get(IPathService);
	const requestService = accessor.get(IRequestService);
	const configurationService = accessor.get(IConfigurationService);
	const commandService = accessor.get(ICommandService);
	const progressService = accessor.get(IProgressService);
	const notificationService = accessor.get(INotificationService);
	const storageService = accessor.get(IStorageService);

	if (openPage && !openPage.isDisposed()) {
		webviewWorkbenchService.revealWebview(openPage, openPage.group ?? -1, false);
		return;
	}
	const title = localize('vignettes.title', "Package Vignettes");
	const webviewInput = webviewWorkbenchService.openWebview(
		{
			title,
			options: { retainContextWhenHidden: true },
			contentOptions: { allowScripts: true, localResourceRoots: [] },
			extension: undefined,
		},
		'pollis.vignettes',
		title,
		undefined,
		{ group: undefined, preserveFocus: false }
	);
	webviewInput.webview.setHtml(pageHtml(storedRows(storageService, 'vignettes', 40)));
	openPage = webviewInput;

	const disposables = new DisposableStore();
	disposables.add(webviewInput.webview.onDidDispose(() => {
		openPage = undefined;
		disposables.dispose();
	}));

	// The installed vignettes, read again when the page gets the focus back (a package installed since)
	let installed: IVignette[] = [];
	const sendInstalled = async () => {
		installed = await installedVignettes(fileService, pathService);
		webviewInput.webview.postMessage({ command: 'installed', vignettes: installed });
	};
	const refresh = disposables.add(new RunOnceScheduler(() => sendInstalled(), 300));
	disposables.add(webviewInput.webview.onDidFocus(() => refresh.schedule()));

	// The vignettes in the registry, read when the page opens and on Refresh
	let registry: IVignette[] = [];
	const sendRegistry = async () => {
		const { registry: url, url: index } = vignettesIndex(configurationService);
		let error: string | undefined;
		registry = [];
		if (!index) {
			error = localize('vignettes.notGitHub', "The registry {0} is not on GitHub.", url);
		} else {
			try {
				const context = await requestService.request({ type: 'GET', url: index, callSite: 'vignettes.index' }, CancellationToken.None);
				// No Vignettes.toml yet, or no registry yet: nothing published
				if (context.res.statusCode !== 404) {
					if (!isSuccess(context)) {
						throw new Error(localize('vignettes.status', "The server returned {0}.", context.res.statusCode ?? '?'));
					}
					registry = registryVignettes((await asText(context)) ?? '');
				}
			} catch (e) {
				error = toErrorMessage(e);
			}
		}
		webviewInput.webview.postMessage({ command: 'registry', vignettes: registry, registry: url, error });
	};

	// A vignette's PDF: compiled from its sources the first time, then the copy compiled
	const openVignette = async (entry: IVignette) => {
		if (!entry.source) {
			commandService.executeCommand(BrowserViewCommandId.Open, entry.pdf.startsWith('file:') ? URI.parse(entry.pdf).toString(true) : entry.pdf);
			return;
		}
		const pdf = joinPath(pathService.userHome({ preferLocal: true }), '.pollis', 'documents', 'vignettes', `${entry.package}-${entry.version || 'latest'}.pdf`);
		if (!await fileService.exists(pdf)) {
			let answer: { pdf?: string; error?: string } | undefined;
			await progressService.withProgress({ location: ProgressLocation.Window, title: localize('vignettes.compiling', "Compiling the vignette of {0}", `${entry.package}.jl`) }, async () => {
				try {
					answer = await commandService.executeCommand(COMPILE_VIGNETTE_COMMAND_ID, {
						source: entry.folder ? URI.parse(entry.folder).fsPath : entry.repository,
						name: entry.source.replace(/\.tex$/, ''),
						pdf: pdf.fsPath,
					});
				} catch {
					// The Julia extension is disabled, or not activated yet
				}
			});
			if (!answer?.pdf) {
				notificationService.error(answer?.error === 'noJulia'
					? localize('vignettes.needsJulia', "Julia is needed to compile the vignette of {0}, with PollisTeX.", `${entry.package}.jl`)
					: answer?.error && answer.error !== 'failed'
						? localize('vignettes.compileError', "Could not compile the vignette of {0}: {1}", `${entry.package}.jl`, answer.error)
						: localize('vignettes.compileFailed', "Could not compile the vignette of {0}: Julia stopped, or has not started yet.", `${entry.package}.jl`));
				return;
			}
		}
		commandService.executeCommand(BrowserViewCommandId.Open, pdf.toString(true));
	};

	disposables.add(webviewInput.webview.onMessage(async (e: { message: VignettesMessage }) => {
		const message = e.message;
		const known = [...installed, ...registry];
		if (message.command === 'ready' || message.command === 'refresh') {
			sendInstalled();
			sendRegistry();
		} else if (message.command === 'open') {
			const entry = (message.installed ? installed : registry).find(entry => entry.package === message.package);
			if (entry) {
				openVignette(entry);
			}
		} else if (message.command === 'rows') {
			storeRows(storageService, 'vignettes', message.rows);
		} else if (message.command === 'link' && known.some(entry => entry.repository === message.url || entry.article === message.url) && /^https?:\/\//.test(message.url)) {
			commandService.executeCommand(OPEN_LINK_COMMAND_ID, message.url);
		}
	}));
}

/**
 * The page: its texts come from here, the vignettes from the `installed` and `registry` messages. One table, sorted by
 * its headings as the other lists of Pollis, `rows` at a time.
 */
function pageHtml(rows: number): string {
	const text = {
		title: localize('vignettes.title', "Package Vignettes"),
		intro: localize('vignettes.intro', "A vignette is a package's documentation: the article its method follows, how to call it in Julia, and its results printed beside the published ones. Click a title to read it."),
		listIntro: localize('vignettes.listIntro', "The vignettes of the packages in the Pollis registry, and of the packages on this computer, marked Installed: these open without an Internet connection. Pollis compiles a vignette from its LaTeX sources, with PollisTeX, the first time it is opened."),
		search: localize('vignettes.search', "Search vignettes"),
		allTopics: localize('vignettes.allTopics', "All topics"),
		isInstalled: localize('vignettes.isInstalled', "Installed"),
		empty: localize('vignettes.empty', "No vignettes yet."),
		loading: localize('vignettes.loading', "Reading the list of vignettes in the registry..."),
		failed: localize('vignettes.failed', "Could not read the list of vignettes in the registry:"),
		noMatch: localize('vignettes.noMatch', "No vignette matches."),
		vignette: localize('vignettes.vignette', "Vignette"),
		article: localize('vignettes.article', "Article"),
		topic: localize('vignettes.topicHeader', "Topic"),
		package: localize('vignettes.package', "Package"),
		repository: localize('vignettes.repository', "Repository"),
		refresh: localize('vignettes.refresh', "Refresh"),
		by: localize('vignettes.by', "by {0}"),
		license: localize('vignettes.license', "License: {0}"),
		count: localize('vignettes.count', "{0} of {1} vignettes"),
		previous: localize('vignettes.previous', "Previous"),
		next: localize('vignettes.next', "Next"),
		page: localize('vignettes.page', "Page {0} of {1}"),
		sortHint: sortHint(),
	};
	return `<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline';">
	<style>${LIBRARY_PAGE_STYLE}
		${voiceButtonsCss}
		${rowsChoiceCss}
		${stickyHeadCss}
		${sortHeadingsCss}
	[hidden] { display: none !important; }
	.pager { display: flex; justify-content: center; align-items: center; gap: 16px; padding: 12px 8px; font-size: 12px; color: var(--vscode-descriptionForeground); }
	.pager .link { font-size: 12px; }
	.pager .link:disabled { color: var(--vscode-disabledForeground); cursor: default; text-decoration: none; }
	.hint { color: var(--vscode-descriptionForeground); margin: 0 0 8px 0; line-height: 1.4; max-width: 900px; }
	.filters { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; margin: 0 0 8px 0; }
	.filters .count { font-size: 12px; color: var(--vscode-descriptionForeground); }
	.search, .topics { padding: 4px 6px; font: inherit; color: var(--vscode-input-foreground); background: var(--vscode-input-background); border: 1px solid var(--vscode-input-border, var(--vscode-widget-border)); border-radius: 2px; }
	.search { width: 100%; max-width: 420px; }
	.search:focus, .topics:focus { outline: 1px solid var(--vscode-focusBorder); outline-offset: -1px; }
	.topic { width: 12%; }
	.error { color: var(--vscode-errorForeground); }</style>
</head>
<body>
<div class="container">
	<div class="title-row">
		<h1>${text.title}</h1>
		${voiceButtonsHtml}
	</div>
	<p class="subtitle">${text.intro}</p>
	<p class="hint">${text.listIntro} <button class="link" id="refresh">${text.refresh}</button></p>
	<div class="filters stickyBand" id="filters">
		<input class="search" id="search" type="search" placeholder="${text.search}" aria-label="${text.search}">
		<select class="topics" id="topics" aria-label="${text.topic}"><option value="">${text.allTopics}</option></select>
		<span class="count" id="count"></span>
	</div>
	<p class="hint" id="registryNote">${text.loading}</p>
	<p class="hint" id="note" hidden></p>
	<div class="pager" id="pagerTop" hidden></div>
	<table id="table" class="stickyHead" hidden>
		<thead><tr><th class="name sortable" data-sort="title" title="${text.sortHint}">${text.vignette}</th><th class="article sortable" data-sort="citation" title="${text.sortHint}">${text.article}</th><th class="topic sortable" data-sort="topic" title="${text.sortHint}">${text.topic}</th><th class="sortable" data-sort="package" title="${text.sortHint}">${text.package}</th></tr></thead>
		<tbody id="vignettes"></tbody>
	</table>
	<div class="pager" id="pager" hidden></div>
</div>
<script>
	const vscode = acquireVsCodeApi();
	${voiceButtonsScript}
	const TEXT = ${JSON.stringify(text)};
	${LIBRARY_PAGE_HELPERS}
	${rowsChoiceScript()}
	${stickyHeadScript()}
	${sortHeadingsScript()}
	stickBand(document.getElementById('filters'), document.getElementById('table'));

	let installed;
	let registry;
	let rows = ${rows};
	let page = 0;
	let sortColumn = 'title';
	let sortDescending = false;
	const search = document.getElementById('search');
	const topics = document.getElementById('topics');

	function matches(vignette) {
		const query = search.value.trim().toLowerCase();
		const fields = [vignette.title, vignette.method, vignette.description, vignette.citation, vignette.topic, vignette.package, vignette.author, vignette.license];
		return (!topics.value || vignette.topic === topics.value)
			&& (!query || fields.some(field => (field || '').toLowerCase().includes(query)));
	}

	// The topics of both lists, keeping the one chosen
	function fillTopics() {
		const chosen = topics.value;
		const all = [...new Set([...(installed || []), ...(registry && registry.vignettes || [])].map(vignette => vignette.topic).filter(topic => topic))].sort();
		while (topics.options.length > 1) {
			topics.remove(1);
		}
		for (const topic of all) {
			topics.appendChild(new Option(topic, topic));
		}
		topics.value = all.includes(chosen) ? chosen : '';
	}

	// (a) the vignette and its description, (b) the article, (c) the topic, (d) the package, its author, repository and license
	function row(vignette) {
		const row = element('tr');
		const name = cell(row, 'name');
		const title = element('div', 'title', vignette.title);
		title.addEventListener('click', () => vscode.postMessage({ command: 'open', package: vignette.package, installed: vignette.installed }));
		if (vignette.installed) {
			title.appendChild(element('span', 'badge', TEXT.isInstalled));
		}
		name.appendChild(title);
		if (vignette.method && vignette.method !== vignette.title) {
			name.appendChild(element('p', 'description', vignette.method));
		}
		if (vignette.description) {
			name.appendChild(element('p', 'description clamped', vignette.description));
		}
		const article = cell(row, 'article');
		if (vignette.article && vignette.citation) {
			const citation = element('p', 'citation small');
			citation.appendChild(link(vignette.citation, () => vscode.postMessage({ command: 'link', url: vignette.article })));
			article.appendChild(citation);
		} else {
			// A dash when the vignette follows no article
			article.appendChild(element('p', 'citation small', vignette.citation || '-'));
		}
		cell(row, 'topic').appendChild(element('div', 'small', vignette.topic));
		const packageCell = cell(row);
		packageCell.appendChild(element('div', 'file', vignette.package + '.jl' + (vignette.version ? ' ' + vignette.version : '')));
		if (vignette.author) {
			packageCell.appendChild(element('div', 'small', TEXT.by.replace('{0}', vignette.author)));
		}
		if (vignette.license) {
			packageCell.appendChild(element('div', 'small', TEXT.license.replace('{0}', vignette.license)));
		}
		if (vignette.repository) {
			const links = element('div', 'links');
			links.appendChild(link(TEXT.repository, () => vscode.postMessage({ command: 'link', url: vignette.repository })));
			packageCell.appendChild(links);
		}
		return row;
	}

	function format(template, ...values) {
		return template.replace(/\\{(\\d+)\\}/g, (match, index) => String(values[Number(index)]));
	}

	// By the column chosen, from A or reversed; empty cells last; then by title
	function compare(a, b) {
		const x = a[sortColumn] || '', y = b[sortColumn] || '';
		if (!x || !y) {
			return x === y ? a.title.localeCompare(b.title) : x ? -1 : 1;
		}
		const order = x.localeCompare(y);
		return (sortDescending ? -order : order) || a.title.localeCompare(b.title);
	}

	function setSort(column) {
		sortDescending = sortColumn === column ? !sortDescending : false;
		sortColumn = column;
		page = 0;
		showSort();
		render();
	}

	function showSort() {
		for (const header of document.querySelectorAll('th.sortable')) {
			header.dataset.label ??= header.textContent;
			setSortArrow(header, header.dataset.label, header.dataset.sort === sortColumn, sortDescending);
		}
	}

	// The same pager above the vignettes and under them, with the Rows choice while there are more than the fewest rows
	function fillPagers(shown, pages, size) {
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

	// One list: the vignettes on this computer, marked Installed, and those of the registry for the other packages
	function render() {
		const local = installed || [];
		const listed = registry && !registry.error ? registry.vignettes : [];
		const all = [
			...local.map(vignette => ({ ...vignette, installed: true })),
			...listed.filter(vignette => !local.some(other => other.package === vignette.package)).map(vignette => ({ ...vignette, installed: false })),
		];
		const shown = all.filter(matches).sort(compare);
		const size = rowsPerPage(rows, shown.length);
		const pages = Math.max(1, Math.ceil(shown.length / size));
		page = Math.min(page, pages - 1);
		const body = document.getElementById('vignettes');
		body.textContent = '';
		for (const vignette of shown.slice(page * size, (page + 1) * size)) {
			body.appendChild(row(vignette));
		}
		fillPagers(shown.length, pages, size);
		document.getElementById('count').textContent = all.length ? format(TEXT.count, shown.length, all.length) : '';
		document.getElementById('table').hidden = !shown.length;
		const note = document.getElementById('note');
		note.textContent = shown.length ? '' : all.length ? TEXT.noMatch : TEXT.empty;
		note.hidden = !!shown.length || !(installed && registry);
		if (registry) {
			const registryNote = document.getElementById('registryNote');
			registryNote.hidden = !registry.error;
			registryNote.className = 'hint error';
			registryNote.textContent = registry.error ? TEXT.failed + ' ' + registry.error : '';
		}
	}

	search.addEventListener('input', () => { page = 0; render(); });
	topics.addEventListener('change', () => { page = 0; render(); });
	for (const header of document.querySelectorAll('th.sortable')) {
		header.addEventListener('click', () => setSort(header.dataset.sort));
	}
	showSort();
	document.getElementById('refresh').addEventListener('click', () => {
		const note = document.getElementById('registryNote');
		note.hidden = false;
		note.className = 'hint';
		note.textContent = TEXT.loading;
		vscode.postMessage({ command: 'refresh' });
	});

	window.addEventListener('message', event => {
		if (event.data.command === 'installed') {
			installed = event.data.vignettes;
		} else if (event.data.command === 'registry') {
			registry = event.data;
		} else {
			return;
		}
		fillTopics();
		render();
	});
	vscode.postMessage({ command: 'ready' });
</script>
</body>
</html>`;
}

registerAction2(class extends Action2 {
	constructor() {
		super({
			id: VIGNETTES_COMMAND_ID,
			title: {
				...localize2('vignettes.action', "Package Vignettes"),
				mnemonicTitle: localize({ key: 'miVignettes', comment: ['&& denotes a mnemonic'] }, "Package &&Vignettes"),
			},
			category: Categories.Help,
			f1: true,
			// Help > Documentation > Package Vignettes, defined in workbench/browser/actions/helpActions.ts, below a separator after the Drill-down documents
			menu: { id: MenuId.for('MenubarHelpDocumentationMenu'), group: '1_packages', order: 1 },
		});
	}
	run(accessor: ServicesAccessor): Promise<void> {
		return openVignettesPage(accessor);
	}
});
