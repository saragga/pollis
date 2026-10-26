/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { DisposableStore } from '../../../../base/common/lifecycle.js';
import { localize, localize2 } from '../../../../nls.js';
import { Action2, registerAction2 } from '../../../../platform/actions/common/actions.js';
import { ICommandService } from '../../../../platform/commands/common/commands.js';
import { ServicesAccessor } from '../../../../platform/instantiation/common/instantiation.js';
import { IQuickInputService } from '../../../../platform/quickinput/common/quickInput.js';
import { WebviewInput } from '../../webviewPanel/browser/webviewEditorInput.js';
import { IWebviewWorkbenchService } from '../../webviewPanel/browser/webviewWorkbenchService.js';
import { describeItems, IAlertsService } from './alertsService.js';
import { describeRelease, FOMC_FEED, fomcRelease } from './fomcReleases.js';
import { COVERAGE_SOURCES, CoverageMarks, CoverageSource, IMediaCoverageRequest, IMediaCoverageService, KEY_PAGES, KEYED_SOURCES, KeyedSource } from './mediaCoverageService.js';
import { OPEN_LINK_COMMAND_ID } from './openLink.js';
import { IRssFeedsService } from './rssFeedsService.js';
import { voiceButtonsCss, voiceButtonsHtml, voiceButtonsScript } from '../../model/browser/webviews/webviewScaffold.js';

// Explore > Media Coverage: words over any period: how many news articles there were, by hour, day or week, with the
// FOMC's releases, a ticker's SEC filings or a time of the user's marked; and the articles, newest first, which open in
// the internal browser. An event study's event opens it on the news around the event.

export const SHOW_MEDIA_COVERAGE_COMMAND_ID = 'pollis.mediaCoverage.show';

type CoverageMessage =
	| { readonly command: 'ready' }
	| { readonly command: 'search'; readonly words: string; readonly ticker: string; readonly start: number; readonly end: number; readonly marks: CoverageMarks; readonly time?: number }
	| { readonly command: 'setSources'; readonly sources: readonly CoverageSource[] }
	| { readonly command: 'setKey'; readonly source: KeyedSource }
	| { readonly command: 'getKey'; readonly source: KeyedSource }
	| { readonly command: 'openUrl'; readonly url: string };

const DAY = 24 * 60 * 60 * 1000;
const MARKS: readonly CoverageMarks[] = ['none', 'fomc', 'filings', 'time'];

let openPage: { readonly input: WebviewInput; readonly show: (request: IMediaCoverageRequest | undefined) => void } | undefined;

function sourceName(source: CoverageSource): string {
	switch (source) {
		case 'googleNews': return 'Google News';
		case 'yahoo': return 'Yahoo Finance';
		case 'newYorkTimes': return 'The New York Times';
		case 'guardian': return 'The Guardian';
		case 'prNewswire': return 'PR Newswire';
	}
}

/** A mark on the chart: a filing, a release or the user's time. */
interface ICoverageMark {
	readonly time: number;
	readonly label: string;
	readonly description: string;
	readonly url?: string;
}

function openMediaCoveragePage(accessor: ServicesAccessor, request: IMediaCoverageRequest | undefined): void {
	const webviewWorkbenchService = accessor.get(IWebviewWorkbenchService);
	const mediaCoverageService = accessor.get(IMediaCoverageService);
	const alertsService = accessor.get(IAlertsService);
	const rssFeedsService = accessor.get(IRssFeedsService);
	const commandService = accessor.get(ICommandService);
	const quickInputService = accessor.get(IQuickInputService);

	if (openPage && !openPage.input.isDisposed()) {
		webviewWorkbenchService.revealWebview(openPage.input, openPage.input.group ?? -1, false);
		openPage.show(request);
		return;
	}
	const title = localize('mediaCoverage.title', "Media Coverage");
	const webviewInput = webviewWorkbenchService.openWebview(
		{
			title,
			options: { retainContextWhenHidden: true },
			contentOptions: { allowScripts: true, localResourceRoots: [] },
			extension: undefined,
		},
		'pollis.mediaCoverage',
		title,
		undefined,
		{ group: undefined, preserveFocus: false }
	);
	webviewInput.webview.setHtml(pageHtml());

	const disposables = new DisposableStore();
	disposables.add(webviewInput.webview.onDidDispose(() => {
		openPage = undefined;
		disposables.dispose();
	}));

	let ready = false;
	let pending = request;
	// Only the latest search's answer is shown
	let searchId = 0;
	const show = (request: IMediaCoverageRequest | undefined) => {
		if (!request) {
			return;
		}
		if (ready) {
			webviewInput.webview.postMessage({ command: 'show', request });
		} else {
			pending = request;
		}
	};
	openPage = { input: webviewInput, show };
	const postSources = async () => {
		const keys = await Promise.all(KEYED_SOURCES.map(async source => [source, await mediaCoverageService.hasKey(source)] as const));
		webviewInput.webview.postMessage({ command: 'sources', sources: mediaCoverageService.getSources(), keys: Object.fromEntries(keys) });
	};

	/** The marks over the period: the ticker's SEC filings, the FOMC's releases in the Federal Reserve's feed, or the user's time. */
	const getMarks = async (marks: CoverageMarks, ticker: string, time: number | undefined, start: number, end: number): Promise<ICoverageMark[]> => {
		const when = (mark: ICoverageMark) => mark.time >= start && mark.time <= end;
		switch (marks) {
			case 'filings': {
				const filer = ticker ? await alertsService.getFiler(ticker) : undefined;
				return (filer?.filings ?? [])
					.map(filing => ({ time: filing.accepted ? Date.parse(filing.accepted) : Date.parse(filing.filed), label: filing.items?.length ? `${filing.form} ${filing.items.join(', ')}` : filing.form, description: describeItems(filing.items) ?? filing.description ?? filing.form, url: filing.url }))
					.filter(when);
			}
			case 'fomc':
				return (await rssFeedsService.previewFeed(FOMC_FEED) ?? [])
					.filter(item => item.date)
					.map(item => ({ time: item.date, label: describeRelease(fomcRelease(item.title)), description: item.title, url: item.link }))
					.filter(when);
			case 'time':
				return time !== undefined ? [{ time, label: localize('mediaCoverage.markedTime', "Event"), description: new Date(time).toLocaleString() }].filter(when) : [];
			case 'none':
				return [];
		}
	};

	disposables.add(webviewInput.webview.onMessage(async (e: { message: CoverageMessage }) => {
		const message = e.message;
		switch (message.command) {
			case 'ready':
				ready = true;
				await postSources();
				show(pending);
				pending = undefined;
				break;
			case 'setSources':
				mediaCoverageService.setSources(message.sources.filter(source => COVERAGE_SOURCES.includes(source)));
				break;
			case 'setKey': {
				if (!KEYED_SOURCES.includes(message.source)) {
					break;
				}
				const key = await quickInputService.input({
					password: true,
					title: localize('mediaCoverage.keyTitle', "{0}: API Key", sourceName(message.source)),
					prompt: localize('mediaCoverage.keyPrompt', "Kept in the system's keychain. Leave it empty to forget the key."),
					ignoreFocusLost: true,
				});
				if (key !== undefined) {
					await mediaCoverageService.setKey(message.source, key);
					await postSources();
				}
				break;
			}
			case 'getKey':
				if (KEYED_SOURCES.includes(message.source)) {
					await commandService.executeCommand(OPEN_LINK_COMMAND_ID, KEY_PAGES[message.source]);
				}
				break;
			case 'search': {
				const id = ++searchId;
				const end = Math.min(Date.now(), message.end);
				const start = Math.min(message.start, end - DAY / 24);
				const ticker = message.ticker.trim().toUpperCase();
				const marks = MARKS.includes(message.marks) ? message.marks : 'none';
				const [coverage, marked] = await Promise.all([
					mediaCoverageService.getCoverage({ words: message.words, ticker, start, end, sources: mediaCoverageService.getSources() }),
					getMarks(marks, ticker, message.time, start, end),
				]);
				if (id !== searchId) {
					return;
				}
				const labelOptions: Intl.DateTimeFormatOptions = coverage.bucket < DAY ? { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' } : { day: 'numeric', month: 'short', year: 'numeric' };
				webviewInput.webview.postMessage({
					command: 'coverage',
					bucket: coverage.bucket,
					times: coverage.times,
					labels: coverage.times.map(time => new Date(time).toLocaleString(undefined, labelOptions)),
					articles: coverage.articles,
					marks: marked,
					items: coverage.items.map(item => ({
						source: sourceName(item.source),
						title: item.title,
						outlet: item.outlet,
						time: item.time,
						when: new Date(item.time).toLocaleString(undefined, { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
						url: item.url,
					})),
					failed: coverage.failed.map(sourceName),
					noKey: coverage.noKey.map(sourceName),
					counts: coverage.counts.map(count => localize('mediaCoverage.count', "{0}: {1} of {2} articles listed.", sourceName(count.source), count.listed.toLocaleString(), count.total.toLocaleString())),
				});
				break;
			}
			case 'openUrl':
				if (/^https?:\/\//.test(message.url)) {
					await commandService.executeCommand(OPEN_LINK_COMMAND_ID, message.url);
				}
				break;
		}
	}));
}

function pageHtml(): string {
	const text = {
		title: localize('mediaCoverage.title', "Media Coverage"),
		intro: localize('mediaCoverage.intro', "What the news said about a company, an institution or a subject over a period: how many articles there were, with the FOMC's releases, a company's SEC filings or a time of your own marked. Pollis shows headlines and links only; the articles open in the internal browser."),
		sourcesLabel: localize('mediaCoverage.sourcesLabel', "Sources"),
		sourceNames: Object.fromEntries(COVERAGE_SOURCES.map(source => [source, sourceName(source)])),
		googleNewsHint: localize('mediaCoverage.googleNewsHint', "Papers and sites the world over, among them those with no search of their own, such as The Washington Post and The Times."),
		yahooHint: localize('mediaCoverage.yahooHint', "The latest headlines of the ticker, such as AAPL; it also gives the SEC filings marked."),
		ticker: localize('mediaCoverage.ticker', "Ticker"),
		keyedHint: localize('mediaCoverage.keyedHint', "Searched with your own free key, kept in the system's keychain."),
		setKey: localize('mediaCoverage.setKey', "Set Key..."),
		changeKey: localize('mediaCoverage.changeKey', "Change Key..."),
		getKey: localize('mediaCoverage.getKey', "Get a Free Key"),
		noKeySet: localize('mediaCoverage.noKeySet', "No key set."),
		prNewswireHint: localize('mediaCoverage.prNewswireHint', "It's a paid distribution service: companies and organisations pay it to put out their own press releases, unedited. Most of them are corporate (results, deals, dividends, products), but they cover every sector, from health to technology to entertainment."),
		prNewswireLimit: localize('mediaCoverage.prNewswireLimit', "Its feeds list only its latest releases: Pollis reads them every 10 minutes while PR Newswire is ticked, so a search finds only the releases out since it was ticked."),
		noKey: localize('mediaCoverage.noKey', "No key set: {0}."),
		words: localize('mediaCoverage.words', "Words"),
		wordsHint: localize('mediaCoverage.wordsHint', "What the articles must have. Quotes keep a phrase together (\"Apple Inc\"); OR between words takes any, in parentheses: (iPhone OR iPad)."),
		period: localize('mediaCoverage.period', "Period"),
		day1: localize('mediaCoverage.day1', "Last 24 Hours"),
		day3: localize('mediaCoverage.day3', "Last 3 Days"),
		day7: localize('mediaCoverage.day7', "Last 7 Days"),
		day30: localize('mediaCoverage.day30', "Last 30 Days"),
		day90: localize('mediaCoverage.day90', "Last 90 Days"),
		day365: localize('mediaCoverage.day365', "Last Year"),
		custom: localize('mediaCoverage.custom', "From a Day to a Day"),
		from: localize('mediaCoverage.from', "From"),
		to: localize('mediaCoverage.to', "To"),
		marks: localize('mediaCoverage.marks', "Mark"),
		markNone: localize('mediaCoverage.markNone', "Nothing"),
		markFomc: localize('mediaCoverage.markFomc', "FOMC Releases"),
		markFilings: localize('mediaCoverage.markFilings', "SEC Filings of the Ticker"),
		markTime: localize('mediaCoverage.markTime', "A Time"),
		marksHint: localize('mediaCoverage.marksHint', "FOMC releases come from the Federal Reserve's Monetary Policy Press Releases feed, which lists about the last year; SEC filings need the ticker in Yahoo Finance's row."),
		search: localize('mediaCoverage.search', "Search"),
		searching: localize('mediaCoverage.searching', "Searching..."),
		coverage: localize('mediaCoverage.coverage', "Coverage"),
		summary: localize('mediaCoverage.summary', "{0} news articles."),
		failed: localize('mediaCoverage.failed', "Not reached: {0}."),
		articles: localize('mediaCoverage.articles', "News Articles"),
		chartHint: localize('mediaCoverage.chartHint', "The articles listed below, by hour up to 3 days, by day up to half a year, else by week. Click a bar to list its articles; dashed lines are the marks."),
		showAll: localize('mediaCoverage.showAll', "Show the Whole Period"),
		items: localize('mediaCoverage.items', "Articles"),
		noItems: localize('mediaCoverage.noItems', "Nothing found."),
		when: localize('mediaCoverage.when', "When"),
		outlet: localize('mediaCoverage.outlet', "From"),
		headline: localize('mediaCoverage.headline', "Headline"),
		source: localize('mediaCoverage.source', "Source"),
		sources: localize('mediaCoverage.sources', "Google News and Yahoo Finance are shown only, for personal reading; Google News lists at most 100 articles a search, so a long period has gaps. The New York Times lists 10 articles a request, at most 5 requests a minute: Pollis asks for the newest 50. The Guardian lists 200 a request: Pollis asks for the newest 1,000."),
	};
	return `<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline';">
	<style>
		${voiceButtonsCss}
		* { box-sizing: border-box; }
		body { font-family: var(--vscode-font-family); font-size: 13px; margin: 0; color: var(--vscode-foreground); background-color: var(--vscode-editor-background); }
		.container { max-width: 1100px; margin: 0 auto; padding: 24px; }
		h1 { font-size: 32px; font-weight: 300; margin: 0 0 4px 0; line-height: 1.2; }
		h2 { font-size: 18px; font-weight: 400; margin: 0; }
		.subtitle { font-size: 14px; color: var(--vscode-descriptionForeground); margin: 0 0 24px 0; line-height: 1.4; max-width: 900px; }
		[hidden] { display: none !important; }
		.sectionHeader { display: flex; align-items: baseline; gap: 16px; margin: 24px 0 8px 0; }
		.sectionHeader h2 { flex: 1; }
		.pane { padding: 16px; border-radius: 4px; background: var(--vscode-welcomePage-tileBackground, var(--vscode-editorWidget-background)); }
		.formGrid { display: grid; grid-template-columns: max-content minmax(0, 1fr); gap: 12px 16px; align-items: baseline; }
		.hint { font-size: 12px; color: var(--vscode-descriptionForeground); margin-top: 4px; line-height: 1.4; }
		.row { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
		input[type="text"], select { font: inherit; color: var(--vscode-input-foreground); background: var(--vscode-input-background); border: 1px solid var(--vscode-input-border, var(--vscode-widget-border)); border-radius: 2px; padding: 4px 6px; }
		input:focus, select:focus { outline: 1px solid var(--vscode-focusBorder); outline-offset: -1px; }
		input#words { width: 480px; max-width: 100%; }
		button.action { font: inherit; color: var(--vscode-button-secondaryForeground); background: var(--vscode-button-secondaryBackground); border: none; box-shadow: inset 0 0 0 1px var(--vscode-button-background); border-radius: 2px; padding: 4px 12px; cursor: pointer; font-size: 11px; opacity: 0.7; }
		/* As the code buttons below a panel's Example Code: dimmed until pointed at, the blue one not */
		button.action:not(:disabled):hover, button.action.current, button.action.primary { opacity: 1; }
		button.action:hover { color: var(--vscode-button-foreground); background: var(--vscode-button-background); }
		button.primary { color: var(--vscode-button-foreground); background: var(--vscode-button-background); }
		button.primary:hover { background: var(--vscode-button-hoverBackground); }
		button:disabled, button:disabled:hover { opacity: 0.5; cursor: default; color: var(--vscode-button-secondaryForeground); background: var(--vscode-button-secondaryBackground); }
		button.primary:disabled, button.primary:disabled:hover { color: var(--vscode-button-foreground); background: var(--vscode-button-background); }
		select#days, select#marks { width: 240px; }
		.link { color: var(--vscode-textLink-foreground); cursor: pointer; background: none; border: none; padding: 0; font: inherit; font-size: 12px; text-align: left; }
		.link:hover { text-decoration: underline; }
		.status { font-size: 12px; color: var(--vscode-descriptionForeground); margin-top: 8px; }
		.status.error { color: var(--vscode-errorForeground); }
		.info { font-size: 12px; color: var(--vscode-descriptionForeground); margin-bottom: 8px; line-height: 1.4; }
		#chart { display: block; width: 100%; height: 240px; }
		#chart .grid { stroke: var(--vscode-widget-border); stroke-width: 1; }
		#chart .articles { fill: var(--vscode-textLink-foreground); opacity: 0.7; cursor: pointer; }
		#chart .chosen { opacity: 1; }
		#chart .filing { stroke: var(--vscode-charts-red); stroke-width: 1; stroke-dasharray: 3 3; }
		#chart text { font-size: 10px; fill: var(--vscode-descriptionForeground); }
		#chart text.filingLabel { fill: var(--vscode-charts-red); cursor: pointer; }
		table { width: 100%; border-collapse: collapse; font-size: 12px; }
		th { text-align: left; font-weight: normal; color: var(--vscode-descriptionForeground); padding: 4px 8px; border-bottom: 1px solid var(--vscode-widget-border); }
		td { padding: 4px 8px; border-bottom: 1px solid var(--vscode-widget-border); vertical-align: top; }
		td.when { white-space: nowrap; color: var(--vscode-descriptionForeground); }
		td.outlet { max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
		td.source { white-space: nowrap; color: var(--vscode-descriptionForeground); }
		.empty { color: var(--vscode-descriptionForeground); padding: 12px 8px; }
		.sourceList { display: grid; grid-template-columns: max-content minmax(0, 1fr); gap: 6px 12px; align-items: baseline; }
		.sourceList label { white-space: nowrap; }
		.sourceList .hint { margin-top: 0; }
		.sourceList input[type="text"] { width: 90px; margin-left: 8px; }
		input[type="date"], input[type="datetime-local"] { font: inherit; color: var(--vscode-input-foreground); background: var(--vscode-input-background); border: 1px solid var(--vscode-input-border, var(--vscode-widget-border)); border-radius: 2px; padding: 3px 6px; }
		.footnote { font-size: 11px; color: var(--vscode-descriptionForeground); margin-top: 16px; line-height: 1.4; }
	</style>
</head>
<body>
<div class="container">
	<div class="title-row">
		<h1>${text.title}</h1>
		${voiceButtonsHtml}
	</div>
	<p class="subtitle">${text.intro}</p>

	<div class="pane">
		<div class="formGrid">
			<label for="words">${text.words}</label>
			<div><input type="text" id="words" spellcheck="false" autocomplete="off"><div class="hint">${text.wordsHint}</div></div>
			<span>${text.sourcesLabel}</span>
			<div class="sourceList" id="sources"></div>
			<label for="days">${text.period}</label>
			<div class="row">
				<select id="days">
					<option value="1">${text.day1}</option>
					<option value="3">${text.day3}</option>
					<option value="7" selected>${text.day7}</option>
					<option value="30">${text.day30}</option>
					<option value="90">${text.day90}</option>
					<option value="365">${text.day365}</option>
					<option value="custom">${text.custom}</option>
				</select>
				<span id="customPeriod" class="row" hidden><label for="from">${text.from}</label><input type="date" id="from"><label for="to">${text.to}</label><input type="date" id="to"></span>
			</div>
			<label for="marks">${text.marks}</label>
			<div>
				<div class="row">
					<select id="marks">
						<option value="none">${text.markNone}</option>
						<option value="fomc">${text.markFomc}</option>
						<option value="filings">${text.markFilings}</option>
						<option value="time">${text.markTime}</option>
					</select>
					<input type="datetime-local" id="markTime" hidden>
				</div>
				<div class="hint">${text.marksHint}</div>
			</div>
			<span></span>
			<div><button class="action primary" id="search" disabled>${text.search}</button></div>
		</div>
		<div class="status" id="status" hidden></div>
	</div>

	<div id="results" hidden>
		<div class="sectionHeader"><h2>${text.coverage}</h2></div>
		<div class="pane">
			<div class="info" id="summary"></div>
			<svg id="chart" role="img" aria-label="${text.coverage}"></svg>
			<div class="hint">${text.chartHint}</div>
		</div>

		<div class="sectionHeader">
			<h2>${text.items}</h2>
			<button class="link" id="showAll" hidden>${text.showAll}</button>
		</div>
		<table>
			<thead><tr><th>${text.when}</th><th>${text.outlet}</th><th>${text.headline}</th><th>${text.source}</th></tr></thead>
			<tbody id="items"></tbody>
		</table>
		<div class="empty" id="noItems" hidden>${text.noItems}</div>
	</div>
	<div class="footnote">${text.sources}</div>
</div>
<script>
	const vscode = acquireVsCodeApi();
	${voiceButtonsScript}
	const TEXT = ${JSON.stringify(text)};
	const SVG = 'http://www.w3.org/2000/svg';
	const wordsElement = document.getElementById('words');
	const daysElement = document.getElementById('days');
	const fromElement = document.getElementById('from');
	const toElement = document.getElementById('to');
	const marksElement = document.getElementById('marks');
	const markTimeElement = document.getElementById('markTime');
	const searchElement = document.getElementById('search');
	const statusElement = document.getElementById('status');
	let ticker = '';
	let coverage;
	let sources = [];
	let keys = {};
	// The bucket whose items are listed, or -1 for the whole period
	let chosenBucket = -1;

	function format(template, ...values) {
		return template.replace(/\\{(\\d+)\\}/g, (match, index) => values[index] !== undefined ? String(values[index]) : match);
	}

	function svg(name, attributes, parent) {
		const node = document.createElementNS(SVG, name);
		for (const key in attributes) {
			node.setAttribute(key, attributes[key]);
		}
		parent.appendChild(node);
		return node;
	}

	function setStatus(message, error) {
		statusElement.textContent = message;
		statusElement.className = error ? 'status error' : 'status';
		statusElement.hidden = !message;
	}

	function renderSources() {
		const list = document.getElementById('sources');
		list.textContent = '';
		for (const source of Object.keys(TEXT.sourceNames)) {
			const label = document.createElement('label');
			const box = document.createElement('input');
			box.type = 'checkbox';
			box.checked = sources.includes(source);
			box.addEventListener('change', () => {
				sources = Object.keys(TEXT.sourceNames).filter(other => other === source ? box.checked : sources.includes(other));
				vscode.postMessage({ command: 'setSources', sources });
				updateForm();
			});
			label.append(box, ' ' + TEXT.sourceNames[source]);
			if (source === 'yahoo') {
				const tickerElement = document.createElement('input');
				tickerElement.type = 'text';
				tickerElement.id = 'ticker';
				tickerElement.spellcheck = false;
				tickerElement.placeholder = TEXT.ticker;
				tickerElement.setAttribute('aria-label', TEXT.ticker);
				tickerElement.value = ticker;
				tickerElement.addEventListener('input', () => {
					ticker = tickerElement.value.trim().toUpperCase();
					updateForm();
				});
				tickerElement.addEventListener('keydown', event => {
					if (event.key === 'Enter') {
						search();
					}
				});
				label.append(tickerElement);
			}
			const hint = document.createElement('div');
			hint.className = 'hint';
			if (source === 'googleNews') {
				hint.textContent = TEXT.googleNewsHint;
			} else if (source === 'yahoo') {
				hint.textContent = TEXT.yahooHint;
			} else if (source === 'prNewswire') {
				hint.append(TEXT.prNewswireHint, document.createElement('br'), TEXT.prNewswireLimit);
			} else {
				hint.append(TEXT.keyedHint + ' ' + (keys[source] ? '' : TEXT.noKeySet + ' '));
				const setKey = document.createElement('button');
				setKey.className = 'link';
				setKey.textContent = keys[source] ? TEXT.changeKey : TEXT.setKey;
				setKey.addEventListener('click', () => vscode.postMessage({ command: 'setKey', source }));
				const getKey = document.createElement('button');
				getKey.className = 'link';
				getKey.textContent = TEXT.getKey;
				getKey.addEventListener('click', () => vscode.postMessage({ command: 'getKey', source }));
				hint.append(setKey, ' \u00b7 ', getKey);
			}
			list.append(label, hint);
		}
		alignFields();
	}

	/** Ends Period's and Mark's fields where Yahoo Finance's ticker ends. */
	function alignFields() {
		const tickerElement = document.getElementById('ticker');
		if (!tickerElement) {
			return;
		}
		const right = tickerElement.getBoundingClientRect().right;
		for (const field of [daysElement, marksElement]) {
			field.style.width = Math.max(120, right - field.getBoundingClientRect().left) + 'px';
		}
	}

	function updateForm() {
		searchElement.disabled = !sources.length || (!wordsElement.value.trim() && !ticker) || !period();
	}

	/** A day of a date input, as the time of its start here. */
	function dayStart(value) {
		return value ? new Date(value + 'T00:00').getTime() : NaN;
	}

	/** The local day of a time, as a date input wants it. */
	function dayValue(time) {
		const date = new Date(time);
		return date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0') + '-' + String(date.getDate()).padStart(2, '0');
	}

	/** The local time of a time, as a datetime-local input wants it. */
	function timeValue(time) {
		const date = new Date(time);
		return dayValue(time) + 'T' + String(date.getHours()).padStart(2, '0') + ':' + String(date.getMinutes()).padStart(2, '0');
	}

	/** The period chosen, in milliseconds since 1970; undefined when its days are not set. */
	function period() {
		if (daysElement.value !== 'custom') {
			const end = Date.now();
			return { start: end - Number(daysElement.value) * 86400000, end };
		}
		const start = dayStart(fromElement.value);
		// To the end of its day
		const end = dayStart(toElement.value) + 86400000;
		return isNaN(start) || isNaN(end) || end <= start ? undefined : { start, end };
	}

	function search() {
		const chosen = period();
		if (searchElement.disabled || !chosen) {
			return;
		}
		searchElement.disabled = true;
		setStatus(TEXT.searching);
		const time = markTimeElement.value ? new Date(markTimeElement.value).getTime() : undefined;
		vscode.postMessage({ command: 'search', words: wordsElement.value, ticker, start: chosen.start, end: chosen.end, marks: marksElement.value, time });
	}

	/** Fills the form with a request, such as an event study's event, and searches. */
	function show(request) {
		wordsElement.value = request.words;
		ticker = request.ticker || '';
		renderSources();
		daysElement.value = 'custom';
		fromElement.value = dayValue(request.start);
		toElement.value = dayValue(request.end);
		marksElement.value = request.marks;
		markTimeElement.value = request.time !== undefined ? timeValue(request.time) : '';
		updatePeriod();
		updateForm();
		search();
	}

	function updatePeriod() {
		document.getElementById('customPeriod').hidden = daysElement.value !== 'custom';
		markTimeElement.hidden = marksElement.value !== 'time';
	}

	function drawChart() {
		const chart = document.getElementById('chart');
		chart.textContent = '';
		const width = chart.clientWidth || 800;
		const height = 240;
		chart.setAttribute('viewBox', '0 0 ' + width + ' ' + height);
		const left = 48;
		const right = 12;
		const count = coverage.times.length;
		if (!count) {
			return;
		}
		const step = (width - left - right) / count;
		const rows = [
			{ name: TEXT.articles, top: 8, height: 200 },
		];
		for (const row of rows) {
			svg('line', { class: 'grid', x1: left, x2: width - right, y1: row.top + row.height, y2: row.top + row.height }, chart);
			svg('text', { x: 0, y: row.top + 10 }, chart).textContent = row.name;
		}
		const bars = (values, row, className) => {
			const max = Math.max(1, ...values);
			svg('text', { x: 0, y: row.top + 24 }, chart).textContent = String(max);
			values.forEach((value, index) => {
				const barHeight = value / max * row.height;
				const bar = svg('rect', { class: className + (index === chosenBucket ? ' chosen' : ''), x: left + index * step + 0.5, y: row.top + row.height - barHeight, width: Math.max(1, step - 1), height: barHeight }, chart);
				svg('title', {}, bar).textContent = coverage.labels[index] + ': ' + value;
				bar.addEventListener('click', () => chooseBucket(index));
			});
		};
		bars(coverage.articles, rows[0], 'articles');
		// The marks, where they fall
		const start = coverage.times[0];
		const span = coverage.times[count - 1] + coverage.bucket - start;
		for (const mark of coverage.marks) {
			const x = left + (mark.time - start) / span * (width - left - right);
			svg('line', { class: 'filing', x1: x, x2: x, y1: 4, y2: 208 }, chart);
			const label = svg('text', { class: 'filingLabel', x: x + 3, y: 12 }, chart);
			label.textContent = mark.label;
			svg('title', {}, label).textContent = mark.description;
			if (mark.url) {
				label.addEventListener('click', () => vscode.postMessage({ command: 'openUrl', url: mark.url }));
			}
		}
		// The first, middle and last buckets' times
		for (const index of [...new Set([0, Math.floor(count / 2), count - 1])]) {
			svg('text', { x: left + index * step, y: 228, 'text-anchor': index === count - 1 ? 'end' : index ? 'middle' : 'start' }, chart).textContent = coverage.labels[index];
		}
	}

	function chooseBucket(index) {
		chosenBucket = chosenBucket === index ? -1 : index;
		drawChart();
		renderItems();
	}

	function renderItems() {
		const body = document.getElementById('items');
		body.textContent = '';
		const bucket = coverage.bucket;
		const items = coverage.items.filter(item => chosenBucket < 0 || item.time >= coverage.times[chosenBucket] && item.time < coverage.times[chosenBucket] + bucket);
		for (const item of items) {
			const row = document.createElement('tr');
			const when = document.createElement('td');
			when.className = 'when';
			when.textContent = item.when;
			const outlet = document.createElement('td');
			outlet.className = 'outlet';
			outlet.textContent = item.outlet;
			outlet.title = item.outlet;
			const headline = document.createElement('td');
			const link = document.createElement('button');
			link.className = 'link';
			link.textContent = item.title;
			link.title = item.url;
			link.addEventListener('click', () => vscode.postMessage({ command: 'openUrl', url: item.url }));
			headline.appendChild(link);
			const source = document.createElement('td');
			source.className = 'source';
			source.textContent = item.source;
			row.append(when, outlet, headline, source);
			body.appendChild(row);
		}
		document.getElementById('noItems').hidden = items.length > 0;
		document.getElementById('showAll').hidden = chosenBucket < 0;
	}

	daysElement.addEventListener('change', () => {
		updatePeriod();
		updateForm();
	});
	fromElement.addEventListener('change', updateForm);
	toElement.addEventListener('change', updateForm);
	marksElement.addEventListener('change', updatePeriod);
	wordsElement.addEventListener('input', updateForm);
	wordsElement.addEventListener('keydown', event => {
		if (event.key === 'Enter') {
			search();
		}
	});
	searchElement.addEventListener('click', search);
	document.getElementById('showAll').addEventListener('click', () => chooseBucket(chosenBucket));
	window.addEventListener('resize', () => {
		alignFields();
		if (coverage) {
			drawChart();
		}
	});

	window.addEventListener('message', event => {
		const message = event.data;
		if (message.command === 'sources') {
			sources = message.sources;
			keys = message.keys;
			renderSources();
		} else if (message.command === 'show') {
			show(message.request);
		} else if (message.command === 'coverage') {
			coverage = message;
			chosenBucket = -1;
			updateForm();
			const notes = [...message.failed.length ? [format(TEXT.failed, message.failed.join(', '))] : [], ...message.noKey.length ? [format(TEXT.noKey, message.noKey.join(', '))] : [], ...message.counts];
			setStatus(notes.join(' '), message.failed.length > 0 || message.noKey.length > 0);
			const total = message.articles.reduce((sum, value) => sum + value, 0);
			document.getElementById('summary').textContent = format(TEXT.summary, total.toLocaleString());
			document.getElementById('results').hidden = false;
			drawChart();
			renderItems();
		}
	});
	updateForm();
	wordsElement.focus();
	vscode.postMessage({ command: 'ready' });
</script>
</body>
</html>`;
}

registerAction2(class extends Action2 {
	constructor() {
		super({
			id: SHOW_MEDIA_COVERAGE_COMMAND_ID,
			title: localize2('mediaCoverage.showAction', "Media Coverage"),
			category: localize2('mediaCoverage.category', "Explore"),
			f1: true,
		});
	}
	run(accessor: ServicesAccessor, request?: IMediaCoverageRequest): void {
		openMediaCoveragePage(accessor, request && typeof request.words === 'string' && typeof request.start === 'number' && typeof request.end === 'number' ? request : undefined);
	}
});
