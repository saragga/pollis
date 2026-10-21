/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

// Journal Metrics: the sources of the levels and metrics that tag journal items on the RSS Feeds page and the welcome
// page, and fill the metrics views of PollisJournals. The Norwegian register and OpenAlex are built in; SCImago, CWTS
// and the ABDC list are free to download, Scopus needs a free account and Journal Citation Reports a subscription.
// Their licences let the user keep a copy, not Pollis share one, so each is downloaded by the user, at its own site,
// and imported here; the page shows what is imported, to import again or remove, and starts an agent on the Journal
// Metrics skill to help.

import { fromNow } from '../../../../base/common/date.js';
import { DisposableStore } from '../../../../base/common/lifecycle.js';
import { basename } from '../../../../base/common/resources.js';
import { escape } from '../../../../base/common/strings.js';
import { localize, localize2 } from '../../../../nls.js';
import { Action2, registerAction2 } from '../../../../platform/actions/common/actions.js';
import { ICommandService } from '../../../../platform/commands/common/commands.js';
import { ContextKeyExpr } from '../../../../platform/contextkey/common/contextkey.js';
import { IDialogService } from '../../../../platform/dialogs/common/dialogs.js';
import { ServicesAccessor } from '../../../../platform/instantiation/common/instantiation.js';
import { RUN_SKILL_COMMAND_ID } from '../../compose/browser/pollisAgents.js';
import { IJournalScoresService, MetricsSource } from '../../monitor/browser/journalScores.js';
import { RSS_FEEDS_COMMAND_ID } from '../../monitor/browser/rssFeedsPage.js';
import { WebviewInput } from '../../webviewPanel/browser/webviewEditorInput.js';
import { IWebviewWorkbenchService } from '../../webviewPanel/browser/webviewWorkbenchService.js';
import { JOURNAL_METRICS_COMMAND_ID, JOURNALS_DATABASE_ID } from '../common/databaseDrivers.js';
import { DatabaseConnectionContextMenu, DatabaseItemId, DatabaseItemKind } from './connectionsView.js';

const IMPORT_COMMAND_ID = 'pollis.databases.importJournalMetrics';

type JournalMetricsMessage =
	| { readonly command: 'ready' | 'import' | 'askAgent' | 'showFeeds' }
	| { readonly command: 'remove'; readonly file: string }
	| { readonly command: 'openLink'; readonly url: string };

/** The download page of each source the user imports. */
const DOWNLOAD_PAGES: Record<MetricsSource, string> = {
	SCImago: 'https://www.scimagojr.com/journalrank.php',
	CWTS: 'https://www.journalindicators.com/',
	ABDC: 'https://abdc.edu.au/abdc-journal-quality-list/',
	Scopus: 'https://www.scopus.com/sources',
	JCR: 'https://jcr.clarivate.com/',
};

/** The open page, so a second request shows it again. */
let openPage: WebviewInput | undefined;

/** Opens the Journal Metrics page, or shows it again when it is open. */
async function openJournalMetricsPage(accessor: ServicesAccessor): Promise<void> {
	const webviewWorkbenchService = accessor.get(IWebviewWorkbenchService);
	const journalScoresService = accessor.get(IJournalScoresService);
	const dialogService = accessor.get(IDialogService);
	const commandService = accessor.get(ICommandService);

	if (openPage && !openPage.isDisposed()) {
		webviewWorkbenchService.revealWebview(openPage, openPage.group ?? -1, false);
		return;
	}
	const title = localize('journalMetrics.title', "Journal Metrics");
	const webviewInput = webviewWorkbenchService.openWebview(
		{
			title,
			options: { retainContextWhenHidden: true },
			contentOptions: { allowScripts: true, localResourceRoots: [] },
			extension: undefined,
		},
		'pollis.journalMetrics',
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

	// The files imported, by source, newest first
	const sendImports = () => webviewInput.webview.postMessage({
		command: 'imports',
		imports: [...journalScoresService.getImports()].sort((a, b) => b.imported - a.imported).map(item => ({
			file: item.file.toString(),
			name: basename(item.file).replace(/\.jsonl$/, '').slice(item.source.length + 1),
			source: item.source,
			year: item.year,
			imported: item.imported ? fromNow(item.imported, true) : '',
		})),
	});
	disposables.add(journalScoresService.onDidChange(sendImports));

	disposables.add(webviewInput.webview.onMessage(async (e: { message: JournalMetricsMessage }) => {
		const message = e.message;
		switch (message.command) {
			case 'ready':
				sendImports();
				break;
			case 'import':
				await commandService.executeCommand(IMPORT_COMMAND_ID);
				break;
			case 'remove': {
				const item = journalScoresService.getImports().find(candidate => candidate.file.toString() === message.file);
				if (!item) {
					break;
				}
				const { confirmed } = await dialogService.confirm({
					message: localize('journalMetrics.removeConfirm', "Remove the {0} metrics imported from {1}?", item.source, basename(item.file).replace(/\.jsonl$/, '').slice(item.source.length + 1)),
					detail: localize('journalMetrics.removeDetail', "Pollis's copy is deleted; the file you downloaded stays where it is, to import again."),
					primaryButton: localize({ key: 'journalMetrics.removeButton', comment: ['&& denotes a mnemonic'] }, "&&Remove"),
				});
				if (confirmed) {
					await journalScoresService.removeImport(item.file);
				}
				break;
			}
			case 'askAgent':
				await commandService.executeCommand(RUN_SKILL_COMMAND_ID, 'journal-metrics', localize('journalMetrics.skill', "Journal Metrics"));
				break;
			case 'showFeeds':
				await commandService.executeCommand(RSS_FEEDS_COMMAND_ID);
				break;
			case 'openLink':
				// The download page opens in Pollis's own browser, beside the page
				if (Object.values(DOWNLOAD_PAGES).includes(message.url)) {
					await commandService.executeCommand('workbench.action.browser.open', message.url);
				}
				break;
		}
	}));
}

/** A metric of a source: the values it takes and how to read them. */
interface IMetricText {
	readonly name: string;
	readonly values: string;
	readonly meaning: string;
}

/** A source as the page shows it: what it measures, its metrics, who can use it, and how to download its file. */
interface ISourceText {
	readonly id: string;
	readonly name: string;
	readonly measures: string;
	readonly metrics: readonly IMetricText[];
	readonly access: string;
	readonly download?: string;
	readonly url?: string;
}

/** The page: its texts come from here, the imports from the `imports` message. */
function pageHtml(): string {
	// A Pollis menu path, in the yellow of Discover Pollis
	const menuPath = (path: string) => `<span class="menuPath">${escape(path)}</span>`;
	const metric = (name: string, values: string, meaning: string): IMetricText => ({ name, values, meaning });
	const zeroUp = localize('journalMetrics.zeroUp', "0 and up");
	const quartiles = localize('journalMetrics.quartiles', "Q1 to Q4");
	const text = {
		title: localize('journalMetrics.title', "Journal Metrics"),
		intro: localize('journalMetrics.intro', "The levels and metrics that tag the items of journals on the RSS Feeds page and the welcome page, and fill the metrics views of PollisJournals. Two are built in. The others are not free to share: you download each for your own use, at its source, and Pollis imports it on this computer. Nothing is sent anywhere."),
		showFeeds: localize('journalMetrics.backToFeeds', "Back: RSS Feeds"),
		importFile: localize('journalMetrics.importFile', "Import File..."),
		askAgent: localize('journalMetrics.askAgent', "Ask an Agent"),
		askAgentHelp: localize('journalMetrics.askAgentHelp', "Ask an Agent starts your coding agent on the Journal Metrics skill (in {0}): it helps you choose the metrics for your field, download them and import them, and then answers questions about journals with SQL.", menuPath(localize('journalMetrics.agentSkillsPath', "Compose > Agent Skills"))),
		builtInSection: localize('journalMetrics.builtInSection', "Built into Pollis"),
		builtInIntro: localize('journalMetrics.builtInIntro', "Open data, in PollisJournals from the start and brought up to date every month with PollisJournals.jl."),
		freeSection: localize('journalMetrics.freeSection', "Free to Download"),
		freeIntro: localize('journalMetrics.freeIntro', "No account needed. Download the file at the source's site with its own button, then Import File... here."),
		accountSection: localize('journalMetrics.accountSection', "With an Account or a Subscription"),
		accountIntro: localize('journalMetrics.accountIntro', "Signed in at the source, often through your university library. Download the file there, then Import File... here."),
		builtIn: localize('journalMetrics.builtIn', "Built in"),
		notImported: localize('journalMetrics.notImported', "Not imported"),
		imported: localize('journalMetrics.imported', "Imported"),
		latestYear: localize('journalMetrics.latestYear', "latest year {0}"),
		downloadPage: localize('journalMetrics.downloadPage', "Download Page"),
		remove: localize('journalMetrics.remove', "Remove"),
		metricHeader: localize('journalMetrics.metricHeader', "Metric"),
		valuesHeader: localize('journalMetrics.valuesHeader', "Values"),
		meaningHeader: localize('journalMetrics.meaningHeader', "Meaning"),
		usingSection: localize('journalMetrics.usingSection', "Using the Metrics"),
		usingTags: localize('journalMetrics.usingTags', "<b>Tags:</b> each item of a journal on the RSS Feeds page and the welcome page has a tag with the journal's Norwegian level, OpenAlex's 2-year mean citedness and, once imported, its SJR or Impact Factor quartile; the pointer on the tag shows every value, with its source and year."),
		usingFilter: localize('journalMetrics.usingFilter', "<b>Journals filter:</b> on the RSS Feeds page, Academic, Leading and Open Access from the start; SJR Q1, SJR Q1-Q2 and SNIP Above 1 once SCImago or CWTS are imported."),
		usingSql: localize('journalMetrics.usingSql', "<b>SQL:</b> the metrics and journal_metrics views of PollisJournals have every row imported, and norwegian_levels every level since 2004. Query them in a duckdb&gt; terminal ({0}).", menuPath(localize('journalMetrics.duckdbPath', "Databases > New DuckDB Terminal"))),
		licence: localize('journalMetrics.licence', "Downloaded for your own use: Pollis keeps its copy on this computer, and never shares it."),
	};
	const builtIn: ISourceText[] = [
		{
			id: 'norwegian',
			name: localize('journalMetrics.norwegianName', "Norwegian Register"),
			measures: localize('journalMetrics.norwegianMeasures', "The level of about 40,000 journals and series each year since 2004: 1 academic, 2 leading, 0 not academic. Every field, the humanities included."),
			metrics: [
				metric(localize('journalMetrics.levelName', "Level"), localize('journalMetrics.levelValues', "2, 1 or 0"), localize('journalMetrics.levelMeaning', "2: leading, the channels that publish about a fifth of a field's most significant work; 1: academic, peer reviewed, with authors from several institutions; 0: not academic, or no longer approved.")),
			],
			access: localize('journalMetrics.norwegianAccess', "Open data from HK-dir, under the Norwegian Licence for Open Government Data (NLOD) 2.0."),
		},
		{
			id: 'openalex',
			name: 'OpenAlex',
			measures: localize('journalMetrics.openAlexMeasures', "About 250,000 journals, conferences and book series, with their works and citations by year, 2-year mean citedness (close to a two-year impact factor, for every journal), h-index, open access and DOAJ."),
			metrics: [
				metric(localize('journalMetrics.citednessName', "2-year mean citedness"), zeroUp, localize('journalMetrics.citednessMeaning', "The citations in a year to the works of the two years before, per work: close to a two-year impact factor. Not adjusted for field, so compare journals of the same field.")),
				metric(localize('journalMetrics.hIndexName', "h-index"), zeroUp, localize('journalMetrics.hIndexMeaning', "The largest h such that h of the journal's works have at least h citations each. It grows with the journal's age and size.")),
				metric(localize('journalMetrics.openAccessName', "Open access, DOAJ"), localize('journalMetrics.yesNo', "Yes or no"), localize('journalMetrics.openAccessMeaning', "Whether the journal is fully open access, and whether it is listed in the Directory of Open Access Journals, which vets open-access journals.")),
				metric(localize('journalMetrics.apcName', "Article charge"), localize('journalMetrics.apcValues', "US dollars"), localize('journalMetrics.apcMeaning', "The article processing charge (APC) of an open-access journal, when known.")),
			],
			access: localize('journalMetrics.openAlexAccess', "Open data from OurResearch, under CC0."),
		},
	];
	const free: ISourceText[] = [
		{
			id: 'SCImago',
			name: localize('journalMetrics.scimagoName', "SCImago Journal Rank (SJR)"),
			measures: localize('journalMetrics.scimagoMeasures', "SJR, citations weighted by the prestige of the citing journal; the journal's best quartile among its subject categories; h-index. About 30,000 journals, from Scopus."),
			metrics: [
				metric('SJR', zeroUp, localize('journalMetrics.sjrMeaning', "Citations in a year to the documents of the three years before, per document, each citation weighted by the prestige of the citing journal. Higher is better; compare within a field.")),
				metric(localize('journalMetrics.sjrQuartileName', "SJR quartile"), quartiles, localize('journalMetrics.sjrQuartileMeaning', "Q1: the top quarter of the journals of a subject category by SJR; Q4: the bottom quarter. Pollis shows the journal's best quartile.")),
				metric(localize('journalMetrics.hIndexName', "h-index"), zeroUp, localize('journalMetrics.scimagoHIndexMeaning', "The largest h such that h of the journal's documents have at least h citations each, in Scopus. It grows with the journal's age and size.")),
			],
			access: localize('journalMetrics.scimagoAccess', "Free, no account."),
			download: localize('journalMetrics.scimagoDownload', "Journal Rankings, choose the year (subject area and country at All), then Download data. A file a year, scimagojr YYYY.csv: keep its name, which gives the year."),
			url: DOWNLOAD_PAGES.SCImago,
		},
		{
			id: 'CWTS',
			name: localize('journalMetrics.cwtsName', "CWTS Journal Indicators (SNIP)"),
			measures: localize('journalMetrics.cwtsMeasures', "SNIP, citations per paper adjusted for how much the journal's field cites, so that 1 is about the average of any field and fields can be compared; IPP, not adjusted."),
			metrics: [
				metric('SNIP', zeroUp, localize('journalMetrics.snipMeaning', "Citations per paper, adjusted for how much the journal's field cites: 1 is about the average of any field, 2 twice it. It compares journals across fields.")),
				metric('IPP', zeroUp, localize('journalMetrics.ippMeaning', "Impact per publication: the citations in a year to the papers of the three years before, per paper, not adjusted for field.")),
			],
			access: localize('journalMetrics.cwtsAccess', "Free, no account. From CWTS, Leiden University."),
			download: localize('journalMetrics.cwtsDownload', "Downloads, then the Excel file of all the indicators: every year since 1999 in one file, released each spring. The import takes a minute or two."),
			url: DOWNLOAD_PAGES.CWTS,
		},
		{
			id: 'ABDC',
			name: localize('journalMetrics.abdcName', "ABDC Journal Quality List"),
			measures: localize('journalMetrics.abdcMeasures', "A rating of about 2,700 journals of business, economics, accounting, finance and management: A*, A, B or C. Reviewed every three years."),
			metrics: [
				metric(localize('journalMetrics.abdcRatingName', "Rating"), localize('journalMetrics.abdcRatingValues', "A*, A, B or C"), localize('journalMetrics.abdcRatingMeaning', "A*: the highest, about the top 5 to 7% of the list; A: about the next 15 to 25%; B: about the next 35 to 40%; C: the rest, journals of recognised quality. A journal not on the list is not rated, which says nothing about it.")),
			],
			access: localize('journalMetrics.abdcAccess', "Free, no account. From the Australian Business Deans Council."),
			download: localize('journalMetrics.abdcDownload', "The Excel file of the latest list, near the top of the page. Its first sheet is the latest edition, which Pollis reads."),
			url: DOWNLOAD_PAGES.ABDC,
		},
	];
	const account: ISourceText[] = [
		{
			id: 'Scopus',
			name: localize('journalMetrics.scopusName', "Scopus (CiteScore)"),
			measures: localize('journalMetrics.scopusMeasures', "CiteScore, citations in four years to the documents of those years, per document; its quartile in each Scopus subject area."),
			metrics: [
				metric('CiteScore', zeroUp, localize('journalMetrics.citeScoreMeaning', "Citations in four years to the documents of those four years, per document. Not adjusted for field, so compare within a subject area.")),
				metric(localize('journalMetrics.citeScoreQuartileName', "CiteScore quartile"), quartiles, localize('journalMetrics.citeScoreQuartileMeaning', "The journal's quarter in a Scopus subject area by CiteScore: Q1 the top, Q4 the bottom.")),
			],
			access: localize('journalMetrics.scopusAccess', "A free Elsevier account; your institution may give full Scopus."),
			download: localize('journalMetrics.scopusDownload', "Sources, signed in, then the download of the source list with its CiteScore metrics, an Excel file."),
			url: DOWNLOAD_PAGES.Scopus,
		},
		{
			id: 'JCR',
			name: localize('journalMetrics.jcrName', "Journal Citation Reports (Impact Factor)"),
			measures: localize('journalMetrics.jcrMeasures', "The Journal Impact Factor and its 5-year version, its quartile in each Web of Science category, and the Journal Citation Indicator (JCI), normalised by field."),
			metrics: [
				metric(localize('journalMetrics.jifName', "Impact Factor (JIF)"), zeroUp, localize('journalMetrics.jifMeaning', "Citations in a year to the items of the two years before, per citable item. Not adjusted for field, so compare within a Web of Science category.")),
				metric(localize('journalMetrics.jif5Name', "5-year JIF"), zeroUp, localize('journalMetrics.jif5Meaning', "The same over five years: steadier, and fairer to fields that cite slowly.")),
				metric(localize('journalMetrics.jifQuartileName', "JIF quartile"), quartiles, localize('journalMetrics.jifQuartileMeaning', "The journal's quarter in a Web of Science category by JIF: Q1 the top, Q4 the bottom.")),
				metric(localize('journalMetrics.jciName', "Journal Citation Indicator (JCI)"), zeroUp, localize('journalMetrics.jciMeaning', "Citations normalised by field, year and document type: 1 is the average of the category, 1.5 is half as much again.")),
			],
			access: localize('journalMetrics.jcrAccess', "A Clarivate subscription, usually through your university library."),
			download: localize('journalMetrics.jcrDownload', "Journals, filtered by category if you want only some, then Export, as CSV or Excel. An export holds a limited number of rows: for more, export a category at a time and import each file."),
			url: DOWNLOAD_PAGES.JCR,
		},
	];
	const card = (source: ISourceText) => `
		<div class="card" data-source="${source.id}">
			<div class="cardHead">
				<span class="cardName">${escape(source.name)}</span>
				<span class="badge${source.url ? '' : ' done'}" id="badge-${source.id}">${source.url ? text.notImported : text.builtIn}</span>
			</div>
			<p class="measures">${escape(source.measures)}</p>
			<table class="metrics">
				<tr><th>${text.metricHeader}</th><th>${text.valuesHeader}</th><th>${text.meaningHeader}</th></tr>
				${source.metrics.map(item => `<tr><td class="metricName">${escape(item.name)}</td><td class="metricValues">${escape(item.values)}</td><td>${escape(item.meaning)}</td></tr>`).join('')}
			</table>
			<p class="access">${escape(source.access)}</p>
			${source.download ? `<p class="download">${escape(source.download)}</p>` : ''}
			${source.url ? `<div class="imports" id="imports-${source.id}"></div>
			<div class="actions">
				<button class="action" data-url="${source.url}">${text.downloadPage}</button>
				<button class="action importFile">${text.importFile}</button>
			</div>` : ''}
		</div>`;
	return `<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline';">
	<style>
		* { box-sizing: border-box; }
		body { font-family: var(--vscode-font-family); font-size: 13px; margin: 0; color: var(--vscode-foreground); background-color: var(--vscode-editor-background); }
		.container { max-width: 900px; margin: 0 auto; padding: 24px; }
		.header { display: flex; align-items: flex-end; gap: 16px; }
		.header h1 { flex: 1; }
		h1 { font-size: 32px; font-weight: 300; margin: 0 0 4px 0; line-height: 1.2; }
		.subtitle { font-size: 14px; color: var(--vscode-descriptionForeground); margin: 0 0 12px 0; line-height: 1.4; }
		.link { color: var(--vscode-textLink-foreground); cursor: pointer; background: none; border: none; padding: 0; font: inherit; }
		.link:hover { color: var(--vscode-textLink-activeForeground); text-decoration: underline; }
		button.action { font: inherit; color: var(--vscode-button-secondaryForeground); background: var(--vscode-button-secondaryBackground); border: none; border-radius: 2px; padding: 4px 12px; cursor: pointer; white-space: nowrap; }
		button.action:hover, button.action:active, button.action.pressed { color: var(--vscode-button-foreground); background: var(--vscode-button-background); }
		.topActions { display: flex; gap: 8px; margin-bottom: 6px; }
		.help { font-size: 12px; color: var(--vscode-descriptionForeground); line-height: 1.45; margin: 6px 0 16px 0; }
		.menuPath { color: #e8a33d; }
		body.vscode-light .menuPath { color: #a8650d; }
		details { border-top: 1px solid var(--vscode-widget-border); padding: 4px 0 12px; }
		.container > details[open] { border-top: 2px solid var(--vscode-focusBorder); margin-top: 8px; }
		summary { cursor: pointer; padding: 8px 0; font-size: 16px; font-weight: 600; list-style: none; display: flex; align-items: center; gap: 6px; }
		summary::-webkit-details-marker { display: none; }
		summary .chevron { display: inline-flex; transition: transform 0.1s; transform: rotate(-90deg); }
		details[open] > summary .chevron { transform: none; }
		.intro { color: var(--vscode-descriptionForeground); line-height: 1.45; margin: 0 0 10px 0; }
		.card { margin-top: 10px; padding: 10px 12px; border-radius: 4px; background: var(--vscode-sideBar-background); }
		.cardHead { display: flex; align-items: center; gap: 8px; }
		.cardName { flex: 1; font-weight: 600; color: var(--vscode-charts-blue); }
		.badge { font-size: 11px; padding: 1px 8px; border-radius: 10px; color: var(--vscode-descriptionForeground); border: 1px solid var(--vscode-widget-border); white-space: nowrap; }
		.badge.done { color: var(--vscode-testing-iconPassed); border-color: var(--vscode-testing-iconPassed); }
		.card p { margin: 6px 0 0 0; line-height: 1.45; }
		table.metrics { width: 100%; border-collapse: collapse; margin-top: 8px; font-size: 12px; }
		table.metrics th { text-align: left; font-weight: 600; color: var(--vscode-descriptionForeground); padding: 3px 8px 3px 0; border-bottom: 1px solid var(--vscode-widget-border); }
		table.metrics td { vertical-align: top; padding: 4px 8px 4px 0; line-height: 1.4; border-bottom: 1px solid var(--vscode-widget-border); }
		table.metrics tr:last-child td { border-bottom: none; }
		table.metrics .metricName { font-weight: 600; white-space: nowrap; }
		table.metrics .metricValues { white-space: nowrap; }
		.access, .download { font-size: 12px; color: var(--vscode-descriptionForeground); }
		.imports { margin-top: 6px; }
		.importRow { display: flex; align-items: center; gap: 8px; padding: 3px 0; font-size: 12px; }
		.importRow .importName { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
		.importRow .meta { color: var(--vscode-descriptionForeground); white-space: nowrap; }
		.actions { display: flex; gap: 8px; margin-top: 10px; }
		ul.using { margin: 0; padding-left: 20px; color: var(--vscode-descriptionForeground); line-height: 1.45; }
		ul.using li { margin-bottom: 6px; }
		ul.using b { color: var(--vscode-foreground); font-weight: 600; }
		.licence { font-size: 12px; color: var(--vscode-descriptionForeground); margin: 16px 0 0 0; }
	</style>
</head>
<body>
<div class="container">
	<div class="header">
		<h1>${text.title}</h1>
		<button class="link" id="showFeeds">${text.showFeeds}</button>
	</div>
	<p class="subtitle">${text.intro}</p>
	<div class="topActions">
		<button class="action pressed importFile">${text.importFile}</button>
		<button class="action" id="askAgent">${text.askAgent}</button>
	</div>
	<p class="help">${text.askAgentHelp}</p>

	<details open>
		<summary><span class="chevron"></span>${text.builtInSection}</summary>
		<p class="intro">${text.builtInIntro}</p>
		${builtIn.map(card).join('')}
	</details>

	<details open>
		<summary><span class="chevron"></span>${text.freeSection}</summary>
		<p class="intro">${text.freeIntro}</p>
		${free.map(card).join('')}
	</details>

	<details open>
		<summary><span class="chevron"></span>${text.accountSection}</summary>
		<p class="intro">${text.accountIntro}</p>
		${account.map(card).join('')}
	</details>

	<details>
		<summary><span class="chevron"></span>${text.usingSection}</summary>
		<ul class="using">
			<li>${text.usingTags}</li>
			<li>${text.usingFilter}</li>
			<li>${text.usingSql}</li>
		</ul>
	</details>
	<p class="licence">${text.licence}</p>
</div>
<script>
	const vscode = acquireVsCodeApi();
	const TEXT = ${JSON.stringify(text)};
	const SOURCES = ${JSON.stringify([...free, ...account].map(source => source.id))};
	const CHEVRON = '<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M3.15 5.65a.5.5 0 0 1 .7 0L8 9.79l4.15-4.14a.5.5 0 0 1 .7.7l-4.5 4.5a.5.5 0 0 1-.7 0l-4.5-4.5a.5.5 0 0 1 0-.7Z"/></svg>';
	for (const chevron of document.querySelectorAll('.chevron')) {
		chevron.innerHTML = CHEVRON;
	}

	function element(tag, className, content) {
		const node = document.createElement(tag);
		if (className) { node.className = className; }
		if (content) { node.textContent = content; }
		return node;
	}

	document.getElementById('showFeeds').addEventListener('click', () => vscode.postMessage({ command: 'showFeeds' }));
	document.getElementById('askAgent').addEventListener('click', () => vscode.postMessage({ command: 'askAgent' }));
	// The button pressed last stays blue; Import File... until one is pressed
	for (const button of document.querySelectorAll('.topActions button.action')) {
		button.addEventListener('click', () => {
			document.querySelectorAll('.topActions button.action.pressed').forEach(other => other.classList.remove('pressed'));
			button.classList.add('pressed');
		});
	}
	for (const button of document.querySelectorAll('.importFile')) {
		button.addEventListener('click', () => vscode.postMessage({ command: 'import' }));
	}
	for (const button of document.querySelectorAll('[data-url]')) {
		button.addEventListener('click', () => vscode.postMessage({ command: 'openLink', url: button.dataset.url }));
	}

	// Each source's files imported, with their latest year, when, and Remove
	function showImports(imports) {
		for (const source of SOURCES) {
			const list = document.getElementById('imports-' + source);
			const badge = document.getElementById('badge-' + source);
			const files = imports.filter(item => item.source === source);
			list.textContent = '';
			badge.textContent = files.length ? TEXT.imported : TEXT.notImported;
			badge.classList.toggle('done', files.length > 0);
			for (const item of files) {
				const row = element('div', 'importRow');
				row.appendChild(element('span', 'importName', item.name));
				const meta = [item.year ? TEXT.latestYear.replace('{0}', item.year) : '', item.imported].filter(Boolean).join(', ');
				row.appendChild(element('span', 'meta', meta));
				const remove = element('button', 'link', TEXT.remove);
				remove.addEventListener('click', () => vscode.postMessage({ command: 'remove', file: item.file }));
				row.appendChild(remove);
				list.appendChild(row);
			}
		}
	}

	window.addEventListener('message', event => {
		const message = event.data;
		if (message.command === 'imports') {
			showImports(message.imports);
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
			id: JOURNAL_METRICS_COMMAND_ID,
			title: localize2('journalMetrics.action', "Journal Metrics"),
			category: localize2('databases.category', "Databases"),
			f1: true,
			menu: [{ id: DatabaseConnectionContextMenu, when: ContextKeyExpr.and(DatabaseItemKind.isEqualTo('connection'), DatabaseItemId.isEqualTo(JOURNALS_DATABASE_ID)), group: '4_import', order: 0 }],
		});
	}
	run(accessor: ServicesAccessor): Promise<void> {
		return openJournalMetricsPage(accessor);
	}
});
