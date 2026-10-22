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
import { asText, IRequestService, isSuccess } from '../../../../platform/request/common/request.js';
import { IPathService } from '../../../services/path/common/pathService.js';
import { parseToml, TomlValue } from '../../model/browser/common/tomlPanelData.js';
import { WebviewInput } from '../../webviewPanel/browser/webviewEditorInput.js';
import { IWebviewWorkbenchService } from '../../webviewPanel/browser/webviewWorkbenchService.js';
import { LIBRARY_PAGE_HELPERS, LIBRARY_PAGE_STYLE } from './libraryPage.js';
import { vignettesIndex } from './newMethods.js';
import { OPEN_LINK_COMMAND_ID } from '../../monitor/browser/openLink.js';

// Help > Documentation > Vignettes: a vignette belongs to its package, as in R. Installed: the vignettes of the
// Julia packages installed on this computer (~/.julia/packages/NAME/SLUG/vignette/Vignette.toml, which Package and
// Publish (media/methods/package.jl) writes into every package with a vignette), read without an Internet
// connection, as the packages' documentation. In the Registry: the list in Vignettes.toml at the root of the Pollis
// registry, which Package and Publish adds to on registration, to choose which packages to install. A vignette
// opens in the integrated browser.

export const VIGNETTES_COMMAND_ID = 'pollis.documentation.vignettes';

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
	/** The PDF: a link on GitHub in the registry, the file's URI for an installed package. */
	readonly pdf: string;
}

type VignettesMessage =
	| { readonly command: 'ready' | 'refresh' }
	| { readonly command: 'open'; readonly pdf: string }
	| { readonly command: 'link'; readonly url: string };

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
		pdf: text('pdf'),
	};
}

function isTable(value: unknown): value is TomlValue {
	return !!value && typeof value === 'object' && !Array.isArray(value);
}

function byTitle(a: IVignette, b: IVignette): number {
	return a.title.localeCompare(b.title);
}

/** The vignettes listed in the registry's Vignettes.toml, those with a package, a title and links on GitHub. */
function registryVignettes(content: string): IVignette[] {
	return Object.entries(parseToml(content))
		.filter((entry): entry is [string, TomlValue] => isTable(entry[1]))
		.map(([name, table]) => vignette(name, table))
		.filter(entry => entry.title && entry.pdf.startsWith('https://github.com/') && entry.repository.startsWith('https://github.com/'))
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

/**
 * The vignettes of the packages installed in the Julia depot, ~/.julia/packages/NAME/SLUG: those whose
 * vignette/Vignette.toml names a PDF beside it. Of a package installed in several versions, the newest.
 */
async function installedVignettes(fileService: IFileService, pathService: IPathService): Promise<IVignette[]> {
	const packages = joinPath(pathService.userHome({ preferLocal: true }), '.julia', 'packages');
	let names: URI[];
	try {
		names = ((await fileService.resolve(packages)).children ?? []).filter(child => child.isDirectory).map(child => child.resource);
	} catch {
		return [];
	}
	const found = await Promise.all(names.map(async folder => {
		let versions: URI[];
		try {
			versions = ((await fileService.resolve(folder)).children ?? []).filter(child => child.isDirectory).map(child => child.resource);
		} catch {
			return undefined;
		}
		const entries = await Promise.all(versions.map(async version => {
			try {
				const table = parseToml((await fileService.readFile(joinPath(version, 'vignette', 'Vignette.toml'))).value.toString());
				const entry = vignette('', table);
				const pdf = joinPath(version, 'vignette', entry.pdf);
				return entry.title && entry.pdf && !entry.pdf.includes('/') && await fileService.exists(pdf) ? { ...entry, pdf: pdf.toString() } : undefined;
			} catch {
				return undefined;
			}
		}));
		return entries.filter((entry): entry is IVignette => !!entry).sort((a, b) => compareVersions(b.version, a.version))[0];
	}));
	return found.filter((entry): entry is IVignette => !!entry).sort(byTitle);
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

	if (openPage && !openPage.isDisposed()) {
		webviewWorkbenchService.revealWebview(openPage, openPage.group ?? -1, false);
		return;
	}
	const title = localize('vignettes.title', "Vignettes");
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
	webviewInput.webview.setHtml(pageHtml());
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

	disposables.add(webviewInput.webview.onMessage(async (e: { message: VignettesMessage }) => {
		const message = e.message;
		const known = [...installed, ...registry];
		if (message.command === 'ready' || message.command === 'refresh') {
			sendInstalled();
			sendRegistry();
		} else if (message.command === 'open' && known.some(entry => entry.pdf === message.pdf)) {
			commandService.executeCommand(BrowserViewCommandId.Open, message.pdf.startsWith('file:') ? URI.parse(message.pdf).toString(true) : message.pdf);
		} else if (message.command === 'link' && known.some(entry => entry.repository === message.url || entry.article === message.url) && /^https?:\/\//.test(message.url)) {
			commandService.executeCommand(OPEN_LINK_COMMAND_ID, message.url);
		}
	}));
}

/** The page: its texts come from here, the vignettes from the `installed` and `registry` messages. */
function pageHtml(): string {
	const text = {
		title: localize('vignettes.title', "Vignettes"),
		intro: localize('vignettes.intro', "A vignette is a package's documentation: the article its method follows, how to call it in Julia, and its results printed beside the published ones. Click a title to read it."),
		search: localize('vignettes.search', "Search vignettes"),
		allTopics: localize('vignettes.allTopics', "All topics"),
		installed: localize('vignettes.installed', "Installed"),
		installedIntro: localize('vignettes.installedIntro', "The vignettes of the Julia packages installed on this computer. They open without an Internet connection."),
		installedEmpty: localize('vignettes.installedEmpty', "No installed package has a vignette yet. Install a package from the registry below and its vignette appears here."),
		registry: localize('vignettes.registry', "In the Registry"),
		registryIntro: localize('vignettes.registryIntro', "The vignettes of the packages in the Pollis registry, to choose which packages to install. Reading this list needs an Internet connection."),
		registryEmpty: localize('vignettes.registryEmpty', "No vignettes in the registry yet."),
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
		isInstalled: localize('vignettes.isInstalled', "Installed"),
	};
	return `<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline';">
	<style>${LIBRARY_PAGE_STYLE}
	h2 { font-size: 16px; font-weight: 600; margin: 28px 0 4px 0; }
	.hint { color: var(--vscode-descriptionForeground); margin: 0 0 8px 0; line-height: 1.4; max-width: 900px; }
	.filters { display: flex; flex-wrap: wrap; gap: 8px; margin: 0 0 8px 0; }
	.search, .topics { padding: 4px 6px; font: inherit; color: var(--vscode-input-foreground); background: var(--vscode-input-background); border: 1px solid var(--vscode-input-border, var(--vscode-widget-border)); border-radius: 2px; }
	.search { width: 100%; max-width: 420px; }
	.search:focus, .topics:focus { outline: 1px solid var(--vscode-focusBorder); outline-offset: -1px; }
	.topic { width: 12%; }
	.error { color: var(--vscode-errorForeground); }</style>
</head>
<body>
<div class="container">
	<h1>${text.title}</h1>
	<p class="subtitle">${text.intro}</p>
	<div class="filters">
		<input class="search" id="search" type="search" placeholder="${text.search}" aria-label="${text.search}">
		<select class="topics" id="topics" aria-label="${text.topic}"><option value="">${text.allTopics}</option></select>
	</div>
	<h2>${text.installed}</h2>
	<p class="hint">${text.installedIntro}</p>
	<p class="hint" id="installedNote" hidden></p>
	<table id="installedTable" hidden>
		<thead><tr><th class="name">${text.vignette}</th><th class="article">${text.article}</th><th class="topic">${text.topic}</th><th>${text.package}</th></tr></thead>
		<tbody id="installed"></tbody>
	</table>
	<h2>${text.registry}</h2>
	<p class="hint">${text.registryIntro} <button class="link" id="refresh">${text.refresh}</button></p>
	<p class="hint" id="registryNote">${text.loading}</p>
	<table id="registryTable" hidden>
		<thead><tr><th class="name">${text.vignette}</th><th class="article">${text.article}</th><th class="topic">${text.topic}</th><th>${text.package}</th></tr></thead>
		<tbody id="registry"></tbody>
	</table>
</div>
<script>
	const vscode = acquireVsCodeApi();
	const TEXT = ${JSON.stringify(text)};
	${LIBRARY_PAGE_HELPERS}

	let installed;
	let registry;
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

	// A table of vignettes, or a note when there are none or none matches
	function fill(id, vignettes, empty) {
		const shown = vignettes.filter(matches);
		const body = document.getElementById(id);
		body.textContent = '';
		for (const vignette of shown) {
			body.appendChild(row(vignette, id === 'registry'));
		}
		document.getElementById(id + 'Table').hidden = !shown.length;
		const note = document.getElementById(id + 'Note');
		note.className = 'hint';
		note.textContent = shown.length ? '' : vignettes.length ? TEXT.noMatch : empty;
		note.hidden = !!shown.length;
	}

	// (a) the vignette and its description, (b) the article, (c) the topic, (d) the package, its author, repository and license
	function row(vignette, inRegistry) {
		const row = element('tr');
		const name = cell(row, 'name');
		const title = element('div', 'title', vignette.title);
		title.addEventListener('click', () => vscode.postMessage({ command: 'open', pdf: vignette.pdf }));
		if (inRegistry && installed && installed.some(other => other.package === vignette.package)) {
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
			article.appendChild(element('p', 'citation small', vignette.citation));
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

	function render() {
		if (installed) {
			fill('installed', installed, TEXT.installedEmpty);
		}
		if (registry) {
			if (registry.error) {
				document.getElementById('registryTable').hidden = true;
				const note = document.getElementById('registryNote');
				note.hidden = false;
				note.className = 'hint error';
				note.textContent = TEXT.failed + ' ' + registry.error;
			} else {
				fill('registry', registry.vignettes, TEXT.registryEmpty);
			}
		}
	}

	search.addEventListener('input', render);
	topics.addEventListener('change', render);
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
				...localize2('vignettes.action', "Vignettes"),
				mnemonicTitle: localize({ key: 'miVignettes', comment: ['&& denotes a mnemonic'] }, "&&Vignettes"),
			},
			category: Categories.Help,
			f1: true,
			// Help > Documentation, defined in workbench/browser/actions/helpActions.ts, after A Tour of Pollis and The Pollis Guide
			menu: { id: MenuId.for('MenubarHelpDocumentationMenu'), group: '0_pollis', order: 3 },
		});
	}
	run(accessor: ServicesAccessor): Promise<void> {
		return openVignettesPage(accessor);
	}
});
