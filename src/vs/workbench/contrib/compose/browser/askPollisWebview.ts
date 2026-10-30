/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { dirname, joinPath } from '../../../../base/common/resources.js';
import { URI } from '../../../../base/common/uri.js';
import { localize } from '../../../../nls.js';
import { BrowserViewCommandId } from '../../../../platform/browserView/common/browserView.js';
import { ICommandService } from '../../../../platform/commands/common/commands.js';
import { AskPollisSource, ASK_SOURCE_COLLECTION, IAskPollisPassage, IAskPollisSearchResult } from '../common/askPollis.js';

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
		where: passage.page === null ? passage.menu : localize('askPollis.page', "page {0}", passage.page),
		heading: passage.heading,
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

/** Opens a passage in its document: the PDF at its page, the panel's wiki at its heading, the Julia Manual at its section, a package's docstring on its site. */
export function askOpenPassage(commandService: ICommandService, passage: IAskPollisPassage): void {
	if (passage.kind === 'wiki') {
		commandService.executeCommand('markdown.showPreview', URI.file(passage.file).with({ fragment: headingFragment(passage.heading) }));
	} else if (passage.kind === 'api' && passage.anchor) {
		commandService.executeCommand(BrowserViewCommandId.Open, passage.anchor);
	} else if (passage.anchor) {
		// The Julia Manual, in the HTML that comes with Julia, at the section or the docstring
		const [page, fragment] = passage.anchor.split('#');
		commandService.executeCommand(BrowserViewCommandId.Open, joinPath(dirname(URI.file(passage.file)), page).with({ fragment: fragment ?? '' }).toString(true));
	} else {
		// The PDF viewer of the integrated browser opens a PDF at the page of its #page=
		commandService.executeCommand(BrowserViewCommandId.Open, URI.file(passage.file).with({ fragment: passage.page === null ? '' : `page=${passage.page}` }).toString(true));
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
/** The collection of the Package APIs, as pollisPackageApis.ts names it, listed among the sources of Pollis, after the vignettes. */
const PACKAGE_APIS = 'Package APIs';
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
export function askSearchSources(choice: readonly string[]): readonly AskPollisSource[] | undefined {
	const sources = choice.filter(isSearchSource);
	return sources.length ? sources : undefined;
}

/** The collections a Search In's choice searches, of `all` those of the index; nothing for the nearest. */
export function askSearchIn(choice: readonly string[], all: readonly string[]): readonly string[] | undefined {
	return !choice.length ? undefined : choice.includes(SEARCH_ALL) ? all : [...new Set(choice.map(name => isSearchSource(name) ? ASK_SOURCE_COLLECTION[name] : name))];
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

	/** What a Search In can tick: each collection of \`names\`, Pollis and the Julia Manual as their sources, the Package APIs after the vignettes. */
	function searchInSources(names) {
		const hints = { juliaManual: ANSWER_TEXT.juliaManualHint, juliaLibrary: ANSWER_TEXT.juliaLibraryHint, ${JSON.stringify(PACKAGE_APIS)}: ANSWER_TEXT.packageApisHint };
		const packageApis = names.includes(${JSON.stringify(PACKAGE_APIS)}) ? [[${JSON.stringify(PACKAGE_APIS)}, ${JSON.stringify(PACKAGE_APIS)}]] : [];
		const pollisSources = Object.entries(ANSWER_TEXT.pollisSources).flatMap(source => source[0] === 'packageVignettes' ? [source, ...packageApis] : [source]);
		return names.flatMap(name => name === ${JSON.stringify(POLLIS)} ? pollisSources : name === ${JSON.stringify(JULIA_MANUAL)} ? Object.entries(ANSWER_TEXT.juliaSources) : name === ${JSON.stringify(PACKAGE_APIS)} ? [] : [[name, name]]).map(([value, label]) => ({ value, label, title: hints[value] ?? '' }));
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
