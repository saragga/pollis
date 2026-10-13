/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { RunOnceScheduler } from '../../../../base/common/async.js';
import { CancellationToken } from '../../../../base/common/cancellation.js';
import { toErrorMessage } from '../../../../base/common/errorMessage.js';
import { DisposableStore } from '../../../../base/common/lifecycle.js';
import { AppResourcePath, FileAccess } from '../../../../base/common/network.js';
import { URI } from '../../../../base/common/uri.js';
import { localize, localize2 } from '../../../../nls.js';
import { Action2, MenuId, registerAction2 } from '../../../../platform/actions/common/actions.js';
import { Categories } from '../../../../platform/action/common/actionCommonCategories.js';
import { BrowserViewCommandId } from '../../../../platform/browserView/common/browserView.js';
import { ICommandService } from '../../../../platform/commands/common/commands.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { IFileService } from '../../../../platform/files/common/files.js';
import { IInstantiationService, ServicesAccessor } from '../../../../platform/instantiation/common/instantiation.js';
import { IOpenerService } from '../../../../platform/opener/common/opener.js';
import { asText, IRequestService, isSuccess } from '../../../../platform/request/common/request.js';
import { IPathService } from '../../../services/path/common/pathService.js';
import { parseToml, TomlValue } from '../../model/browser/common/tomlPanelData.js';
import { WebviewInput } from '../../webviewPanel/browser/webviewEditorInput.js';
import { IWebviewWorkbenchService } from '../../webviewPanel/browser/webviewWorkbenchService.js';
import { LIBRARY_PAGE_HELPERS, LIBRARY_PAGE_STYLE } from './libraryPage.js';
import { BROWSE_METHODS_COMMAND_ID, openUserMethod, readMethodSummaries, userMethodsFolder, vignettesIndex } from './newMethods.js';

// Help > Documentation > Vignettes: the vignettes of the methods, as R's Help > Vignettes lists those of the
// installed packages. In Pollis: the vignettes of the methods of the New Methods library, shipped beside their
// notebooks (media/methods/NAME/vignette/NAME.pdf). On This Computer: the user's methods with a vignette (vignette/NAME.pdf in the method
// folder). Published: the list in Vignettes.toml at the root of the Pollis registry, an entry for each
// registered package with a vignette, which Package and Publish (media/methods/package.jl) adds on
// registration. A vignette opens in the integrated browser.

export const VIGNETTES_COMMAND_ID = 'pollis.documentation.vignettes';

/** A vignette of a method of the New Methods library, by the method's folder in media/methods. */
interface ILibraryVignette {
	readonly id: string;
	readonly topic: string;
	readonly title: string;
	readonly citation: string;
}

const LIBRARY_VIGNETTES: readonly ILibraryVignette[] = [
	{ id: 'ErrorComponents', topic: localize('vignettes.topic.panel', "Panel Econometrics"), title: 'WALHUS, AMEMIYA, Swamy-Arora and nested error components', citation: 'Baltagi (2005), Econometric Analysis of Panel Data' },
	{ id: 'PeriodicGARCH', topic: localize('vignettes.topic.volatility', "Volatility"), title: 'Periodic GARCH: volatility with a calendar dummy', citation: 'Bollerslev and Ghysels (1996), Journal of Business & Economic Statistics' },
	{ id: 'BreslowCox', topic: localize('vignettes.topic.survival', "Survival Analysis"), title: 'The Cox model with Breslow\'s ties, and its predicted survival', citation: 'Dickson, Grambsch, Fleming, Fisher and Langworthy (1989), Hepatology' },
	{ id: 'GLMExtras', topic: localize('vignettes.topic.glm', "GLM Inference"), title: 'Parametric bootstrap and delta-beta influence for binomial GLMs', citation: 'Dalal, Fowlkes and Hoadley (1989), Journal of the American Statistical Association' },
	{ id: 'ForestOOB', topic: localize('vignettes.topic.forests', "Random Forests"), title: 'Out-of-bag error and variable importance for random forests', citation: 'Breiman (2001), Machine Learning' },
	{ id: 'ArcFS', topic: localize('vignettes.topic.boosting', "Boosting"), title: 'arc-fs: adaptive resampling with pruned trees', citation: 'Breiman (1998), The Annals of Statistics; Breiman (2001), Machine Learning' },
];

/** A published vignette, a table of Vignettes.toml. */
interface IPublishedVignette {
	readonly package: string;
	readonly title: string;
	readonly method: string;
	readonly version: string;
	readonly author: string;
	readonly description: string;
	readonly citation: string;
	readonly repository: string;
	readonly pdf: string;
}

type VignettesMessage =
	| { readonly command: 'ready' | 'refresh' | 'browseMethods' }
	| { readonly command: 'openLibrary'; readonly id: string }
	| { readonly command: 'openLocal'; readonly id: string }
	| { readonly command: 'openMethod'; readonly id: string }
	| { readonly command: 'openPublished'; readonly pdf: string }
	| { readonly command: 'repository'; readonly url: string };

/** The vignettes listed in a Vignettes.toml, those with a package, a title and links on GitHub. */
function publishedVignettes(content: string): IPublishedVignette[] {
	const text = (table: TomlValue, key: string) => typeof table[key] === 'string' ? table[key] as string : '';
	const vignettes: IPublishedVignette[] = [];
	for (const [name, value] of Object.entries(parseToml(content))) {
		if (!value || typeof value !== 'object' || Array.isArray(value)) {
			continue;
		}
		const table = value as TomlValue;
		const vignette = {
			package: text(table, 'package') || name,
			title: text(table, 'title'),
			method: text(table, 'method'),
			version: text(table, 'version'),
			author: text(table, 'author'),
			description: text(table, 'description'),
			citation: text(table, 'citation'),
			repository: text(table, 'repository'),
			pdf: text(table, 'pdf'),
		};
		if (vignette.title && vignette.pdf.startsWith('https://github.com/') && vignette.repository.startsWith('https://github.com/')) {
			vignettes.push(vignette);
		}
	}
	return vignettes.sort((a, b) => a.title.localeCompare(b.title));
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
	const openerService = accessor.get(IOpenerService);
	const instantiationService = accessor.get(IInstantiationService);

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

	// The user's vignettes, sent again when a method is added or removed, or the page gets the focus back (a new PDF)
	let localPdfs = new Set<string>();
	const sendLocal = async () => {
		const vignettes = (await readMethodSummaries(fileService, pathService)).filter(method => method.vignettePdf);
		localPdfs = new Set(vignettes.map(method => method.vignettePdf!));
		webviewInput.webview.postMessage({ command: 'local', vignettes });
	};
	const root = userMethodsFolder(pathService);
	await fileService.createFolder(root);
	const refresh = disposables.add(new RunOnceScheduler(() => sendLocal(), 300));
	const watcher = disposables.add(fileService.createWatcher(root, { recursive: false, excludes: [] }));
	disposables.add(watcher.onDidChange(() => refresh.schedule()));
	disposables.add(webviewInput.webview.onDidFocus(() => refresh.schedule()));

	// The published vignettes, read from the registry when the page opens and on Refresh
	let published: IPublishedVignette[] = [];
	const sendPublished = async () => {
		const { registry, url } = vignettesIndex(configurationService);
		let error: string | undefined;
		published = [];
		if (!url) {
			error = localize('vignettes.notGitHub', "The registry {0} is not on GitHub.", registry);
		} else {
			try {
				const context = await requestService.request({ type: 'GET', url, callSite: 'vignettes.index' }, CancellationToken.None);
				// No Vignettes.toml yet, or no registry yet: nothing published
				if (context.res.statusCode !== 404) {
					if (!isSuccess(context)) {
						throw new Error(localize('vignettes.status', "The server returned {0}.", context.res.statusCode ?? '?'));
					}
					published = publishedVignettes((await asText(context)) ?? '');
				}
			} catch (e) {
				error = toErrorMessage(e);
			}
		}
		webviewInput.webview.postMessage({ command: 'published', vignettes: published, registry, error });
	};

	disposables.add(webviewInput.webview.onMessage(async (e: { message: VignettesMessage }) => {
		const message = e.message;
		if (message.command === 'ready') {
			webviewInput.webview.postMessage({ command: 'library', vignettes: LIBRARY_VIGNETTES });
			sendLocal();
			sendPublished();
		} else if (message.command === 'refresh') {
			sendLocal();
			sendPublished();
		} else if (message.command === 'openLibrary' && LIBRARY_VIGNETTES.some(vignette => vignette.id === message.id)) {
			const uri = FileAccess.asFileUri(`vs/workbench/contrib/compose/browser/media/methods/${message.id}/vignette/${message.id}.pdf` as AppResourcePath);
			commandService.executeCommand(BrowserViewCommandId.Open, uri.toString(true));
		} else if (message.command === 'browseMethods') {
			commandService.executeCommand(BROWSE_METHODS_COMMAND_ID);
		} else if (message.command === 'openLocal' && localPdfs.has(message.id)) {
			commandService.executeCommand(BrowserViewCommandId.Open, URI.parse(message.id).toString(true));
		} else if (message.command === 'openMethod') {
			instantiationService.invokeFunction(openUserMethod, message.id);
		} else if (message.command === 'openPublished' && published.some(vignette => vignette.pdf === message.pdf)) {
			commandService.executeCommand(BrowserViewCommandId.Open, message.pdf);
		} else if (message.command === 'repository' && published.some(vignette => vignette.repository === message.url)) {
			openerService.open(URI.parse(message.url), { openExternal: true });
		}
	}));
}

/** The page: its texts come from here, the vignettes from the `local` and `published` messages. */
function pageHtml(): string {
	const text = {
		title: localize('vignettes.title', "Vignettes"),
		intro: localize('vignettes.intro', "A vignette is a method's documentation: the article it follows, how to call it in Julia, and its results printed beside the published ones. Click a title to read it."),
		library: localize('vignettes.library', "In Pollis"),
		libraryIntro: localize('vignettes.libraryIntro', "The vignettes of the methods of the New Methods library, each tested against the paper it came from. Their notebooks are in"),
		libraryLink: localize('vignettes.libraryLink', "Compose > New Methods > Browse Methods"),
		topic: localize('vignettes.topicHeader', "Topic"),
		search: localize('vignettes.search', "Search vignettes"),
		local: localize('vignettes.local', "On This Computer"),
		localEmpty: localize('vignettes.localEmpty', "None of your methods has a vignette yet: Write a Vignette, on a method's page (Compose > New Methods > Browse Methods), asks your coding agent for one."),
		published: localize('vignettes.published', "Published"),
		publishedIntro: localize('vignettes.publishedIntro', "The vignettes of the method packages in the Pollis registry. Package and Publish adds a method's vignette here when it registers the package."),
		publishedEmpty: localize('vignettes.publishedEmpty', "No vignettes published yet."),
		loading: localize('vignettes.loading', "Reading the list of published vignettes..."),
		failed: localize('vignettes.failed', "Could not read the list of published vignettes:"),
		noMatch: localize('vignettes.noMatch', "No vignette matches."),
		vignette: localize('vignettes.vignette', "Vignette"),
		article: localize('vignettes.article', "Article"),
		package: localize('vignettes.package', "Package"),
		openMethod: localize('vignettes.openMethod', "Open Method"),
		repository: localize('vignettes.repository', "Repository"),
		refresh: localize('vignettes.refresh', "Refresh"),
		by: localize('vignettes.by', "by {0}"),
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
	.search { width: 100%; max-width: 420px; margin: 0 0 8px 0; padding: 4px 6px; font: inherit; color: var(--vscode-input-foreground); background: var(--vscode-input-background); border: 1px solid var(--vscode-input-border, var(--vscode-widget-border)); border-radius: 2px; }
	.search:focus { outline: 1px solid var(--vscode-focusBorder); outline-offset: -1px; }
	.error { color: var(--vscode-errorForeground); }</style>
</head>
<body>
<div class="container">
	<h1>${text.title}</h1>
	<p class="subtitle">${text.intro}</p>
	<input class="search" id="search" type="search" placeholder="${text.search}" aria-label="${text.search}">
	<h2>${text.library}</h2>
	<p class="hint">${text.libraryIntro} <button class="link" id="browseMethods">${text.libraryLink}</button></p>
	<p class="hint" id="libraryNote" hidden></p>
	<table id="libraryTable" hidden>
		<thead><tr><th class="name">${text.vignette}</th><th class="article">${text.article}</th><th>${text.topic}</th></tr></thead>
		<tbody id="library"></tbody>
	</table>
	<h2>${text.local}</h2>
	<p class="hint" id="localNote"></p>
	<table id="localTable" hidden>
		<thead><tr><th class="name">${text.vignette}</th><th class="article">${text.article}</th><th>${text.package}</th></tr></thead>
		<tbody id="local"></tbody>
	</table>
	<h2>${text.published}</h2>
	<p class="hint">${text.publishedIntro} <button class="link" id="refresh">${text.refresh}</button></p>
	<p class="hint" id="publishedNote">${text.loading}</p>
	<table id="publishedTable" hidden>
		<thead><tr><th class="name">${text.vignette}</th><th class="article">${text.article}</th><th>${text.package}</th></tr></thead>
		<tbody id="published"></tbody>
	</table>
</div>
<script>
	const vscode = acquireVsCodeApi();
	const TEXT = ${JSON.stringify(text)};
	${LIBRARY_PAGE_HELPERS}

	let library;
	let local;
	let published;
	const search = document.getElementById('search');

	function matches(fields) {
		const query = search.value.trim().toLowerCase();
		return !query || fields.some(field => (field || '').toLowerCase().includes(query));
	}

	// A table of vignettes, or a note when there are none or none matches
	function fill(id, vignettes, empty, row) {
		const shown = vignettes.filter(vignette => matches([vignette.title, vignette.topic, vignette.method, vignette.description, vignette.citation, vignette.package, vignette.author]));
		const body = document.getElementById(id);
		body.textContent = '';
		for (const vignette of shown) {
			body.appendChild(row(vignette));
		}
		document.getElementById(id + 'Table').hidden = !shown.length;
		const note = document.getElementById(id + 'Note');
		note.className = 'hint';
		note.textContent = shown.length ? '' : vignettes.length ? TEXT.noMatch : empty;
		note.hidden = !!shown.length;
	}

	function libraryRow(vignette) {
		const row = element('tr');
		const title = element('div', 'title', vignette.title);
		title.addEventListener('click', () => vscode.postMessage({ command: 'openLibrary', id: vignette.id }));
		cell(row, 'name').appendChild(title);
		cell(row, 'article').appendChild(element('p', 'citation small', vignette.citation));
		cell(row).appendChild(element('div', 'small', vignette.topic));
		return row;
	}

	function localRow(method) {
		const row = element('tr');
		const name = cell(row, 'name');
		const title = element('div', 'title', method.vignetteTitle);
		title.addEventListener('click', () => vscode.postMessage({ command: 'openLocal', id: method.vignettePdf }));
		name.appendChild(title);
		if (method.title !== method.vignetteTitle) {
			name.appendChild(element('p', 'description', method.title));
		}
		cell(row, 'article').appendChild(element('p', 'citation small', method.citation || ''));
		const packageCell = cell(row);
		packageCell.appendChild(element('div', 'file', method.name + '.jl'));
		const links = element('div', 'links');
		links.appendChild(link(TEXT.openMethod, () => vscode.postMessage({ command: 'openMethod', id: method.id })));
		packageCell.appendChild(links);
		return row;
	}

	function publishedRow(vignette) {
		const row = element('tr');
		const name = cell(row, 'name');
		const title = element('div', 'title', vignette.title);
		title.addEventListener('click', () => vscode.postMessage({ command: 'openPublished', pdf: vignette.pdf }));
		name.appendChild(title);
		if (vignette.method && vignette.method !== vignette.title) {
			name.appendChild(element('p', 'description', vignette.method));
		}
		if (vignette.description) {
			name.appendChild(element('p', 'description clamped', vignette.description));
		}
		cell(row, 'article').appendChild(element('p', 'citation small', vignette.citation));
		const packageCell = cell(row);
		packageCell.appendChild(element('div', 'file', vignette.package + '.jl' + (vignette.version ? ' ' + vignette.version : '')));
		if (vignette.author) {
			packageCell.appendChild(element('div', 'small', TEXT.by.replace('{0}', vignette.author)));
		}
		const links = element('div', 'links');
		links.appendChild(link(TEXT.repository, () => vscode.postMessage({ command: 'repository', url: vignette.repository })));
		packageCell.appendChild(links);
		return row;
	}

	function render() {
		if (library) {
			fill('library', library, '', libraryRow);
		}
		if (local) {
			fill('local', local, TEXT.localEmpty, localRow);
		}
		if (published) {
			if (published.error) {
				document.getElementById('publishedTable').hidden = true;
				const note = document.getElementById('publishedNote');
				note.hidden = false;
				note.className = 'hint error';
				note.textContent = TEXT.failed + ' ' + published.error;
			} else {
				fill('published', published.vignettes, TEXT.publishedEmpty, publishedRow);
			}
		}
	}

	search.addEventListener('input', render);
	document.getElementById('browseMethods').addEventListener('click', () => vscode.postMessage({ command: 'browseMethods' }));
	document.getElementById('refresh').addEventListener('click', () => {
		const note = document.getElementById('publishedNote');
		note.hidden = false;
		note.className = 'hint';
		note.textContent = TEXT.loading;
		vscode.postMessage({ command: 'refresh' });
	});

	window.addEventListener('message', event => {
		if (event.data.command === 'library') {
			library = event.data.vignettes;
			render();
		} else if (event.data.command === 'local') {
			local = event.data.vignettes;
			render();
		} else if (event.data.command === 'published') {
			published = event.data;
			render();
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
			id: VIGNETTES_COMMAND_ID,
			title: {
				...localize2('vignettes.action', "Vignettes"),
				mnemonicTitle: localize({ key: 'miVignettes', comment: ['&& denotes a mnemonic'] }, "&&Vignettes"),
			},
			category: Categories.Help,
			f1: true,
			// Help > Documentation, defined in workbench/browser/actions/helpActions.ts, after A Tour of Pollis
			menu: { id: MenuId.for('MenubarHelpDocumentationMenu'), group: '0_pollis', order: 2 },
		});
	}
	run(accessor: ServicesAccessor): Promise<void> {
		return openVignettesPage(accessor);
	}
});
