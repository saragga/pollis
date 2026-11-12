/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { dirname, joinPath } from '../../../../base/common/resources.js';
import { URI } from '../../../../base/common/uri.js';
import { localize } from '../../../../nls.js';
import { BrowserViewCommandId } from '../../../../platform/browserView/common/browserView.js';
import { ICommandService } from '../../../../platform/commands/common/commands.js';
import { AskPollisSource, ASK_ARTICLES, ASK_PACKAGE_APIS, ASK_SOURCE_COLLECTION, IAskPollisNamedIndex, IAskPollisPassage, IAskPollisSearchRequest, IAskPollisSearchResult } from '../common/askPollis.js';
import { openPdfInViewer } from '../../../common/pdfViewer.js';

// What Ask Pollis and Evaluate Answering Models show of an answer alike: its Markdown with the citations as buttons, the Sources
// under it with Open, and the passage opened in its document.

/** The name of a model, as its server is given it: its file's name without `.gguf`. */
export function askModelName(model: string): string {
	return model.replace(/^.*[\\/]/, '').replace(/\.gguf$/i, '');
}

/** A passage as the page shows it among the Sources. */
export function askPassageView(passage: IAskPollisPassage) {
	return {
		kind: passage.kind,
		title: passage.title,
		where: passage.kind === 'article' ? localize('askPollis.abstract', "Abstract") : passage.page === null ? passage.menu : localize('askPollis.page', "page {0}", passage.page),
		// An article's heading is its title, shown above
		heading: passage.kind === 'article' ? '' : passage.heading,
		toolbox: passage.toolbox,
		text: passage.text,
	};
}

/** The heading a wiki's preview scrolls to, from the last of a passage's headings: as the Markdown preview names it. */
function headingFragment(heading: string): string {
	// allow-any-unicode-next-line
	const last = heading.split(' › ').pop() ?? '';
	return last.trim().toLowerCase().replace(/[^\p{L}\p{N}\s_-]/gu, '').replace(/\s/g, '-');
}

/** Opens a passage in its document: the PDF at its page, a work cited in its reference and abstract, the panel's wiki or a Markdown document at its heading, the Julia Manual at its section, a package's docstring on its site, a text file. */
export function askOpenPassage(commandService: ICommandService, passage: IAskPollisPassage): void {
	if (passage.kind === 'article') {
		// A work cited: its reference, with its address, and its abstract
		commandService.executeCommand('markdown.showPreview', URI.file(passage.file));
	} else if (passage.kind === 'wiki' || passage.kind === 'markdown') {
		commandService.executeCommand('markdown.showPreview', URI.file(passage.file).with({ fragment: headingFragment(passage.heading) }));
	} else if (passage.kind === 'text') {
		// A text file of a collection of Retrieval-Augmented Generation, in the editor
		commandService.executeCommand('vscode.open', URI.file(passage.file));
	} else if (passage.kind === 'api' && passage.anchor) {
		commandService.executeCommand(BrowserViewCommandId.Open, passage.anchor);
	} else if (passage.anchor) {
		// The Julia Manual, in the HTML that comes with Julia, at the section or the docstring
		const [page, fragment] = passage.anchor.split('#');
		commandService.executeCommand(BrowserViewCommandId.Open, joinPath(dirname(URI.file(passage.file)), page).with({ fragment: fragment ?? '' }).toString(true));
	} else {
		// The PDF at the passage's page, in the PDF Viewer
		openPdfInViewer(commandService, URI.file(passage.file), { page: passage.page ?? undefined });
	}
}

/** What a Search In chooses, a list of them or, for the collections nearest the question, an empty list: a collection by its name, a source of Pollis, all, or none. */
const SEARCH_NEAREST = '';
const SEARCH_ALL = '*';
const SEARCH_NONE = '-';
/** The collection of Pollis' own documents, as ask_index.jl names it. */
const POLLIS = 'Pollis';
/** The collection of the Julia Manual, as ask_index.jl names it. */
const JULIA_MANUAL = 'Julia Manual';
/** The collection of the Package APIs, listed among the sources of Pollis, after the vignettes. */
const PACKAGE_APIS = ASK_PACKAGE_APIS;
/** The sources of Pollis and of Julia's documentation, which a Search In offers in place of the collections. */
const SEARCH_SOURCES: Record<AskPollisSource, string> = {
	pollisTopics: localize('askPollis.pollisTopics', "Pollis Topics"),
	packageVignettes: localize('askPollis.packageVignettes', "Package Vignettes"),
	toolboxOverviews: localize('askPollis.toolboxOverviews', "Toolbox Overviews"),
	panelsWikis: localize('askPollis.panelsWikis', "Panels Wikis"),
	juliaManual: localize('askPollis.juliaManual', "Julia Manual"),
	juliaLibrary: localize('askPollis.juliaLibrary', "Julia Base and Standard Library"),
};

/** The sources of `collection` a Search In offers, by their names. */
function searchSourcesOf(collection: string): { readonly [source: string]: string } {
	return Object.fromEntries(Object.entries(SEARCH_SOURCES).filter(([source]) => ASK_SOURCE_COLLECTION[source as AskPollisSource] === collection));
}

/** Whether what a Search In ticked is a source of Pollis. */
function isSearchSource(name: string): name is AskPollisSource {
	return Object.hasOwn(SEARCH_SOURCES, name);
}

/** The sources ticked in a Search In; nothing when the collections searched are searched whole. */
function askSearchSources(choice: readonly string[]): readonly AskPollisSource[] | undefined {
	const sources = choice.filter(isSearchSource);
	return sources.length ? sources : undefined;
}

/** The collections a Search In's choice searches, of `all` those of the index; nothing for the nearest. */
function askSearchIn(choice: readonly string[], all: readonly string[]): readonly string[] | undefined {
	return !choice.length ? undefined : choice.includes(SEARCH_ALL) ? all : [...new Set(choice.map(name => isSearchSource(name) ? ASK_SOURCE_COLLECTION[name] : name))];
}

/**
 * What a Search In's choice `choice` searches, as Ask Pollis searches it: of PollisDocuments, whose collections are
 * `collections`, the collections and the sources ticked; and the indexes of `indexes` ticked, each searched on its own.
 * Auto searches the collections nearest the question, with nothing in `collections`.
 */
export function askSearchWithin(choice: readonly string[], collections: readonly string[], indexes: readonly IAskPollisNamedIndex[]): Pick<IAskPollisSearchRequest, 'collections' | 'sources'> & { readonly collectionIndexes: readonly IAskPollisNamedIndex[] } {
	const chosen = askSearchIn(choice, [...collections, ...indexes.map(index => index.name).filter(name => !collections.includes(name))]);
	const collectionIndexes = chosen ? indexes.filter(index => chosen.includes(index.name) && !collections.includes(index.name)) : [];
	return {
		collections: chosen?.filter(name => !collectionIndexes.some(index => index.name === name)),
		sources: askSearchSources(choice),
		collectionIndexes,
	};
}

/** A Search In's choice in words: Auto, All Sources, or the sources and collections ticked. */
export function askSearchInLabel(choice: readonly string[]): string {
	return !choice.length
		? localize('askPollis.automatic', "Auto")
		: choice.includes(SEARCH_ALL) ? localize('askPollis.all', "All Sources") : choice.map(name => isSearchSource(name) ? SEARCH_SOURCES[name] : name).join(', ');
}

/** What the page says was searched: the collections `searched`, each as the sources of it a Search In's choice ticked. */
export function askSearchedNames(choice: readonly string[], searched: readonly string[]): readonly string[] {
	const sources = askSearchSources(choice) ?? [];
	return searched.flatMap(name => {
		const ticked = sources.filter(source => ASK_SOURCE_COLLECTION[source] === name);
		return ticked.length ? ticked.map(source => SEARCH_SOURCES[source]) : [name];
	});
}

/** Whether a Search In's choice is None: the model answers without the documents, to see what they add. */
export function askSearchesNothing(choice: readonly string[]): boolean {
	return choice.includes(SEARCH_NONE);
}

/** Whether a Search In's choice may search Julia's documentation: Auto, All Sources, or the Julia Manual or one of its sources ticked. */
export function askSearchesJulia(choice: readonly string[]): boolean {
	return !askSearchesNothing(choice) && (!choice.length || choice.includes(SEARCH_ALL) || !!askSearchIn(choice, [])?.includes(JULIA_MANUAL));
}

/** Why the question was searched by its words only, for the page; nothing when it was searched by meaning too. */
export function askWordsOnlyNote(result: IAskPollisSearchResult): string {
	switch (result.wordsOnly) {
		case 'notEmbedded':
			return localize('askPollis.notEmbedded', "Searched by words only: the passages are not yet given their embeddings, which Pollis does after it indexes the documents.");
		case 'otherModel':
			return localize('askPollis.otherModel', "Searched by words only: the passages were embedded with another model than that of pollis.ask.embeddingModel. They are embedded again when the Julia REPL starts.");
		case 'modelNotStarted':
			return localize('askPollis.modelNotStarted', "Searched by words only: the embedding model did not start. {0}", result.error ?? '');
		default:
			return '';
	}
}

/** Why no passage came for the question. */
export function askNothingFound(result: IAskPollisSearchResult): string {
	return result.wordsOnly === 'notIndexed'
		? localize('askPollis.notIndexed', "Pollis has not indexed its documents yet. It does when the Julia REPL starts, after it compiles them; the status bar shows how far it has come.")
		: localize('askPollis.nothingFound', "No passage of the documents matches the question.");
}

/** The styles of an answer and its Sources. */
export const askAnswerCss = `
	.answer { font-size: 14px; line-height: 1.55; }
	.answer p { margin: 0 0 10px 0; }
	.answer ul, .answer ol { margin: 0 0 10px 0; padding-left: 22px; }
	.answer code { font-family: var(--vscode-editor-font-family); font-size: 12px; background: var(--vscode-textCodeBlock-background); padding: 1px 4px; border-radius: 3px; }
	.answer pre { font-family: var(--vscode-editor-font-family); font-size: 12px; background: var(--vscode-textCodeBlock-background); padding: 8px; border-radius: 3px; overflow-x: auto; }
	button.cite { font: inherit; font-size: 11px; font-weight: 600; color: var(--vscode-textLink-foreground); background: none; border: none; padding: 0 1px; cursor: pointer; }
	button.cite:hover { text-decoration: underline; }
	.sources { margin-top: 12px; }
	.sources h3 { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; color: var(--vscode-descriptionForeground); margin: 0 0 6px 0; }
	.source { display: flex; gap: 10px; align-items: baseline; padding: 5px 6px; border-radius: 3px; }
	.source:hover { background: var(--vscode-list-hoverBackground); }
	.source.flash { background: var(--vscode-editor-findMatchHighlightBackground); }
	.source .number { font-weight: 600; min-width: 28px; }
	.source .label { flex: 1; }
`;

/**
 * The script of an answer and its Sources: element(), esc(), markdown(), cited(), renderSources(), showSource(),
 * which a click on a citation calls to show its source within `box`, and searchInSources(), what a Search In can tick.
 */
export function askAnswerScript(): string {
	const text = {
		sources: localize('askPollis.sources', "Sources"),
		closest: localize('askPollis.closest', "The passages that came closest"),
		open: localize('askPollis.open', "Open"),
		fromToolbox: localize('askPollis.fromToolbox', "{0} toolbox", '{0}'),
		automatic: localize('askPollis.automatic', "Auto"),
		automaticHint: localize('askPollis.automaticHint', "Pollis' own documents, the Julia Manual, or both, depending on what the question is about"),
		pollisSources: searchSourcesOf(POLLIS),
		juliaSources: searchSourcesOf(JULIA_MANUAL),
		all: localize('askPollis.all', "All Sources"),
		none: localize('askPollis.none', "None"),
		sourcesCount: localize('askPollis.sourcesCount', "{0} Sources", '{0}'),
		juliaManualHint: localize('askPollis.juliaManualHint', "The Julia Manual, of the Julia that the REPL runs"),
		juliaLibraryHint: localize('askPollis.juliaLibraryHint', "The pages of Base and the standard library, mostly docstrings, of the Julia that the REPL runs"),
		packageApisHint: localize('askPollis.packageApisHint', "The docstrings of the packages of the panels, from their documentation sites, at the version on this computer when the site has it. Searched only when ticked, or with All Sources"),
		articlesHint: localize('askPollis.articlesHint', "The abstracts of the works the panels cite, from PollisReferences. A question asked in a panel searches those the panel cites; the others are searched only when ticked, or with All Sources"),
		collectionHint: localize('askPollis.collectionHint', "Searched in its own index, built in Compose > Knowledge for AI Models. Searched only when ticked, or with All Sources"),
		noneHint: localize('askPollis.noneHint', "Nothing is searched: the model answers from what it knows, without the documents, to see what they add"),
	};
	return `
	const ANSWER_TEXT = ${JSON.stringify(text)};
	const SEARCH_NEAREST = ${JSON.stringify(SEARCH_NEAREST)};
	const SEARCH_ALL = ${JSON.stringify(SEARCH_ALL)};
	const SEARCH_NONE = ${JSON.stringify(SEARCH_NONE)};

	function element(tag, className, content) {
		const node = document.createElement(tag);
		if (className) { node.className = className; }
		if (content) { node.textContent = content; }
		return node;
	}

	function esc(s) {
		return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
	}

	/** Code, bold and the citations of a line, already escaped. */
	function inline(line, count) {
		return line
			.replace(/\`([^\`]+)\`/g, '<code>$1</code>')
			.replace(/\\*\\*([^*]+)\\*\\*/g, '<strong>$1</strong>')
			.replace(/\\[(\\d+(?:\\s*,\\s*\\d+)*)\\]/g, (all, numbers) => {
				const cited = numbers.split(',').map(n => Number(n.trim()));
				if (cited.some(n => n < 1 || n > count)) { return all; }
				return '[' + cited.map(n => '<button class="cite" data-n="' + n + '">' + n + '</button>').join(', ') + ']';
			});
	}

	/** The answer's Markdown, as the model writes it: paragraphs, lists, code blocks, headings as bold lines. */
	function markdown(source, count) {
		const html = [];
		let list;
		let code;
		let paragraph = [];
		const flush = () => {
			if (paragraph.length) { html.push('<p>' + paragraph.map(line => inline(line, count)).join('<br>') + '</p>'); paragraph = []; }
			if (list) { html.push('<' + list.tag + '>' + list.items.map(item => '<li>' + inline(item, count) + '</li>').join('') + '</' + list.tag + '>'); list = undefined; }
		};
		for (const raw of esc(source).split('\\n')) {
			if (code) {
				if (raw.trim().startsWith('\`\`\`')) { html.push('<pre>' + code.join('\\n') + '</pre>'); code = undefined; } else { code.push(raw); }
				continue;
			}
			const line = raw.trim();
			const item = /^(?:[-*]|(\\d+)\\.)\\s+(.*)$/.exec(line);
			if (line.startsWith('\`\`\`')) {
				flush();
				code = [];
			} else if (!line) {
				flush();
			} else if (item) {
				const tag = item[1] ? 'ol' : 'ul';
				if (paragraph.length || (list && list.tag !== tag)) { flush(); }
				list = list || { tag, items: [] };
				list.items.push(item[2]);
			} else if (/^-{3,}$/.test(line)) {
				flush();
				html.push('<hr>');
			} else if (/^#+\\s/.test(line)) {
				flush();
				html.push('<p><strong>' + inline(line.replace(/^#+\\s+/, ''), count) + '</strong></p>');
			} else {
				if (list) { flush(); }
				paragraph.push(line);
			}
		}
		if (code) { html.push('<pre>' + code.join('\\n') + '</pre>'); }
		flush();
		return html.join('');
	}

	/** The numbers the answer cites, in order. */
	function cited(answer, count) {
		const numbers = new Set();
		for (const match of answer.matchAll(/\\[(\\d+(?:\\s*,\\s*\\d+)*)\\]/g)) {
			for (const n of match[1].split(',').map(n => Number(n.trim()))) {
				if (n >= 1 && n <= count) { numbers.add(n); }
			}
		}
		return [...numbers].sort((a, b) => a - b);
	}

	/** The Sources of an answer in \`box\`: the passages cited, or all of them when it is done and cites none; Open calls \`open\` with the passage's index. */
	function renderSources(box, passages, answer, done, open) {
		let numbers = cited(answer, passages.length);
		const closest = done && !numbers.length;
		if (closest) { numbers = passages.map((_, i) => i + 1); }
		box.textContent = '';
		if (!numbers.length) { return; }
		box.appendChild(element('h3', '', closest ? ANSWER_TEXT.closest : ANSWER_TEXT.sources));
		for (const n of numbers) {
			const passage = passages[n - 1];
			const row = element('div', 'source');
			row.dataset.n = String(n);
			row.appendChild(element('span', 'number', '[' + n + ']'));
			const detail = [passage.where, passage.heading, passage.toolbox ? ANSWER_TEXT.fromToolbox.replace('{0}', passage.toolbox) : ''].filter(part => part).join(' · ');
			const label = element('span', 'label');
			label.appendChild(element('div', '', passage.title));
			if (detail) { label.appendChild(element('div', 'small', detail)); }
			label.title = passage.text;
			row.appendChild(label);
			const button = element('button', 'link', ANSWER_TEXT.open);
			button.addEventListener('click', () => open(n - 1));
			row.appendChild(button);
			box.appendChild(row);
		}
	}

	/**
	 * What a Search In can tick: each collection of \`names\`, Pollis and the Julia Manual as their sources, the Package
	 * APIs after the vignettes, then the Knowledge Base and the collections of Retrieval-Augmented Generation.
	 */
	function searchInSources(names) {
		const hints = { juliaManual: ANSWER_TEXT.juliaManualHint, juliaLibrary: ANSWER_TEXT.juliaLibraryHint, ${JSON.stringify(PACKAGE_APIS)}: ANSWER_TEXT.packageApisHint, ${JSON.stringify(ASK_ARTICLES)}: ANSWER_TEXT.articlesHint };
		const packageApis = names.includes(${JSON.stringify(PACKAGE_APIS)}) ? [[${JSON.stringify(PACKAGE_APIS)}, ${JSON.stringify(PACKAGE_APIS)}]] : [];
		const pollisSources = Object.entries(ANSWER_TEXT.pollisSources).flatMap(source => source[0] === 'packageVignettes' ? [source, ...packageApis] : [source]);
		return names.flatMap(name => name === ${JSON.stringify(POLLIS)} ? pollisSources : name === ${JSON.stringify(JULIA_MANUAL)} ? Object.entries(ANSWER_TEXT.juliaSources) : name === ${JSON.stringify(PACKAGE_APIS)} ? [] : [[name, name, ANSWER_TEXT.collectionHint]]).map(([value, label, hint]) => ({ value, label, title: hints[value] ?? hint ?? '' }));
	}

	/** A click on a citation shows its source, among those of the nearest \`.\${boxClass}\` around it. */
	function showSource(event, boxClass) {
		const cite = event.target.closest('button.cite');
		const box = cite && cite.closest('.' + boxClass);
		const row = box && box.querySelector('.source[data-n="' + cite.dataset.n + '"]');
		if (row) {
			row.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
			row.classList.add('flash');
			setTimeout(() => row.classList.remove('flash'), 1200);
		}
	}
`;
}

/** The chevron of a picker. */
export const ASK_CHEVRON = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 6l4 4 4-4"/></svg>';

/** The styles of the pickers and their menus: Search In and Strategy of Ask Pollis, Search In of Evaluate Answering Models. */
export const askMenuCss = `
	.anchor { position: relative; }
	.picker { display: inline-flex; align-items: center; gap: 4px; white-space: nowrap; font: inherit; font-size: 12px; color: var(--vscode-descriptionForeground); background: transparent; border: none; border-radius: 6px; padding: 3px 6px; cursor: pointer; }
	.picker:hover, .picker[aria-expanded="true"] { color: var(--vscode-foreground); background: var(--vscode-toolbar-hoverBackground); }
	.picker svg { width: 10px; height: 10px; }
	/* The menus of the pickers, upwards, or downwards when there is no room above */
	.menu { position: absolute; bottom: 28px; z-index: 2; min-width: min(250px, calc(100vw - 8px)); max-width: calc(100vw - 8px); max-height: 60vh; overflow-y: auto; padding: 4px; color: var(--vscode-menu-foreground); background: var(--vscode-menu-background); border: 1px solid var(--vscode-menu-border, var(--vscode-widget-border)); border-radius: 8px; box-shadow: 0 4px 16px var(--vscode-widget-shadow); }
	.menu.down { bottom: auto; top: 28px; }
	.menu.left { left: 0; }
	.menu .heading { font-size: 11px; color: var(--vscode-descriptionForeground); padding: 6px 8px 2px 8px; }
	.menu .item { display: flex; align-items: baseline; gap: 8px; width: 100%; text-align: left; font: inherit; font-size: 12px; color: inherit; background: none; border: none; border-radius: 4px; padding: 4px 8px; cursor: pointer; }
	.menu .item:hover, .menu .item:focus { color: var(--vscode-menu-selectionForeground); background: var(--vscode-menu-selectionBackground); outline: none; }
	.menu .check { width: 12px; flex: none; }
	.menu .check.box { align-self: center; box-sizing: border-box; height: 12px; font-size: 10px; line-height: 10px; text-align: center; border: 1px solid currentColor; border-radius: 3px; }
	.menu .label { flex: 1; min-width: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
	.menu .detail { font-size: 11px; opacity: 0.7; white-space: nowrap; }
	.menu hr { border: none; border-top: 1px solid var(--vscode-menu-separatorBackground, var(--vscode-widget-border)); margin: 4px 0; }
`;

/**
 * The script of the pickers and their menus, after askAnswerScript(): menu(), fillMenu(), and searchInPicker(), a
 * Search In with its menu.
 */
export function askMenuScript(): string {
	return `
	/**
	 * The menus of the pickers: each opens from its picker, upwards unless there is no room, moved sideways to stay
	 * within the page, and closes on a choice, a click elsewhere or Escape.
	 */
	const menus = [];
	function closeMenus() {
		for (const [button, box] of menus) {
			box.hidden = true;
			button.setAttribute('aria-expanded', 'false');
		}
	}
	function menu(button, box) {
		menus.push([button, box]);
		button.addEventListener('click', event => {
			event.stopPropagation();
			const opening = box.hidden;
			closeMenus();
			if (opening) {
				box.hidden = false;
				box.classList.toggle('down', button.getBoundingClientRect().top < box.offsetHeight + 8);
				box.style.left = '';
				const rect = box.getBoundingClientRect();
				const shift = Math.max(4 - rect.left, Math.min(0, window.innerWidth - 4 - rect.right));
				if (shift) { box.style.left = (box.offsetLeft + shift) + 'px'; }
				button.setAttribute('aria-expanded', 'true');
				(box.querySelector('.item .check:not(:empty)')?.parentElement ?? box.querySelector('.item'))?.focus();
			}
		});
	}
	document.addEventListener('click', closeMenus);
	document.addEventListener('keydown', event => {
		if (event.key === 'Escape') { closeMenus(); }
	});

	/** A menu's headings, lines and items, the chosen one checked; an item calls \`choose\` with its value, and one with \`tick\`, a box, keeps the menu open. */
	function fillMenu(box, entries, chosen, choose) {
		box.textContent = '';
		for (const entry of entries) {
			if (entry.line) {
				box.appendChild(element('hr'));
			} else if (entry.heading) {
				box.appendChild(element('div', 'heading', entry.heading));
			} else {
				const item = element('button', 'item');
				const ticking = entry.tick !== undefined;
				item.setAttribute('role', ticking ? 'menuitemcheckbox' : 'menuitem');
				if (ticking) { item.setAttribute('aria-checked', String(entry.tick)); }
				item.append(element('span', ticking ? 'check box' : 'check', (ticking ? entry.tick : entry.value === chosen) ? '\u2713' : ''), element('span', 'label', entry.label));
				if (entry.detail) { item.appendChild(element('span', 'detail', entry.detail)); }
				if (entry.title) { item.title = entry.title; }
				item.addEventListener('click', event => {
					event.stopPropagation();
					if (ticking) {
						const place = [...box.children].indexOf(item);
						choose(entry.value);
						box.children[place]?.focus();
					} else {
						closeMenus();
						choose(entry.value);
					}
				});
				box.appendChild(item);
			}
		}
	}

	/**
	 * A Search In on \`button\`, with its menu \`box\` and \`label\`, the choice it shows: Auto, any of the sources offered
	 * ticked, All Sources and, with \`none\`, None. \`changed\` is called with each choice made in the menu.
	 */
	function searchInPicker(button, box, label, none, changed) {
		let choice = [];
		let offered = [];
		menu(button, box);
		function render() {
			const all = choice[0] === SEARCH_ALL;
			const nothing = choice[0] === SEARCH_NONE;
			const ticked = offered.filter(source => all || choice.includes(source.value));
			label.textContent = !choice.length ? ANSWER_TEXT.automatic : all ? ANSWER_TEXT.all : nothing ? ANSWER_TEXT.none : ticked.length === 1 ? ticked[0].label : ANSWER_TEXT.sourcesCount.replace('{0}', ticked.length);
			button.title = !choice.length ? ANSWER_TEXT.automaticHint : nothing ? ANSWER_TEXT.noneHint : all ? '' : ticked.length === 1 ? ticked[0].title : ticked.map(source => source.label).join(', ');
			fillMenu(box, [
				{ value: SEARCH_NEAREST, label: ANSWER_TEXT.automatic, title: ANSWER_TEXT.automaticHint },
				{ line: true },
				...offered.map(source => ({ ...source, tick: ticked.includes(source) })),
				{ line: true },
				{ value: SEARCH_ALL, label: ANSWER_TEXT.all },
				...(none ? [{ value: SEARCH_NONE, label: ANSWER_TEXT.none, title: ANSWER_TEXT.noneHint }] : []),
			], choice.length ? choice[0] : SEARCH_NEAREST, value => {
				if (value === SEARCH_NEAREST) {
					choice = [];
				} else if (value === SEARCH_ALL || value === SEARCH_NONE) {
					choice = [value];
				} else {
					const values = ticked.map(source => source.value);
					const next = values.includes(value) ? values.filter(other => other !== value) : [...values, value];
					choice = next.length === offered.length ? [SEARCH_ALL] : next;
				}
				render();
				if (changed) { changed(choice); }
			});
		}
		/** The choice kept of \`value\`: what the sources offered have of it. */
		function kept(value) {
			return value.filter(other => other === SEARCH_ALL || (none && other === SEARCH_NONE) || offered.some(source => source.value === other));
		}
		return {
			choice: () => choice,
			/** Sets the choice, as kept before. */
			set(value) { choice = kept(value); render(); },
			/** Offers the sources of the collections \`names\`, as searchInSources() lists them. */
			offer(names) { offered = searchInSources(names); choice = kept(choice); render(); },
		};
	}
`;
}
