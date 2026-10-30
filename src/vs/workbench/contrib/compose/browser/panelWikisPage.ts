/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { DisposableStore } from '../../../../base/common/lifecycle.js';
import { hasKey } from '../../../../base/common/types.js';
import { localize, localize2 } from '../../../../nls.js';
import { Action2, MenuId, registerAction2 } from '../../../../platform/actions/common/actions.js';
import { Categories } from '../../../../platform/action/common/actionCommonCategories.js';
import { ICommandService } from '../../../../platform/commands/common/commands.js';
import { ServicesAccessor } from '../../../../platform/instantiation/common/instantiation.js';
import { IOpenerService } from '../../../../platform/opener/common/opener.js';
import { IEditorService } from '../../../services/editor/common/editorService.js';
import { WebviewInput } from '../../webviewPanel/browser/webviewEditorInput.js';
import { IWebviewWorkbenchService } from '../../webviewPanel/browser/webviewWorkbenchService.js';
import { openWikiByFile } from '../../model/browser/handlers/model.handler.js';
import { voiceButtonsCss, voiceButtonsHtml, voiceButtonsScript } from '../../model/browser/webviews/webviewScaffold.js';
import { IPollisMenuNode, IPollisViewsService } from '../../pollisViews/common/pollisViews.js';
import { LIBRARY_PAGE_HELPERS, LIBRARY_PAGE_STYLE } from './libraryPage.js';
import { PANEL_WIKIS } from './panelWikis.data.js';

// Help > Documentation > Panels: the wikis of every panel (Overview, Assumptions, Interpretation...), grouped by the menu
// of the menu bar that opens the panel, as the panel's own Wiki tab lists them. Which panel a menu item opens comes from
// the commands that open each panel, found by compile-toml (panelWikis.data.ts); the menu items, from the menu bar as the
// Views panel walks it. A wiki opens as the panel opens it: the user's own copy when there is one.

export const PANEL_WIKIS_COMMAND_ID = 'pollis.documentation.panels';

/** A panel as the page lists it, under a menu of the menu bar. */
interface IListedPanel {
	readonly id: string;
	readonly title: string;
	/** The submenus that lead to it from its menu: `Regression > Linear Models`. */
	readonly path: string;
	/** `stub` when the wiki is still "Not written yet." */
	readonly wikis: readonly { readonly name: string; readonly description: string; readonly target: string; readonly stub: boolean }[];
}

/** A menu of the menu bar and the panels with wikis it opens, in menu order. */
interface IListedMenu {
	readonly title: string;
	readonly panels: readonly IListedPanel[];
}

type PanelWikisMessage =
	| { readonly command: 'ready' }
	| { readonly command: 'open'; readonly panel: string; readonly target: string };

/** The menus of `tree` with the panels they open, each panel once a menu, where it is first found. */
function listedMenus(tree: readonly IPollisMenuNode[]): IListedMenu[] {
	const panelOf = new Map(PANEL_WIKIS.flatMap(panel => panel.commands.map(command => [command, panel] as const)));
	const menus: IListedMenu[] = [];
	for (const menu of tree) {
		const panels = new Map<string, IListedPanel>();
		const walk = (nodes: readonly IPollisMenuNode[], path: readonly string[]) => {
			for (const node of nodes) {
				if (node.children) {
					walk(node.children, [...path, node.title]);
					continue;
				}
				const panel = panelOf.get(node.id);
				if (panel && !panels.has(panel.id)) {
					panels.set(panel.id, {
						id: panel.id,
						// Without the dots of a menu item that opens a page: Evaluate Answering Models...
						title: node.title.replace(/\.{3}$/, ''),
						// allow-any-unicode-next-line
						path: path.join(' › '),
						wikis: panel.wikis.flatMap(wiki => hasKey(wiki, { separator: true }) ? [] : [{ name: wiki.name, description: wiki.description ?? '', target: wiki.bundled ? wiki.file : wiki.url, stub: hasKey(wiki, { stub: true }) }]),
					});
				}
			}
		};
		walk(menu.children ?? [], []);
		if (panels.size) {
			menus.push({ title: menu.title, panels: [...panels.values()] });
		}
	}
	return menus;
}

/** The open page, so a second request shows it again. */
let openPage: WebviewInput | undefined;

/** Opens the Panel Documentation page, or shows it again when it is open. */
function openPanelWikisPage(accessor: ServicesAccessor): void {
	const webviewWorkbenchService = accessor.get(IWebviewWorkbenchService);
	const pollisViewsService = accessor.get(IPollisViewsService);
	const openerService = accessor.get(IOpenerService);
	const editorService = accessor.get(IEditorService);
	const commandService = accessor.get(ICommandService);

	if (openPage && !openPage.isDisposed()) {
		webviewWorkbenchService.revealWebview(openPage, openPage.group ?? -1, false);
		return;
	}
	const title = localize('panelWikis.title', "Panel Documentation");
	const webviewInput = webviewWorkbenchService.openWebview(
		{
			title,
			options: { retainContextWhenHidden: true },
			contentOptions: { allowScripts: true, localResourceRoots: [] },
			extension: undefined,
		},
		'pollis.panelWikis',
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

	disposables.add(webviewInput.webview.onMessage((e: { message: PanelWikisMessage }) => {
		const message = e.message;
		if (message.command === 'ready') {
			webviewInput.webview.postMessage({ command: 'menus', menus: listedMenus(pollisViewsService.getMenuTree()) });
		} else if (message.command === 'open') {
			const panel = PANEL_WIKIS.find(panel => panel.id === message.panel);
			if (panel) {
				openWikiByFile(message.target, [...panel.wikis], openerService, editorService, commandService);
			}
		}
	}));
}

/** The page: its texts come from here, the panels from the `menus` message. */
function pageHtml(): string {
	const text = {
		title: localize('panelWikis.title', "Panel Documentation"),
		intro: localize('panelWikis.intro', "The wikis of every panel and of the Compose pages that have them, the same as in their Learn More, grouped by the menu that opens each. Click a wiki to read it. The switch shows the wikis written or the ones not written yet."),
		search: localize('panelWikis.search', "Search panels and wikis"),
		written: localize('panelWikis.written', "Written"),
		notWritten: localize('panelWikis.notWritten', "Not Written"),
		showWritten: localize('panelWikis.showWritten', "Show Written Wikis"),
		showNotWritten: localize('panelWikis.showNotWritten', "Show Wikis Not Written"),
		stub: localize('panelWikis.stub', "Not written yet"),
		counts: localize('panelWikis.counts', "{0} of {1} wikis written"),
		noMatch: localize('panelWikis.noMatch', "No panel or wiki matches."),
		panel: localize('panelWikis.panel', "Panel"),
		wikis: localize('panelWikis.wikis', "Wikis"),
	};
	return `<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline';">
	<style>${LIBRARY_PAGE_STYLE}
		${voiceButtonsCss}
	h2 { font-size: 18px; font-weight: 400; margin: 20px 0 4px 0; }
	.hint { color: var(--vscode-descriptionForeground); margin: 0 0 8px 0; line-height: 1.4; max-width: 900px; }
	.search { width: 100%; max-width: 420px; margin: 0 0 8px 0; padding: 4px 6px; font: inherit; color: var(--vscode-input-foreground); background: var(--vscode-input-background); border: 1px solid var(--vscode-input-border, var(--vscode-widget-border)); border-radius: 2px; }
	.search:focus { outline: 1px solid var(--vscode-focusBorder); outline-offset: -1px; }
	.panel-title { font-size: 14px; font-weight: 600; }
	.filters { display: flex; flex-wrap: wrap; align-items: center; gap: 16px; margin: 0 0 8px 0; }
	.filters .search { margin: 0; }
	/* The Written and Not Written tabs with a switch between them, as on the Welcome page; the one chosen in the foreground colour */
	.tabs { display: flex; align-items: center; gap: 10px; }
	.tab { padding: 0; border: none; background: none; font: inherit; color: var(--vscode-descriptionForeground); cursor: pointer; }
	.tab:hover, .tab.active { color: var(--vscode-foreground); }
	.tab-switch {
		position: relative;
		flex-shrink: 0;
		width: 46px;
		height: 24px;
		padding: 0;
		border: 1px solid color-mix(in srgb, var(--vscode-descriptionForeground) 70%, transparent);
		border-radius: 12px;
		background: var(--vscode-input-background);
		box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.25);
		cursor: pointer;
		transition: border-color 160ms ease;
	}
	.tab-switch:hover { border-color: var(--vscode-focusBorder); }
	.tab-switch::after {
		content: '';
		position: absolute;
		top: 2px;
		left: 2px;
		width: 20px;
		height: 18px;
		border-radius: 9px;
		background: var(--vscode-button-background, var(--vscode-focusBorder));
		box-shadow: 0 1px 2px rgba(0, 0, 0, 0.35);
		transition: left 160ms ease;
	}
	.tab-switch.right::after { left: 22px; }
	.tab-switch:focus-visible { outline: 1px solid var(--vscode-focusBorder); outline-offset: 2px; }
	@media (prefers-reduced-motion: reduce) { .tab-switch, .tab-switch::after { transition: none; } }
	.link.stub { color: var(--vscode-disabledForeground); }</style>
</head>
<body>
<div class="container">
	<div class="title-row">
		<h1>${text.title}</h1>
		${voiceButtonsHtml}
	</div>
	<p class="subtitle">${text.intro}</p>
	<div class="filters">
		<input class="search" id="search" type="search" placeholder="${text.search}" aria-label="${text.search}">
		<div class="tabs">
			<button class="tab" id="written-tab">${text.written}</button>
			<button class="tab-switch" id="tab-switch"></button>
			<button class="tab" id="not-written-tab">${text.notWritten}</button>
		</div>
		<span class="small" id="counts"></span>
	</div>
	<p class="hint" id="note" hidden></p>
	<div id="menus"></div>
</div>
<script>
	const vscode = acquireVsCodeApi();
	${voiceButtonsScript}
	const TEXT = ${JSON.stringify(text)};
	${LIBRARY_PAGE_HELPERS}

	let menus;
	const search = document.getElementById('search');
	const writtenTab = document.getElementById('written-tab');
	const notWrittenTab = document.getElementById('not-written-tab');
	const tabSwitch = document.getElementById('tab-switch');
	// Whether the written wikis show, or the ones not written yet
	let showWritten = (vscode.getState() || {}).showWritten !== false;

	// The tab chosen in the foreground colour, the knob on its side
	function showTabs() {
		writtenTab.classList.toggle('active', showWritten);
		notWrittenTab.classList.toggle('active', !showWritten);
		tabSwitch.classList.toggle('right', !showWritten);
		tabSwitch.setAttribute('aria-label', showWritten ? TEXT.showNotWritten : TEXT.showWritten);
	}
	showTabs();

	function chooseTab(written) {
		showWritten = written;
		vscode.setState({ ...(vscode.getState() || {}), showWritten });
		showTabs();
		render();
	}

	// A panel's wikis, written or not as the switch says, that match the search: all of them when its menu, path or title does
	function shownWikis(menu, panel) {
		const query = search.value.trim().toLowerCase();
		const wikis = panel.wikis.filter(wiki => !wiki.stub === showWritten);
		if (!query || [menu.title, panel.path, panel.title].some(field => field.toLowerCase().includes(query))) {
			return wikis;
		}
		return wikis.filter(wiki => [wiki.name, wiki.description].some(field => field.toLowerCase().includes(query)));
	}

	// (a) the panel and the submenus leading to it, (b) its wikis
	function row(panel, wikis) {
		const row = element('tr');
		const name = cell(row, 'name');
		name.appendChild(element('div', 'panel-title', panel.title));
		if (panel.path) {
			name.appendChild(element('div', 'small', panel.path));
		}
		const links = element('div', 'links');
		for (const wiki of wikis) {
			const button = link(wiki.name, () => vscode.postMessage({ command: 'open', panel: panel.id, target: wiki.target }));
			if (wiki.stub) {
				button.classList.add('stub');
				button.title = TEXT.stub;
			} else if (wiki.description) {
				button.title = wiki.description;
			}
			links.appendChild(button);
		}
		cell(row).appendChild(links);
		return row;
	}

	function render() {
		if (!menus) {
			return;
		}
		const container = document.getElementById('menus');
		container.textContent = '';
		let shown = 0;
		for (const menu of menus) {
			const rows = menu.panels.map(panel => [panel, shownWikis(menu, panel)]).filter(([, wikis]) => wikis.length);
			if (!rows.length) {
				continue;
			}
			shown += rows.length;
			container.appendChild(element('h2', '', menu.title));
			const table = element('table');
			const head = element('thead');
			const heading = element('tr');
			heading.appendChild(element('th', 'name', TEXT.panel));
			heading.appendChild(element('th', '', TEXT.wikis));
			head.appendChild(heading);
			table.appendChild(head);
			const body = element('tbody');
			for (const [panel, wikis] of rows) {
				body.appendChild(row(panel, wikis));
			}
			table.appendChild(body);
			container.appendChild(table);
		}
		const note = document.getElementById('note');
		note.textContent = shown ? '' : TEXT.noMatch;
		note.hidden = !!shown;
	}

	// How many of the listed wikis are written, each panel once
	function showCounts() {
		const panels = new Map(menus.flatMap(menu => menu.panels.map(panel => [panel.id, panel])));
		const wikis = [...panels.values()].flatMap(panel => panel.wikis);
		const written = wikis.filter(wiki => !wiki.stub).length;
		document.getElementById('counts').textContent = TEXT.counts.replace('{0}', String(written)).replace('{1}', String(wikis.length));
	}

	search.addEventListener('input', render);
	writtenTab.addEventListener('click', () => chooseTab(true));
	notWrittenTab.addEventListener('click', () => chooseTab(false));
	tabSwitch.addEventListener('click', () => chooseTab(!showWritten));
	window.addEventListener('message', event => {
		if (event.data.command === 'menus') {
			menus = event.data.menus;
			showCounts();
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
			id: PANEL_WIKIS_COMMAND_ID,
			title: {
				...localize2('panelWikis.action', "Panel Documentation"),
				mnemonicTitle: localize({ key: 'miPanelWikis', comment: ['&& denotes a mnemonic'] }, "P&&anels"),
			},
			category: Categories.Help,
			f1: true,
			// Help > Documentation, defined in workbench/browser/actions/helpActions.ts, after Packages and Toolboxes
			menu: { id: MenuId.for('MenubarHelpDocumentationMenu'), group: '1_packages', order: 3 },
		});
	}
	run(accessor: ServicesAccessor): void {
		openPanelWikisPage(accessor);
	}
});
