/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { DisposableStore } from '../../../../base/common/lifecycle.js';
import { localize, localize2 } from '../../../../nls.js';
import { Action2, registerAction2 } from '../../../../platform/actions/common/actions.js';
import { ICommandService } from '../../../../platform/commands/common/commands.js';
import { IFileService } from '../../../../platform/files/common/files.js';
import { ServicesAccessor } from '../../../../platform/instantiation/common/instantiation.js';
import { IQuickInputService, IQuickPickItem } from '../../../../platform/quickinput/common/quickInput.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
import { IPathService } from '../../../services/path/common/pathService.js';
import { WebviewInput } from '../../webviewPanel/browser/webviewEditorInput.js';
import { IWebviewWorkbenchService } from '../../webviewPanel/browser/webviewWorkbenchService.js';
import { ICitationCount, ReferenceLibrary, referenceVenue } from '../../model/browser/common/referenceLibrary.js';
import { OPEN_LINK_COMMAND_ID } from '../../monitor/browser/openLink.js';
import { FEWEST_ROWS, rowsChoiceCss, rowsChoiceScript, storedRows, storeRows } from '../../model/browser/webviews/webviewPager.js';

// Compose > Browse References: every work in PollisReferences (all_references), those of Pollis, those the user saved
// from Discover Literature or added to a panel, and the user's corrections, with their versions, latest citation counts and
// the panels whose References show them. Here the user removes a work of their own, undoes a correction, or shows a work
// in a panel's References; Discover Literature only finds and saves.

export const BROWSE_REFERENCES_COMMAND_ID = 'pollis.compose.browseReferences';

/** A work as the page lists it. */
interface IBrowsedWork {
	readonly key: string;
	readonly title: string;
	readonly authors: string;
	/** The first author's last name, to find possible duplicates. */
	readonly firstAuthor?: string;
	readonly year?: number;
	readonly venue?: string;
	readonly url?: string;
	readonly origin: 'pollis' | 'corrected' | 'user';
	readonly versions: readonly { readonly index: string; readonly kind: string; readonly url?: string }[];
	/** The latest count of each source: `OpenAlex 512 (2026-10-24)`. */
	readonly counts: readonly { readonly source: string; readonly count: number; readonly date: string }[];
	/** The titles of the panels whose References show it. */
	readonly panels: readonly string[];
	/** The keys of the works merged into it, which cite it too. */
	readonly alsoCitedAs: readonly string[];
	/** Its OpenAlex record, which becomes a version of the work kept if a merge drops its details. */
	readonly asVersion?: IBrowsedWork['versions'][number];
}

type BrowseMessage =
	| { readonly command: 'ready' }
	| { readonly command: 'rows'; readonly rows: number }
	| { readonly command: 'remove'; readonly key: string }
	| { readonly command: 'showInPanel'; readonly key: string }
	| { readonly command: 'merge'; readonly a: string; readonly b: string; readonly kept: string }
	| { readonly command: 'unmerge'; readonly key: string }
	| { readonly command: 'openUrl'; readonly url: string };

const SOURCE_NAMES: { readonly [source: string]: string } = { openalex: 'OpenAlex', semanticscholar: 'Semantic Scholar', crossref: 'Crossref' };

let openPage: WebviewInput | undefined;
let focusKeys: ((keys: readonly string[]) => Promise<void>) | undefined;

/** The latest count of each source among `counts`. */
function latestCounts(counts: readonly ICitationCount[]): IBrowsedWork['counts'] {
	const latest = new Map<string, ICitationCount>();
	for (const count of counts) {
		const other = latest.get(count.source);
		if (!other || count.date > other.date) {
			latest.set(count.source, count);
		}
	}
	return [...latest.values()].map(count => ({ source: SOURCE_NAMES[count.source] ?? count.source, count: count.count, date: count.date }));
}

function authorsLine(authors: readonly string[] | undefined): string {
	const surnames = (authors ?? []).map(author => author.split(',')[0].trim());
	return surnames.length > 3 ? `${surnames.slice(0, 3).join(', ')} et al.` : surnames.join(', ');
}

async function openBrowseReferences(accessor: ServicesAccessor, keys: readonly string[]): Promise<void> {
	const webviewWorkbenchService = accessor.get(IWebviewWorkbenchService);
	const commandService = accessor.get(ICommandService);
	const quickInputService = accessor.get(IQuickInputService);
	const storageService = accessor.get(IStorageService);
	const library = new ReferenceLibrary(accessor.get(IFileService), accessor.get(IPathService).userHome({ preferLocal: true }));

	if (openPage && !openPage.isDisposed()) {
		webviewWorkbenchService.revealWebview(openPage, openPage.group ?? -1, false);
		if (keys.length) {
			await focusKeys?.(keys);
		}
		return;
	}
	const title = localize('browseReferences.title', "Browse References");
	const webviewInput = webviewWorkbenchService.openWebview(
		{
			title,
			options: { retainContextWhenHidden: true },
			contentOptions: { allowScripts: true, localResourceRoots: [] },
			extension: undefined,
		},
		'pollis.browseReferences',
		title,
		undefined,
		{ group: undefined, preserveFocus: false }
	);
	webviewInput.webview.setHtml(pageHtml(storedRows(storageService, 'browseReferences', 40)));
	openPage = webviewInput;

	const disposables = new DisposableStore();
	disposables.add(webviewInput.webview.onDidDispose(() => {
		openPage = undefined;
		focusKeys = undefined;
		disposables.dispose();
	}));

	// The works to show once the page is ready
	let pendingKeys: readonly string[] | undefined = keys.length ? keys : undefined;

	const listWorks = async (): Promise<IBrowsedWork[]> => {
		const [all, counts, versions, choices, { panels }, aliases] = await Promise.all([library.allReferences(), library.counts(), library.versions(), library.allPanelChoices(), library.pollis(), library.aliases()]);
		const panelTitles = new Map(panels.map(panel => [panel.id, panel.title]));
		// The panels citing a work or a key merged into it
		const shown = new Map<string, Set<string>>();
		for (const panel of panels) {
			for (const citedKey of panel.keys) {
				const key = aliases.get(citedKey) ?? citedKey;
				shown.set(key, (shown.get(key) ?? new Set()).add(panel.id));
			}
		}
		for (const choice of choices) {
			const panelIds = shown.get(choice.key) ?? new Set();
			if (choice.shown) {
				panelIds.add(choice.panel);
			} else {
				panelIds.delete(choice.panel);
			}
			shown.set(choice.key, panelIds);
		}
		return all.map((work): IBrowsedWork => ({
			key: work.key,
			title: work.title,
			authors: authorsLine(work.authors),
			firstAuthor: work.authors?.[0]?.split(',')[0].trim() || undefined,
			year: work.year,
			venue: referenceVenue(work),
			url: work.doi ? `https://doi.org/${work.doi}` : work.url ?? work.oa_url,
			origin: work.origin,
			versions: versions.filter(version => version.key === work.key).map(version => ({ index: version.index, kind: version.kind, url: version.url })),
			counts: latestCounts(counts.filter(count => count.key === work.key)),
			panels: [...shown.get(work.key) ?? []].map(id => panelTitles.get(id) ?? id).sort(),
			alsoCitedAs: [...aliases].filter(([, key]) => key === work.key).map(([alias]) => alias).sort(),
			asVersion: work.openalex && !versions.some(version => version.record === work.openalex)
				? { index: 'openalex', kind: work.arxiv && !work.doi ? 'preprint' : 'published', url: work.doi ? `https://doi.org/${work.doi}` : work.url }
				: undefined,
		}));
	};
	const postWorks = async () => {
		webviewInput.webview.postMessage({ command: 'works', works: await listWorks(), focus: pendingKeys });
		pendingKeys = undefined;
	};
	focusKeys = async (keys: readonly string[]) => {
		pendingKeys = keys;
		await postWorks();
	};

	/** Shows the work `key` in the References of a panel the user picks. */
	const showInPanel = async (key: string) => {
		const { panels } = await library.pollis();
		const picked = await quickInputService.pick(
			panels.map((panel): IQuickPickItem & { id: string } => ({ id: panel.id, label: panel.title, description: panel.keys.includes(key) ? localize('browseReferences.cites', "cites it") : undefined }))
				.sort((a, b) => a.label.localeCompare(b.label)),
			{ placeHolder: localize('browseReferences.pickPanel', "The panel whose References should show this work"), matchOnDescription: true }
		);
		if (picked) {
			await library.choose(picked.id, key, true);
			await postWorks();
		}
	};

	disposables.add(webviewInput.webview.onMessage(async (e: { message: BrowseMessage }) => {
		const message = e.message;
		switch (message.command) {
			case 'ready':
				await postWorks();
				break;
			case 'remove': {
				const work = (await library.allReferences()).find(work => work.key === message.key);
				// The works merged into it become works of their own again
				for (const [alias, key] of await library.aliases()) {
					if (work?.origin === 'user' && key === work.key) {
						await library.unmerge(alias);
					}
				}
				if (work?.origin === 'user') {
					await library.removeWork(work.key);
				} else if (work?.origin === 'corrected') {
					await library.removeReference(work.key);
				}
				await postWorks();
				break;
			}
			case 'showInPanel':
				if (typeof message.key === 'string') {
					await showInPanel(message.key);
				}
				break;
			case 'merge':
				if (typeof message.a === 'string' && typeof message.b === 'string' && typeof message.kept === 'string') {
					await library.merge(message.a, message.b, message.kept);
					await postWorks();
				}
				break;
			case 'unmerge':
				if (typeof message.key === 'string') {
					await library.unmerge(message.key);
					await postWorks();
				}
				break;
			case 'rows':
				storeRows(storageService, 'browseReferences', message.rows);
				break;
			case 'openUrl':
				if (/^https?:\/\//.test(message.url)) {
					await commandService.executeCommand(OPEN_LINK_COMMAND_ID, message.url);
				}
				break;
		}
	}));
}

function pageHtml(rows: number): string {
	const text = {
		title: localize('browseReferences.title', "Browse References"),
		intro: localize('browseReferences.intro', "Every work in PollisReferences: those Pollis cites, those you saved from Discover Literature or added to a panel's References, and your corrections. Remove a work of yours, undo a correction, or show a work in a panel's References."),
		search: localize('browseReferences.search', "Search"),
		searchHint: localize('browseReferences.searchHint', "Words of the title, authors, venue or key"),
		show: localize('browseReferences.show', "Show"),
		all: localize('browseReferences.all', "All"),
		user: localize('browseReferences.user', "User"),
		corrected: localize('browseReferences.corrected', "Corrected"),
		pollis: localize('browseReferences.pollis', "Built-in"),
		origin: localize('browseReferences.origin', "Source"),
		userHint: localize('browseReferences.userHint', "A work you saved from Discover Literature or added to a panel's References"),
		correctedHint: localize('browseReferences.correctedHint', "A built-in work, as you corrected it"),
		pollisHint: localize('browseReferences.pollisHint', "A work that comes with Pollis"),
		year: localize('browseReferences.year', "Year"),
		work: localize('browseReferences.work', "Work"),
		key: localize('browseReferences.key', "Key"),
		counts: localize('browseReferences.counts', "Citations"),
		panels: localize('browseReferences.panels', "In Panels"),
		records: localize('browseReferences.records', "Records"),
		recordsHint: localize('browseReferences.recordsHint', "The records of this work in an index, saved from Discover Literature"),
		preprint: localize('browseReferences.preprint', "preprint"),
		workingPaper: localize('browseReferences.workingPaper', "working paper"),
		repository: localize('browseReferences.repository', "repository copy"),
		kindAt: localize('browseReferences.kindAt', "{0} at {1}"),
		remove: localize('browseReferences.remove', "Remove"),
		removeHint: localize('browseReferences.removeHint', "Delete this work of yours from your references, with its records and citation counts, and take it off the panels you added it to"),
		removeAsk: localize('browseReferences.removeAsk', "Remove it from your references?"),
		undoCorrection: localize('browseReferences.undoCorrection', "Undo Correction"),
		undoCorrectionHint: localize('browseReferences.undoCorrectionHint', "Go back to the work as Pollis has it, wherever it is cited"),
		undoAsk: localize('browseReferences.undoAsk', "Go back to Pollis' version?"),
		yes: localize('browseReferences.yes', "Yes"),
		cancel: localize('browseReferences.cancel', "Cancel"),
		showInPanel: localize('browseReferences.showInPanel', "Show in Panel..."),
		showInPanelHint: localize('browseReferences.showInPanelHint', "Add this work to the References of a panel"),
		duplicates: localize('browseReferences.duplicates', "Possible Duplicates"),
		duplicatesHint: localize('browseReferences.duplicatesHint', "Pairs of works that may be one: the same first author, years within two of each other, and similar titles or the same title, one with a subtitle"),
		duplicatesCount: localize('browseReferences.duplicatesCount', "Possible Duplicates ({0})"),
		noDuplicates: localize('browseReferences.noDuplicates', "No possible duplicates: no two works share a first author, years within two of each other, and similar titles or the same title, one with a subtitle."),
		close: localize('browseReferences.close', "Close"),
		closeHint: localize('browseReferences.closeHint', "Back to all the works"),
		merge: localize('browseReferences.merge', "Merge..."),
		mergeHint: localize('browseReferences.mergeHint', "Make one work of a pair of possible duplicates: you pick the one whose details to keep; it keeps the key that sorts first, and the other key becomes another key for it, so panels citing it find it"),
		keep: localize('browseReferences.keep', "Keep This One"),
		keepHint: localize('browseReferences.keepHint', "Keep the details of this work, under the key {0}; {1} becomes another key for it"),
		mergeAsk: localize('browseReferences.mergeAsk', "The pair, merged: make it one work like this?"),
		confirm: localize('browseReferences.confirm', "Confirm"),
		alsoCitedAs: localize('browseReferences.alsoCitedAs', "Also cited as {0}"),
		undoMerge: localize('browseReferences.undoMerge', "Undo Merge"),
		undoMergeHint: localize('browseReferences.undoMergeHint', "Make {0} a work of its own again, as it was before the merge"),
		undoMergeAsk: localize('browseReferences.undoMergeAsk', "Make {0} a work of its own again?"),
		none: localize('browseReferences.none', "No work matches."),
		sortHint: localize('browseReferences.sortHint', "Sort by this column; click again to reverse"),
		countsSortHint: localize('browseReferences.countsSortHint', "Sort by the largest count of the work's sources; click again to reverse"),
		count: localize('browseReferences.count', "{0} of {1} works"),
		previous: localize('browseReferences.previous', "Previous"),
		next: localize('browseReferences.next', "Next"),
		page: localize('browseReferences.page', "Page {0} of {1}"),
	};
	return `<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline';">
	<style>
		${rowsChoiceCss}
		* { box-sizing: border-box; }
		body { font-family: var(--vscode-font-family); font-size: 13px; margin: 0; color: var(--vscode-foreground); background-color: var(--vscode-editor-background); }
		.container { max-width: 1200px; margin: 0 auto; padding: 24px; }
		h1 { font-size: 32px; font-weight: 300; margin: 0 0 4px 0; line-height: 1.2; }
		.subtitle { font-size: 14px; color: var(--vscode-descriptionForeground); margin: 0 0 24px 0; line-height: 1.4; max-width: 900px; }
		[hidden] { display: none !important; }
		.toolbar { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin-bottom: 12px; }
		.toolbar .countNote { flex: 1; text-align: right; font-size: 12px; color: var(--vscode-descriptionForeground); }
		input[type="text"], select { font: inherit; color: var(--vscode-input-foreground); background: var(--vscode-input-background); border: 1px solid var(--vscode-input-border, var(--vscode-widget-border)); border-radius: 2px; padding: 4px 6px; }
		input:focus, select:focus { outline: 1px solid var(--vscode-focusBorder); outline-offset: -1px; }
		input#search { width: 360px; max-width: 100%; }
		button.action { font: inherit; color: var(--vscode-button-secondaryForeground); background: var(--vscode-button-secondaryBackground); border: none; border-radius: 2px; padding: 4px 12px; cursor: pointer; }
		button.action:hover { color: var(--vscode-button-foreground); background: var(--vscode-button-background); }
		/* As tall as the search field and the select beside them */
		.toolbar > button.action { align-self: stretch; }
		/* One action blue: the first at first, then the last enabled one the pointer was on */
		.toolbar > button.action.current { color: var(--vscode-button-foreground); background: var(--vscode-button-background); }
		button:disabled, button:disabled:hover { opacity: 0.5; cursor: default; color: var(--vscode-button-secondaryForeground); background: var(--vscode-button-secondaryBackground); }
		.link { color: var(--vscode-textLink-foreground); cursor: pointer; background: none; border: none; padding: 0; font: inherit; text-align: left; }
		.link:hover { text-decoration: underline; }
		table { width: 100%; border-collapse: collapse; font-size: 12px; }
		th { text-align: left; font-weight: normal; color: var(--vscode-descriptionForeground); padding: 4px 8px; border-bottom: 1px solid var(--vscode-widget-border); white-space: nowrap; }
		td { padding: 6px 8px; border-bottom: 1px solid var(--vscode-widget-border); vertical-align: top; }
		td.actions { white-space: nowrap; }
		td.key { font-family: var(--vscode-editor-font-family); white-space: nowrap; }
		tr.focused td { background: var(--vscode-editor-findMatchHighlightBackground); }
		.authors, .detail { color: var(--vscode-descriptionForeground); margin-top: 2px; }
		.ask { color: var(--vscode-descriptionForeground); }
		/* The pair as one work, before the merge is confirmed */
		tr.preview td { background: var(--vscode-diffEditor-insertedLineBackground, var(--vscode-editor-findMatchHighlightBackground)); }
		table { table-layout: fixed; }
		th.sortable { cursor: pointer; user-select: none; }
		/* The space between two pairs of possible duplicates */
		tr.pairGap td { height: 16px; padding: 0; border-bottom: 1px solid var(--vscode-widget-border); }
		.duplicatesClose { padding: 12px 8px; font-size: 12px; text-align: right; }
		th.sortable:hover { color: var(--vscode-foreground); }
		th.sorted { color: var(--vscode-foreground); }
		col.year { width: 48px; }
		col.key { width: 96px; }
		col.counts { width: 150px; }
		col.origin { width: 110px; }
		col.panels { width: 16%; }
		col.actions { width: 120px; }
		td.counts div { white-space: nowrap; }
		td.panels { overflow-wrap: anywhere; }
		.pager { display: flex; justify-content: center; align-items: center; gap: 16px; padding: 12px 8px; font-size: 12px; color: var(--vscode-descriptionForeground); }
		.pager .link { font-size: 12px; }
		.pager .link:disabled { color: var(--vscode-disabledForeground); cursor: default; text-decoration: none; }
		.empty { color: var(--vscode-descriptionForeground); padding: 12px 8px; }
	</style>
</head>
<body>
<div class="container">
	<h1>${text.title}</h1>
	<p class="subtitle">${text.intro}</p>
	<div class="toolbar">
		<input type="text" id="search" placeholder="${text.searchHint}" aria-label="${text.search}" spellcheck="false" autocomplete="off">
		<select id="origin" aria-label="${text.show}">
			<option value="all">${text.all}</option>
			<option value="user">${text.user}</option>
			<option value="corrected">${text.corrected}</option>
			<option value="pollis">${text.pollis}</option>
		</select>
		<button class="action current" id="duplicates" title="${text.duplicatesHint}">${text.duplicates}</button>
		<button class="action" id="merge" title="${text.mergeHint}">${text.merge}</button>
		<span class="countNote" id="countNote"></span>
	</div>
	<div class="pager" id="pagerTop" hidden></div>
	<table id="table">
		<colgroup><col class="year"><col class="work"><col class="key"><col class="counts"><col class="origin"><col class="panels"><col class="actions"></colgroup>
		<thead><tr><th class="sortable" data-sort="year" title="${text.sortHint}">${text.year}</th><th class="sortable" data-sort="work" title="${text.sortHint}">${text.work}</th><th class="sortable" data-sort="key" title="${text.sortHint}">${text.key}</th><th class="sortable" data-sort="counts" title="${text.countsSortHint}">${text.counts}</th><th class="sortable" data-sort="origin" title="${text.sortHint}">${text.origin}</th><th>${text.panels}</th><th></th></tr></thead>
		<tbody id="rows"></tbody>
	</table>
	<div class="empty" id="none" hidden>${text.none}</div>
	<div class="duplicatesClose" id="duplicatesClose" hidden><button class="link" id="closeDuplicates" title="${text.closeHint}">${text.close}</button></div>
	<div class="pager" id="pager" hidden></div>
</div>
<script>
	const vscode = acquireVsCodeApi();
	const TEXT = ${JSON.stringify(text)};
	// The rows of a page, as the user chose them: 0 for all
	let rows = ${rows};
	${rowsChoiceScript()}
	// Yours first, then corrections, then those of Pollis
	const ORIGIN_ORDER = { user: 0, corrected: 1, pollis: 2 };
	let works = [];
	let page = 0;
	// The column the works are sorted by, and whether reversed; none at first: yours, corrections, then those of Pollis
	let sortColumn;
	let sortDescending = false;
	// The works asked for, highlighted
	let focused = new Set();
	// The work whose row asks to confirm its removal or the undoing of its correction
	let confirming;
	// The pairs of works that may be one, found again whenever the works come
	let pairs = [];
	// Whether the table lists the works of the pairs alone, one pair after another, highlighted
	let showingDuplicates = false;
	// The first work listed of each pair, after which a gap is left
	let pairStarts = new Set();
	// The other work of the pair each work is listed with
	let partners = new Map();
	// Whether the works of the pairs offer Keep This One, to merge each pair
	let merging = false;
	// The pair shown as one work, before its merge is confirmed: the work kept and the other; the key whose row asks to confirm undoing its merge
	let mergePreview;
	let confirmingUnmerge;
	// Words that tell nothing of a title
	const STOP_WORDS = new Set(['a', 'an', 'the', 'of', 'and', 'in', 'on', 'for', 'to', 'with', 'by', 'from', 'at', 'as', 'its', 'is', 'are', 'or', 'via', 'using']);
	const searchElement = document.getElementById('search');
	const originElement = document.getElementById('origin');

	function format(template, ...values) {
		return template.replace(/\\{(\\d+)\\}/g, (match, index) => String(values[Number(index)]));
	}

	function matching() {
		if (showingDuplicates) {
			// Sorted by a column, the pairs by their first work, so that each pair stays together
			const ordered = sortColumn ? [...pairs].sort((x, y) => compare(x.a, y.a)) : pairs;
			const listed = new Set();
			pairStarts = new Set();
			partners = new Map();
			for (const pair of ordered) {
				const added = [pair.a, pair.b].filter(work => !listed.has(work));
				if (added.length) {
					pairStarts.add(added[0]);
				}
				for (const work of added) {
					listed.add(work);
					partners.set(work, work === pair.a ? pair.b : pair.a);
				}
			}
			return [...listed];
		}
		const words = searchElement.value.toLowerCase().split(/\\s+/).filter(word => word);
		const origin = originElement.value;
		// Several words that are all keys are a list of works, as See in References gives: any of them, not all
		const keysOf = work => [work.key, ...work.alsoCitedAs].map(key => key.toLowerCase());
		const keys = new Set(works.flatMap(keysOf));
		const anyKey = words.length > 1 && words.every(word => keys.has(word));
		return works.filter(work => (origin === 'all' || work.origin === origin)
			&& (anyKey ? keysOf(work).some(key => words.includes(key)) : words.every(word => [work.title, work.authors, work.venue ?? '', ...keysOf(work)].join(' ').toLowerCase().includes(word))))
			.sort((a, b) => compare(a, b) || ORIGIN_ORDER[a.origin] - ORIGIN_ORDER[b.origin] || a.key.localeCompare(b.key));
	}

	/** The order of two works by the column sorted by; works without a year or a count last, either way. */
	function compare(a, b) {
		if (!sortColumn) {
			return 0;
		}
		const value = work => sortColumn === 'year' ? work.year
			: sortColumn === 'work' ? work.title.toLowerCase()
			: sortColumn === 'key' ? work.key.toLowerCase()
			: sortColumn === 'counts' ? (work.counts.length ? Math.max(...work.counts.map(count => count.count)) : undefined)
			: ORIGIN_ORDER[work.origin];
		const x = value(a), y = value(b);
		if (x === undefined || y === undefined) {
			return x === y ? 0 : x === undefined ? 1 : -1;
		}
		const order = typeof x === 'string' ? x.localeCompare(y) : x - y;
		return sortDescending ? -order : order;
	}

	function setSort(column) {
		// Years and counts largest first, words from A
		sortDescending = sortColumn === column ? !sortDescending : column === 'year' || column === 'counts';
		sortColumn = column;
		page = 0;
		for (const header of document.querySelectorAll('th.sortable')) {
			const label = header.textContent.replace(/ [\\u2191\\u2193]$/, '');
			header.classList.toggle('sorted', header.dataset.sort === column);
			header.textContent = header.dataset.sort === column ? label + (sortDescending ? ' \\u2193' : ' \\u2191') : label;
		}
		render();
	}

	/** A name or title in lower case, without accents or punctuation. */
	function plain(text) {
		return (text || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
	}

	/** A title as \`plain\` writes it, British spellings written as American ones: optimisation as optimization, analyse as analyze. */
	function plainTitle(title) {
		return plain(title).split(' ').map(word => word.replace(/isation/g, 'ization').replace(/is(e|es|ed|er|ers|ing)$/, 'iz$1').replace(/ys(e|es|ed|er|ers|ing)$/, 'yz$1')).join(' ');
	}

	/**
	 * Whether two titles are the same but for a subtitle one of them has: the other is what comes before a colon, a dash, or
	 * a full stop, question or exclamation mark in it (An Introduction to Agent-Based Modeling: Modeling Natural...), not
	 * merely its start (Statistical Bootstrapping in Julia).
	 */
	function withSubtitle(a, b) {
		const [shorter, longer] = a.length <= b.length ? [a, b] : [b, a];
		const main = plainTitle(shorter);
		if (!main || main === plainTitle(longer)) {
			return false;
		}
		for (const mark of longer.matchAll(/\\s*[:\\u2013\\u2014]\\s+|\\s+-\\s+|[.?!]\\s+/g)) {
			if (plainTitle(longer.slice(0, mark.index)) === main) {
				return true;
			}
		}
		return false;
	}

	/** How alike two titles are, from 0 to 1: the share of their telling words in common (Dice). */
	function titleLikeness(a, b) {
		const x = plainTitle(a), y = plainTitle(b);
		const words = text => new Set(text.split(' ').filter(word => word && !STOP_WORDS.has(word)));
		const wordsA = words(x), wordsB = words(y);
		if (!wordsA.size || !wordsB.size) {
			return 0;
		}
		let shared = 0;
		for (const word of wordsA) {
			if (wordsB.has(word)) {
				shared++;
			}
		}
		return 2 * shared / (wordsA.size + wordsB.size);
	}

	/**
	 * The pairs of works with the same first author, years within two of each other, and titles at least 70% alike or the
	 * same but for a subtitle: the most alike first, those with a subtitle after those 100% alike.
	 */
	function findPairs() {
		const byAuthor = new Map();
		for (const work of works) {
			const author = plain(work.firstAuthor);
			if (author) {
				byAuthor.set(author, [...(byAuthor.get(author) || []), work]);
			}
		}
		const found = [];
		for (const group of byAuthor.values()) {
			for (let i = 0; i < group.length; i++) {
				for (let j = i + 1; j < group.length; j++) {
					const a = group[i], b = group[j];
					if (a.year !== undefined && b.year !== undefined && Math.abs(a.year - b.year) > 2) {
						continue;
					}
					const subtitle = withSubtitle(a.title, b.title);
					const likeness = titleLikeness(a.title, b.title);
					if (subtitle || likeness >= 0.7) {
						found.push({ a, b, likeness, subtitle });
					}
				}
			}
		}
		const rank = pair => pair.likeness === 1 ? 2 : pair.subtitle ? 1 : pair.likeness - 1;
		return found.sort((x, y) => rank(y) - rank(x) || y.likeness - x.likeness || x.a.key.localeCompare(y.a.key));
	}

	function renderPairs() {
		document.getElementById('duplicates').textContent = format(TEXT.duplicatesCount, pairs.length);
		// No pairs, nothing to show or merge: no blue button, until there are pairs again and the first is blue
		document.getElementById('duplicates').disabled = !pairs.length && !showingDuplicates;
		document.getElementById('merge').disabled = !pairs.length;
		const toolbar = document.querySelector('.toolbar');
		const current = toolbar.querySelector('button.action.current');
		if (current?.disabled) {
			current.classList.remove('current');
		}
		if (!toolbar.querySelector('button.action.current')) {
			toolbar.querySelector('button.action:not(:disabled)')?.classList.add('current');
		}
	}

	/** Lists the works of the pairs alone in the table, or all the works again. */
	function showDuplicates(show) {
		showingDuplicates = show;
		merging = merging && show;
		mergePreview = undefined;
		if (show) {
			searchElement.value = '';
			originElement.value = 'all';
			focused = new Set();
		}
		page = 0;
		renderPairs();
		render();
	}

	function linkButton(label, onClick, hint) {
		const button = document.createElement('button');
		button.className = 'link';
		button.textContent = label;
		if (hint) {
			button.title = hint;
		}
		button.addEventListener('click', onClick);
		return button;
	}

	function workCell(work, preview) {
		const cell = document.createElement('td');
		if (work.url) {
			cell.appendChild(linkButton(work.title, () => vscode.postMessage({ command: 'openUrl', url: work.url }), work.url));
		} else {
			cell.append(work.title);
		}
		const authors = document.createElement('div');
		authors.className = 'authors';
		authors.textContent = [work.authors, work.venue].filter(part => part).join(' \\u00b7 ');
		cell.appendChild(authors);
		if (work.versions.length) {
			const versions = document.createElement('div');
			versions.className = 'detail';
			versions.title = TEXT.recordsHint;
			versions.append(TEXT.records + ': ');
			work.versions.forEach((version, index) => {
				if (index) {
					versions.append(', ');
				}
				// The kind only when the record is not the published article: preprint at Semantic Scholar
				const indexName = version.index === 'openalex' ? 'OpenAlex' : 'Semantic Scholar';
				const label = TEXT[version.kind] ? format(TEXT.kindAt, TEXT[version.kind], indexName) : indexName;
				versions.append(version.url ? linkButton(label, () => vscode.postMessage({ command: 'openUrl', url: version.url }), version.url) : label);
			});
			cell.appendChild(versions);
		}
		// The keys merged into it, each with Undo Merge, asked first
		for (const alias of work.alsoCitedAs) {
			const line = document.createElement('div');
			line.className = 'detail';
			if (preview) {
				line.textContent = format(TEXT.alsoCitedAs, alias);
			} else if (confirmingUnmerge === alias) {
				line.append(format(TEXT.undoMergeAsk, alias) + ' ', linkButton(TEXT.yes, () => {
					confirmingUnmerge = undefined;
					vscode.postMessage({ command: 'unmerge', key: alias });
				}), ' \u00b7 ', linkButton(TEXT.cancel, () => {
					confirmingUnmerge = undefined;
					render();
				}));
			} else {
				line.append(format(TEXT.alsoCitedAs, alias) + ' \u00b7 ', linkButton(TEXT.undoMerge, () => { confirmingUnmerge = alias; render(); }, format(TEXT.undoMergeHint, alias)));
			}
			cell.appendChild(line);
		}
		return cell;
	}

	/** Where the work comes from and, under User or Corrected, what may be undone: Remove or Undo Correction, asked first. */
	function originCell(work) {
		const cell = document.createElement('td');
		const label = document.createElement('div');
		label.textContent = TEXT[work.origin];
		label.title = TEXT[work.origin + 'Hint'];
		cell.appendChild(label);
		if (work.origin === 'pollis' || work.preview) {
			return cell;
		}
		const line = document.createElement('div');
		if (confirming === work.key) {
			const ask = document.createElement('div');
			ask.className = 'ask';
			ask.textContent = work.origin === 'user' ? TEXT.removeAsk : TEXT.undoAsk;
			line.append(ask, linkButton(TEXT.yes, () => {
				confirming = undefined;
				// The others of a list of works, as See in References gives, stay listed
				const key = work.key.toLowerCase();
				searchElement.value = searchElement.value.split(/\\s+/).filter(word => word && word.toLowerCase() !== key).join(' ');
				focused.delete(work.key);
				vscode.postMessage({ command: 'remove', key: work.key });
			}), ' \\u00b7 ', linkButton(TEXT.cancel, () => {
				confirming = undefined;
				render();
			}));
		} else {
			line.appendChild(work.origin === 'user'
				? linkButton(TEXT.remove, () => { confirming = work.key; render(); }, TEXT.removeHint)
				: linkButton(TEXT.undoCorrection, () => { confirming = work.key; render(); }, TEXT.undoCorrectionHint));
		}
		cell.appendChild(line);
		return cell;
	}

	function actionsCell(work) {
		const cell = document.createElement('td');
		cell.className = 'actions';
		if (work.preview) {
			const ask = document.createElement('div');
			ask.className = 'ask';
			ask.textContent = TEXT.mergeAsk;
			const { kept, other } = mergePreview;
			cell.append(ask, linkButton(TEXT.confirm, () => {
				mergePreview = undefined;
				vscode.postMessage({ command: 'merge', a: kept.key, b: other.key, kept: kept.key });
			}), ' \u00b7 ', linkButton(TEXT.cancel, () => {
				mergePreview = undefined;
				render();
			}));
			return cell;
		}
		const partner = showingDuplicates && merging ? partners.get(work) : undefined;
		if (partner) {
			// The key that sorts first stays, whichever work is kept
			const [first, second] = work.key < partner.key ? [work.key, partner.key] : [partner.key, work.key];
			const line = document.createElement('div');
			line.appendChild(linkButton(TEXT.keep, () => { mergePreview = { kept: work, other: partner }; render(); }, format(TEXT.keepHint, first, second)));
			cell.appendChild(line);
		}
		cell.appendChild(linkButton(TEXT.showInPanel, () => vscode.postMessage({ command: 'showInPanel', key: work.key }), TEXT.showInPanelHint));
		return cell;
	}

	/**
	 * The work the merge of the pair in mergePreview would make, as the library saves it: the details of the work kept,
	 * under the key that sorts first, the other key and the keys merged into either as other keys, the records, counts and
	 * panels of both, and the record of the work whose details go as a version.
	 */
	function mergedWork() {
		const { kept, other } = mergePreview;
		const [survivor, alias] = kept.key < other.key ? [kept, other] : [other, kept];
		const dropped = kept === survivor ? alias : survivor;
		const counts = new Map();
		for (const count of [...kept.counts, ...other.counts]) {
			if (!counts.has(count.source) || count.date > counts.get(count.source).date) {
				counts.set(count.source, count);
			}
		}
		return {
			...kept,
			key: survivor.key,
			origin: kept === survivor ? survivor.origin : survivor.origin === 'user' ? 'user' : 'corrected',
			versions: [...kept.versions, ...other.versions, ...dropped.asVersion ? [dropped.asVersion] : []],
			counts: [...counts.values()],
			panels: [...new Set([...kept.panels, ...other.panels])].sort(),
			alsoCitedAs: [alias.key, ...kept.alsoCitedAs, ...other.alsoCitedAs].sort(),
			preview: true,
		};
	}

	function render() {
		const shown = matching();
		const size = rowsPerPage(rows, shown.length);
		const pages = Math.max(1, Math.ceil(shown.length / size));
		page = Math.min(page, pages - 1);
		const body = document.getElementById('rows');
		body.textContent = '';
		for (const listed of shown.slice(page * size, (page + 1) * size)) {
			// The pair being merged, as the one work it would become, in the place of its first row
			const previewing = showingDuplicates && mergePreview && (listed === mergePreview.kept || listed === mergePreview.other);
			if (previewing && body.querySelector('tr.preview')) {
				continue;
			}
			const work = previewing ? mergedWork() : listed;
			if (showingDuplicates && pairStarts.has(listed) && body.childElementCount) {
				const gap = document.createElement('tr');
				gap.className = 'pairGap';
				gap.appendChild(document.createElement('td')).colSpan = 7;
				body.appendChild(gap);
			}
			const row = document.createElement('tr');
			if (showingDuplicates || focused.has(work.key)) {
				row.className = previewing ? 'focused preview' : 'focused';
				if (!document.getElementById('focusedRow')) {
					row.id = 'focusedRow';
				}
			}
			const year = document.createElement('td');
			year.textContent = work.year ?? '';
			const key = document.createElement('td');
			key.className = 'key';
			key.textContent = work.key;
			// One source a line: OpenAlex: 316, dated in its tooltip
			const counts = document.createElement('td');
			counts.className = 'counts';
			for (const count of work.counts) {
				const line = document.createElement('div');
				line.textContent = count.source + ': ' + count.count;
				line.title = count.date;
				counts.appendChild(line);
			}
			const panels = document.createElement('td');
			panels.className = 'panels';
			panels.textContent = work.panels.join(', ');
			row.append(year, workCell(work, previewing), key, counts, originCell(work), panels, actionsCell(work));
			body.appendChild(row);
		}
		document.getElementById('table').hidden = shown.length === 0;
		document.getElementById('none').hidden = shown.length > 0;
		document.getElementById('none').textContent = showingDuplicates ? TEXT.noDuplicates : TEXT.none;
		document.getElementById('duplicatesClose').hidden = !showingDuplicates;
		document.getElementById('countNote').textContent = format(TEXT.count, shown.length, works.length);
		// The same pager above the works and under them, with the Rows choice while there are more than the fewest rows
		for (const pager of [document.getElementById('pagerTop'), document.getElementById('pager')]) {
			pager.textContent = '';
			pager.hidden = shown.length <= ${FEWEST_ROWS};
			if (pages > 1) {
				const turn = (label, to) => {
					const button = document.createElement('button');
					button.className = 'link';
					button.textContent = label;
					button.disabled = to < 0 || to >= pages;
					button.addEventListener('click', () => { page = to; render(); });
					return button;
				};
				const position = document.createElement('span');
				position.textContent = format(TEXT.page, page + 1, pages);
				pager.append(turn(TEXT.previous, page - 1), position, turn(TEXT.next, page + 1));
			}
			pager.append(rowsChoice(rows, chosen => {
				page = firstPageAfter(page, rows, chosen);
				rows = chosen;
				vscode.postMessage({ command: 'rows', rows });
				render();
			}));
		}
	}

	// Searching or choosing a source lists all the works again
	searchElement.addEventListener('input', () => { showingDuplicates = merging = false; page = 0; render(); });
	originElement.addEventListener('change', () => { showingDuplicates = merging = false; page = 0; render(); });
	for (const header of document.querySelectorAll('th.sortable')) {
		header.addEventListener('click', () => setSort(header.dataset.sort));
	}
	const toolbar = document.querySelector('.toolbar');
	toolbar.addEventListener('mouseover', event => {
		const button = event.target.closest('button.action');
		if (button && !button.disabled && !button.classList.contains('current')) {
			toolbar.querySelector('button.current')?.classList.remove('current');
			button.classList.add('current');
		}
	});
	document.getElementById('duplicates').addEventListener('click', () => showDuplicates(!showingDuplicates));
	// The pairs, each work offering Keep This One; again, the pairs alone
	document.getElementById('merge').addEventListener('click', () => {
		merging = !(showingDuplicates && merging);
		if (showingDuplicates) {
			mergePreview = undefined;
			render();
		} else {
			showDuplicates(true);
		}
	});
	document.getElementById('closeDuplicates').addEventListener('click', () => showDuplicates(false));
	// What another page saved shows when this one is back in front
	window.addEventListener('focus', () => vscode.postMessage({ command: 'ready' }));

	window.addEventListener('message', event => {
		const message = event.data;
		if (message.command === 'works') {
			works = message.works;
			pairs = findPairs();
			renderPairs();
			if (message.focus) {
				// The works asked for, alone in the list
				showingDuplicates = merging = false;
				focused = new Set(message.focus);
				originElement.value = 'all';
				searchElement.value = message.focus.join(' ');
				page = 0;
			}
			render();
			document.getElementById('focusedRow')?.scrollIntoView({ block: 'center' });
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
			id: BROWSE_REFERENCES_COMMAND_ID,
			title: localize2('browseReferences.open', "Browse References"),
			category: localize2('compose.category', "Compose"),
			f1: true,
		});
	}
	/** `keys`: the work, or works, to show alone. */
	run(accessor: ServicesAccessor, keys?: unknown): Promise<void> {
		const list = typeof keys === 'string' ? [keys] : Array.isArray(keys) ? keys.filter((key): key is string => typeof key === 'string') : [];
		return openBrowseReferences(accessor, list);
	}
});
