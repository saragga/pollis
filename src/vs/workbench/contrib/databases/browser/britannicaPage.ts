/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

// Britannica Through the Editions, a page in the Minimal style of the scaffold: an article of the Encyclopaedia
// Britannica in every edition from 1771 to 1929, its length, its share of its edition, its contributor and its text,
// with a link to its page of the scan, for a headword the user looks up. The texts are downloaded the first time one
// is asked for, by the Julia extension (language-julia.pollisBritannicaTexts). The Historical Geography and Archaeology
// Toolbox's menu opens it.

import { DisposableStore } from '../../../../base/common/lifecycle.js';
import { localize, localize2 } from '../../../../nls.js';
import { Action2, registerAction2 } from '../../../../platform/actions/common/actions.js';
import { ICommandService } from '../../../../platform/commands/common/commands.js';
import { ContextKeyExpr } from '../../../../platform/contextkey/common/contextkey.js';
import { IFileService } from '../../../../platform/files/common/files.js';
import { ServicesAccessor } from '../../../../platform/instantiation/common/instantiation.js';
import { INotificationService } from '../../../../platform/notification/common/notification.js';
import { IOpenerService } from '../../../../platform/opener/common/opener.js';
import { IRequestService } from '../../../../platform/request/common/request.js';
import { IStorageService, StorageScope, StorageTarget } from '../../../../platform/storage/common/storage.js';
import { IEditorService } from '../../../services/editor/common/editorService.js';
import { IPathService } from '../../../services/path/common/pathService.js';
import { archivePageImages, archiveReaderUrl } from '../../browserView/common/internetArchive.js';
import { registerScaffoldPageHandlers } from '../../model/browser/handlers/scaffoldPage.handler.js';
import { BRITANNICA_METADATA } from '../../model/browser/webviews/britannica.data.js';
import { buildWebviewHtml, IScaffoldSqlStep, ONE_BLUE_BUTTON_CSS, ONE_BLUE_BUTTON_JS } from '../../model/browser/webviews/webviewScaffold.js';
import { INotebookEditorModelResolverService } from '../../notebook/common/notebookEditorModelResolverService.js';
import { INotebookKernelService } from '../../notebook/common/notebookKernelService.js';
import { WebviewInput } from '../../webviewPanel/browser/webviewEditorInput.js';
import { IWebviewWorkbenchService } from '../../webviewPanel/browser/webviewWorkbenchService.js';
import { BRITANNICA_COMMAND_ID, BRITANNICA_TEXTS_COMMAND_ID, IBritannicaLookup, IBritannicaService, IBritannicaTextsAnswer } from '../common/britannica.js';
import { BRITANNICA_DATABASE_ID } from '../common/databaseDrivers.js';
import { DatabaseConnectionContextMenu, DatabaseItemId, DatabaseItemKind } from './connectionsView.js';

type BritannicaMessage =
	| { readonly command: 'ready' }
	| { readonly command: 'headword'; readonly headword: string }
	| { readonly command: 'text'; readonly id: number }
	| { readonly command: 'scanTab'; readonly value: ScanTab }
	| ({ readonly command: 'openScan'; readonly title: string } & IScanPage)
	| ({ readonly command: 'openArchive' } & IScanPage);

/** Where Open the Scan opens a page: in a new tab of Pollis's browser each time, or in the same tab, the one it opened last. */
type ScanTab = 'new' | 'same';

/** The user's choice of tab for the scans, kept from one session to the next. */
const SCAN_TAB_STORAGE_KEY = 'pollis.britannica.scanTab';

/** The key by which the browser reuses the tab of the scans, when the user chose the same tab. */
const SCAN_TAB_REUSE_KEY = 'pollis.britannica.scan';

/** A page of a scan: an item of the Internet Archive, the file of its volume when the item holds more than one, and the page's index in the scan. */
interface IScanPage {
	readonly item: string;
	readonly file: string | null;
	readonly page: number | null;
}

/** Whether a message from the page names a page of a scan. */
function isScanPage(message: object): message is IScanPage {
	const scan = message as Partial<IScanPage>;
	return typeof scan.item === 'string' && scan.item.length > 0
		&& (scan.file === null || typeof scan.file === 'string')
		&& (scan.page === null || (typeof scan.page === 'number' && Number.isInteger(scan.page) && scan.page >= 0));
}

/** The page in the Internet Archive's reader, or the item when the page is not known. */
function archivePage(scan: IScanPage): string {
	return archiveReaderUrl(scan.item, scan.file ?? undefined, scan.page ?? undefined);
}

/** The Next Steps: queries of PollisBritannica, in the duckdb> terminal. */
function nextSteps(): IScaffoldSqlStep[] {
	return [
		{
			id: 'throughEditions',
			label: localize('britannica.throughEditions', "An Article Through the Editions"),
			desc: localize('britannica.throughEditionsDescription', "Each edition's articles under a headword, with their length, their share of the edition per million characters, and their contributor. Replace VIVALDI with your headword, in capitals A to Z only, as the key column has it."),
			sql: `-- The headword, in capitals A to Z only: replace it with your own
SELECT e.years, e.label, a.title, a.chars, round(1e6 * a.chars / e.chars, 1) AS per_million, a.signature, a.volume, a.page
FROM PollisBritannica.articles a JOIN PollisBritannica.editions e USING (edition)
WHERE a.key = 'VIVALDI'
ORDER BY try_cast(regexp_extract(a.edition, '^\\d+') AS INTEGER), a.edition, a.chars DESC`,
		},
		{
			id: 'longestArticles',
			label: localize('britannica.longestArticles', "Longest Articles of an Edition"),
			desc: localize('britannica.longestArticlesDescription', "The fifty longest articles of an edition, with their contributors. Replace 11 with the edition: 1 to 14, or 3S and 6S for the supplements."),
			sql: `-- The edition: replace it with your own
SELECT title, chars, signature, volume
FROM PollisBritannica.articles
WHERE edition = '11'
ORDER BY chars DESC
LIMIT 50`,
		},
		{
			id: 'grewShrank',
			label: localize('britannica.grewShrank', "Articles That Grew or Shrank"),
			desc: localize('britannica.grewShrankDescription', "The articles of the eleventh edition (1911) found again in the fourteenth (1929) under the same title, by how much their length changed, the most cut first. Change the order to see those that grew."),
			sql: `-- Two editions, and the articles of at least 5,000 characters in the first
WITH a AS (SELECT key, title, chars FROM PollisBritannica.articles WHERE edition = '11' AND chars >= 5000),
b AS (SELECT key, title, chars FROM PollisBritannica.articles WHERE edition = '14')
SELECT a.title, a.chars AS chars_1911, b.chars AS chars_1929, round(b.chars / a.chars, 2) AS ratio
FROM a JOIN b USING (key, title)
ORDER BY ratio
LIMIT 100`,
		},
		{
			id: 'contributors',
			label: localize('britannica.contributors', "Contributors of an Edition"),
			desc: localize('britannica.contributorsDescription', "The initials that sign the most text of an edition, with their articles and characters. The initials are as the scan reads them, so one contributor may appear under two spellings. Replace 9 with the edition."),
			sql: `-- The edition: replace it with your own
SELECT signature, count(*) AS articles, sum(chars) AS chars, arg_max(title, chars) AS longest
FROM PollisBritannica.articles
WHERE edition = '9' AND signature IS NOT NULL
GROUP BY signature
ORDER BY chars DESC
LIMIT 50`,
		},
	];
}

/** The open page, so a second request shows it again. */
let openPage: WebviewInput | undefined;

/** Opens Britannica Through the Editions, or shows it again when it is open. */
async function openBritannicaPage(accessor: ServicesAccessor): Promise<void> {
	const webviewWorkbenchService = accessor.get(IWebviewWorkbenchService);
	const britannicaService = accessor.get(IBritannicaService);
	const commandService = accessor.get(ICommandService);
	const requestService = accessor.get(IRequestService);
	const openerService = accessor.get(IOpenerService);
	const editorService = accessor.get(IEditorService);
	const notificationService = accessor.get(INotificationService);
	const notebookEditorModelResolverService = accessor.get(INotebookEditorModelResolverService);
	const notebookKernelService = accessor.get(INotebookKernelService);
	const fileService = accessor.get(IFileService);
	const pathService = accessor.get(IPathService);
	const storageService = accessor.get(IStorageService);

	if (openPage && !openPage.isDisposed()) {
		webviewWorkbenchService.revealWebview(openPage, openPage.group ?? -1, false);
		return;
	}
	const title = localize('britannica.title', "Britannica Through the Editions");
	const webviewInput = webviewWorkbenchService.openWebview(
		{
			title,
			options: { retainContextWhenHidden: true },
			contentOptions: { allowScripts: true, localResourceRoots: [] },
			extension: undefined,
		},
		'pollis.britannica',
		title,
		undefined,
		{ group: undefined, preserveFocus: false }
	);
	webviewInput.webview.setHtml(pageHtml());
	openPage = webviewInput;

	const disposables = new DisposableStore();
	disposables.add(registerScaffoldPageHandlers(webviewInput, 'britannica', title, BRITANNICA_METADATA.britannica, openerService, editorService, commandService, notificationService, notebookEditorModelResolverService, notebookKernelService, fileService, pathService, storageService));
	disposables.add(webviewInput.webview.onDidDispose(() => {
		openPage = undefined;
		disposables.dispose();
	}));

	// A lookup answered with the lookup it answers, so that the page shows only the last one asked
	const lookUp = async (lookup: IBritannicaLookup) => {
		try {
			const result = await britannicaService.lookup(lookup);
			webviewInput.webview.postMessage({ command: 'result', lookup, result });
		} catch (error) {
			webviewInput.webview.postMessage({ command: 'error', lookup, message: error instanceof Error ? error.message : String(error) });
		}
	};

	// The text of an article, from the file of the texts, which is found, or downloaded, the first time a text is asked for
	let textsFile: string | undefined;
	const showText = async (id: number) => {
		try {
			if (!textsFile) {
				let answer = await commandService.executeCommand<IBritannicaTextsAnswer>(BRITANNICA_TEXTS_COMMAND_ID, { task: 'locate' });
				if (answer?.path === '') {
					webviewInput.webview.postMessage({ command: 'textDownloading', id });
					answer = await commandService.executeCommand<IBritannicaTextsAnswer>(BRITANNICA_TEXTS_COMMAND_ID, { task: 'download' });
				}
				if (!answer?.path) {
					webviewInput.webview.postMessage({ command: 'text', id, error: answer?.error ?? 'failed' });
					return;
				}
				textsFile = answer.path;
			}
			webviewInput.webview.postMessage({ command: 'text', id, text: await britannicaService.text(textsFile, id) });
		} catch (error) {
			webviewInput.webview.postMessage({ command: 'text', id, error: error instanceof Error ? error.message : String(error) });
		}
	};

	const scanTab = (): ScanTab => storageService.get(SCAN_TAB_STORAGE_KEY, StorageScope.PROFILE) === 'same' ? 'same' : 'new';

	disposables.add(webviewInput.webview.onMessage(async (e: { message: BritannicaMessage }) => {
		const message = e.message;
		switch (message.command) {
			case 'ready':
				try {
					webviewInput.webview.postMessage({ command: 'state', state: await britannicaService.state(), scanTab: scanTab() });
				} catch (error) {
					webviewInput.webview.postMessage({ command: 'error', message: error instanceof Error ? error.message : String(error) });
				}
				break;
			case 'headword':
				if (typeof message.headword === 'string' && message.headword.trim()) {
					await lookUp({ headword: message.headword.trim().slice(0, 200) });
				}
				break;
			case 'text':
				if (typeof message.id === 'number' && Number.isInteger(message.id)) {
					await showText(message.id);
				}
				break;
			case 'scanTab':
				if (message.value === 'new' || message.value === 'same') {
					storageService.store(SCAN_TAB_STORAGE_KEY, message.value, StorageScope.PROFILE, StorageTarget.USER);
				}
				break;
			case 'openScan':
				// The page of the scan opens as an image in Pollis's own browser, beside the page, titled with its edition, volume
				// and page, with Previous Page and Next Page on the browser's bar, in a new tab or in the tab of the scan opened
				// last; or in the archive's reader when there is no image
				if (isScanPage(message)) {
					const images = message.page === null ? undefined : await archivePageImages(requestService, message.item, message.file ?? undefined, 'pollis.britannica.scan');
					const reuseKey = scanTab() === 'same' ? SCAN_TAB_REUSE_KEY : undefined;
					const title = typeof message.title === 'string' && message.title.includes('{page}') ? message.title.slice(0, 200) : undefined;
					await commandService.executeCommand('workbench.action.browser.open', images && message.page !== null
						? { pages: { url: images, title, first: 0, page: message.page }, reuseKey }
						: { url: archivePage(message), reuseKey });
				}
				break;
			case 'openArchive':
				if (isScanPage(message)) {
					await commandService.executeCommand('workbench.action.browser.open', archivePage(message));
				}
				break;
		}
	}));
}

/** The page: its texts come from here, the editions and articles from the `state` and `result` messages. */
function pageHtml(): string {
	const text = {
		intro: localize('britannica.intro', "The articles of the Encyclopaedia Britannica in every edition from the first, of 1768 to 1771, to the fourteenth, of 1929, read from the scans of the Internet Archive: how long each article is, its share of its edition, who signed it and its text, with a link to its page of the scan. Look up a headword."),
		yourEntry: localize('britannica.yourEntry', "Headword"),
		placeholder: localize('britannica.placeholder', "A headword, such as VIVALDI, or DARWIN, CHARLES"),
		lookUp: localize('britannica.lookUp', "Look Up"),
		lookUpHelp: localize('britannica.lookUpHelp', "The headword as the Britannica prints it, its first word or words before a comma; the words after a comma, a first name for example, pick the articles whose title has them."),
		characters: localize('britannica.characters', "Length in Characters"),
		share: localize('britannica.share', "Per Million Characters of the Edition"),
		measure: localize('britannica.measure', "Bars"),
		editionColumn: localize('britannica.editionColumn', "Edition"),
		yearsColumn: localize('britannica.yearsColumn', "Years"),
		perMillionShort: localize('britannica.perMillionShort', "{0} per million"),
		noArticle: localize('britannica.noArticle', "No article"),
		notInSupplement: localize('britannica.notInSupplement', "Not in this supplement"),
		notInNewVolumes: localize('britannica.notInNewVolumes', "Not in these new volumes"),
		chars: localize('britannica.chars', "{0} characters"),
		perMillion: localize('britannica.perMillion', "{0} per million characters of the edition"),
		signed: localize('britannica.signed', "Signed {0}"),
		unsigned: localize('britannica.unsigned', "Unsigned"),
		volumePage: localize('britannica.volumePage', "Volume {0}, page {1} of the scan"),
		volume: localize('britannica.volume', "Volume {0}"),
		openScan: localize('britannica.openScan', "Open the Scan"),
		openArchive: localize('britannica.openArchive', "Open in the Internet Archive"),
		scanTab: localize('britannica.scanTab', "Open the Scan In"),
		newTab: localize('britannica.newTab', "A New Tab"),
		sameTab: localize('britannica.sameTab', "The Same Tab"),
		scanTitle: localize('britannica.scanTitle', "{0}, Volume {1}, Page {2} of the Scan"),
		showText: localize('britannica.showText', "Show the Text"),
		hideText: localize('britannica.hideText', "Hide the Text"),
		readingText: localize('britannica.readingText', "Reading the text..."),
		downloadingTexts: localize('britannica.downloadingTexts', "Downloading the texts of the Britannica, about 535 MB: a minute or more, the first time only..."),
		noText: localize('britannica.noText', "PollisBritannica has no text for this article."),
		noJulia: localize('britannica.noJulia', "The texts are downloaded with Julia, which is not installed."),
		noPackage: localize('britannica.noPackage', "PollisBritannica.jl is not installed yet, or is older than its texts: Pollis installs and updates it when the Julia REPL starts."),
		textError: localize('britannica.textError', "The text could not be read: {0}"),
		alsoUnder: localize('britannica.alsoUnder', "Also under this headword"),
		notFound: localize('britannica.notFound', "No article under {0} in any edition."),
		suggestions: localize('britannica.suggestions', "Headwords that start the same:"),
		editionsFound: localize('britannica.editionsFound', "In {0} of {1} editions and {2} of {3} supplements."),
		partHelp: localize('britannica.partHelp', "The supplements (3S, 6S) and the new volumes of the tenth, twelfth and thirteenth editions added articles to the editions before them, whose volumes readers kept: an article they leave out was still in those volumes."),
		missing: localize('britannica.missing', "PollisBritannica is not on this computer yet. Pollis installs it with its other built-in databases when the Julia REPL starts: start the REPL, and open this page again once it is ready."),
		loading: localize('britannica.loading', "Reading PollisBritannica..."),
		error: localize('britannica.error', "PollisBritannica could not be read: {0}"),
		ocr: localize('britannica.ocr', "The articles are found in the text the Internet Archive read from each scan: an article whose headword the scan misread, or that runs into the next, may be missing or longer than it is. The page of the scan shows it as printed."),
	};
	return buildWebviewHtml({
		title: localize('britannica.title', "Britannica Through the Editions"),
		omitPoweredBy: !BRITANNICA_METADATA.britannica.packages.length,
		introHtml: text.intro,
		sqlSteps: nextSteps(),
		extraCss: `
		.britannicaPage * { box-sizing: border-box; }
		.britannicaPage .label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.04em; color: var(--vscode-descriptionForeground); margin: 14px 0 6px 0; }
		.britannicaPage .lookup { display: flex; gap: 8px; align-items: center; }
		.britannicaPage .lookup input { flex: 1; min-width: 0; font: inherit; color: var(--vscode-input-foreground); background: var(--vscode-input-background); border: 1px solid var(--vscode-input-border, transparent); border-radius: 2px; padding: 4px 8px; }
		.britannicaPage .lookup input:focus { outline: 1px solid var(--vscode-focusBorder); }
		.britannicaPage button.action { font: inherit; color: var(--vscode-button-secondaryForeground); background: var(--vscode-button-secondaryBackground); border: none; box-shadow: inset 0 0 0 1px var(--vscode-button-background); border-radius: 2px; padding: 4px 12px; cursor: pointer; white-space: nowrap; font-size: 11px; opacity: 0.7; }
		.britannicaPage button.action:not(:disabled):hover { opacity: 1; }
		${ONE_BLUE_BUTTON_CSS.trim()}
		.britannicaPage .help, .britannicaPage .ocr { font-size: 12px; color: var(--vscode-descriptionForeground); line-height: 1.45; margin: 6px 0 0 0; }
		.britannicaPage .status { color: var(--vscode-descriptionForeground); margin-top: 16px; }
		.britannicaPage .measureRow { display: flex; align-items: center; gap: 10px; margin: 14px 0 6px 0; font-size: 12px; color: var(--vscode-descriptionForeground); }
		.britannicaPage .measureRow label { display: flex; align-items: center; gap: 4px; cursor: pointer; }
		.britannicaPage .bars { display: grid; grid-template-columns: max-content max-content 1fr max-content; gap: 3px 10px; align-items: center; font-size: 12px; }
		.britannicaPage .bars .head { font-size: 11px; font-weight: 600; color: var(--vscode-descriptionForeground); }
		.britannicaPage .bars .editionKey { text-align: right; font-variant-numeric: tabular-nums; }
		.britannicaPage .bars .years { color: var(--vscode-descriptionForeground); white-space: nowrap; font-variant-numeric: tabular-nums; }
		.britannicaPage .bars .track { height: 10px; background: var(--vscode-editorWidget-background); border-radius: 2px; overflow: hidden; }
		.britannicaPage .bars .fill { height: 100%; background: var(--vscode-charts-blue); border-radius: 2px; }
		.britannicaPage .bars .value { white-space: nowrap; font-variant-numeric: tabular-nums; color: var(--vscode-descriptionForeground); }
		.britannicaPage .bars .none { color: var(--vscode-disabledForeground); }
		.britannicaPage .edition { margin-top: 12px; padding: 10px 12px; border-radius: 4px; background: var(--vscode-sideBar-background); }
		.britannicaPage .editionHead { font-weight: 600; }
		.britannicaPage .editionHead .years { font-weight: normal; color: var(--vscode-descriptionForeground); margin-left: 6px; }
		.britannicaPage .article { margin-top: 8px; }
		.britannicaPage .articleTitle { font-weight: 600; }
		.britannicaPage .facts { font-size: 12px; color: var(--vscode-descriptionForeground); margin-top: 2px; display: flex; flex-wrap: wrap; gap: 4px 12px; align-items: center; }
		.britannicaPage .articleText { margin: 8px 0 0 0; max-height: 420px; overflow-y: auto; line-height: 1.5; padding-right: 6px; }
		.britannicaPage .articleText p { margin: 0 0 8px 0; }
		.britannicaPage .articleText .status { margin-top: 0; }
		.britannicaPage .others { font-size: 12px; color: var(--vscode-descriptionForeground); margin-top: 8px; }
		.britannicaPage .link { color: var(--vscode-textLink-foreground); cursor: pointer; background: none; border: none; padding: 0; font: inherit; }
		.britannicaPage .link:hover { color: var(--vscode-textLink-activeForeground); text-decoration: underline; }
		.britannicaPage .noArticle { color: var(--vscode-descriptionForeground); margin-top: 6px; }
`,
		bodyHtml: `
	<div class="britannicaPage">
	<div id="main"><p class="status">${text.loading}</p></div>
	</div>`,
		pageScriptJs: `
	(() => {
	const TEXT = ${JSON.stringify(text)};
	const main = document.getElementById('main');
	let editions = [];
	// The texts read, by article, and the articles whose text is shown
	const texts = new Map();
	const opened = new Set();
	let shown = undefined;
	let measure = 'share';
	let scanTab = 'new';

	function element(tag, className, content) {
		const node = document.createElement(tag);
		if (className) { node.className = className; }
		if (content !== undefined) { node.textContent = content; }
		return node;
	}
	function format(template, ...values) {
		return values.reduce((result, value, index) => result.split('{' + index + '}').join(value), template);
	}
	function number(value) {
		return Number(value).toLocaleString();
	}
	function perMillion(article, edition) {
		return edition && edition.chars ? 1e6 * article.chars / edition.chars : 0;
	}
	function perMillionText(value) {
		return value >= 10 ? value.toFixed(0) : value >= 1 ? value.toFixed(1) : value.toFixed(2);
	}

	// What an edition without the article says: a supplement or new volumes left it to the volumes before them
	function absentText(edition) {
		return edition && edition.kind === 'supplement' ? TEXT.notInSupplement : edition && edition.kind === 'newVolumes' ? TEXT.notInNewVolumes : TEXT.noArticle;
	}

	// The lookup, once the editions are known
	function showControls(state) {
		main.textContent = '';
		if (state.kind === 'missing') {
			main.appendChild(element('p', 'status', TEXT.missing));
			return;
		}
		editions = state.editions;
		main.appendChild(element('div', 'label', TEXT.yourEntry));
		const lookup = element('div', 'lookup bar');
		const input = element('input');
		input.type = 'text';
		input.id = 'headword';
		input.placeholder = TEXT.placeholder;
		const button = element('button', 'action current', TEXT.lookUp);
		const send = () => {
			if (input.value.trim()) {
				vscode.postMessage({ command: 'headword', headword: input.value });
			}
		};
		button.addEventListener('click', send);
		input.addEventListener('keydown', event => { if (event.key === 'Enter') { send(); } });
		lookup.appendChild(input);
		lookup.appendChild(button);
		main.appendChild(lookup);
		main.appendChild(element('p', 'help', TEXT.lookUpHelp));
		// Where Open the Scan opens a page: the choice is kept by Pollis
		const tabRow = element('div', 'measureRow');
		tabRow.appendChild(element('span', '', TEXT.scanTab));
		for (const [value, label] of [['new', TEXT.newTab], ['same', TEXT.sameTab]]) {
			const option = element('label');
			const radio = element('input');
			radio.type = 'radio';
			radio.name = 'scanTab';
			radio.checked = scanTab === value;
			radio.addEventListener('change', () => { scanTab = value; vscode.postMessage({ command: 'scanTab', value }); });
			option.appendChild(radio);
			option.appendChild(document.createTextNode(label));
			tabRow.appendChild(option);
		}
		main.appendChild(tabRow);
		main.appendChild(element('div', '', undefined)).id = 'result';
		main.appendChild(element('p', 'ocr', TEXT.ocr));
		input.focus();
	}

	// The bars, an edition each: the longest article under the headword, by characters or by share of its edition
	function showBars(container, entries) {
		const row = element('div', 'measureRow');
		row.appendChild(element('span', '', TEXT.measure));
		for (const [value, label] of [['share', TEXT.share], ['chars', TEXT.characters]]) {
			const option = element('label');
			const radio = element('input');
			radio.type = 'radio';
			radio.name = 'measure';
			radio.checked = measure === value;
			radio.addEventListener('change', () => { measure = value; showResult(); });
			option.appendChild(radio);
			option.appendChild(document.createTextNode(label));
			row.appendChild(option);
		}
		container.appendChild(row);
		const bars = element('div', 'bars');
		for (const heading of [TEXT.editionColumn, TEXT.yearsColumn, '', '']) {
			bars.appendChild(element('span', 'head', heading));
		}
		const values = entries.map(entry => {
			const edition = editions.find(item => item.edition === entry.edition);
			const article = entry.articles[0];
			return article ? (measure === 'share' ? perMillion(article, edition) : article.chars) : 0;
		});
		const top = Math.max(...values, 1e-9);
		entries.forEach((entry, index) => {
			const edition = editions.find(item => item.edition === entry.edition);
			const key = element('span', 'editionKey', entry.edition);
			key.title = edition ? edition.label : '';
			bars.appendChild(key);
			bars.appendChild(element('span', 'years', edition ? edition.years : ''));
			const track = element('div', 'track');
			const fill = element('div', 'fill');
			fill.style.width = (100 * values[index] / top).toFixed(2) + '%';
			track.appendChild(fill);
			bars.appendChild(track);
			const article = entry.articles[0];
			if (article) {
				const value = element('span', 'value', measure === 'share' ? format(TEXT.perMillionShort, perMillionText(values[index])) : number(article.chars));
				value.title = article.title;
				bars.appendChild(value);
			} else {
				bars.appendChild(element('span', 'value none', edition && edition.kind !== 'full' ? absentText(edition) : '—'));
			}
		});
		container.appendChild(bars);
	}

	// An edition: each article with its facts, its scan and its text
	function showEdition(container, entry) {
		const edition = editions.find(item => item.edition === entry.edition);
		const box = element('div', 'edition');
		const head = element('div', 'editionHead', edition ? edition.label : entry.edition);
		head.appendChild(element('span', 'years', edition ? edition.years : ''));
		box.appendChild(head);
		const [first, ...others] = entry.articles;
		if (first) {
			const article = element('div', 'article');
			article.appendChild(element('div', 'articleTitle', first.title));
			const facts = element('div', 'facts');
			facts.appendChild(element('span', '', format(TEXT.chars, number(first.chars))));
			facts.appendChild(element('span', '', format(TEXT.perMillion, perMillionText(perMillion(first, edition)))));
			facts.appendChild(element('span', '', first.signature ? format(TEXT.signed, first.signature) : TEXT.unsigned));
			const volume = first.volume.split('.')[0];
			facts.appendChild(element('span', '', first.page === null ? format(TEXT.volume, volume) : format(TEXT.volumePage, volume, first.page)));
			const page = { item: first.item, file: first.file, page: first.page };
			if (first.page !== null) {
				const scan = element('button', 'link', TEXT.openScan);
				// The title of every page of the scan, with {page} where the browser puts the page's number
				const scanTitle = format(TEXT.scanTitle, edition ? edition.label : entry.edition, volume, '{page}');
				scan.addEventListener('click', () => vscode.postMessage({ command: 'openScan', title: scanTitle, ...page }));
				facts.appendChild(scan);
			}
			const archive = element('button', 'link', TEXT.openArchive);
			archive.addEventListener('click', () => vscode.postMessage({ command: 'openArchive', ...page }));
			facts.appendChild(archive);
			const toggle = element('button', 'link', opened.has(first.id) ? TEXT.hideText : TEXT.showText);
			facts.appendChild(toggle);
			article.appendChild(facts);
			const body = element('div', 'articleText');
			body.dataset.id = String(first.id);
			body.hidden = !opened.has(first.id);
			if (opened.has(first.id)) { fillText(body, texts.get(first.id)); }
			toggle.addEventListener('click', () => {
				if (opened.has(first.id)) {
					opened.delete(first.id);
					body.hidden = true;
					toggle.textContent = TEXT.showText;
					return;
				}
				opened.add(first.id);
				body.hidden = false;
				toggle.textContent = TEXT.hideText;
				fillText(body, texts.get(first.id));
				if (!texts.has(first.id)) { vscode.postMessage({ command: 'text', id: first.id }); }
			});
			article.appendChild(body);
			box.appendChild(article);
		} else {
			box.appendChild(element('div', 'noArticle', absentText(edition)));
		}
		if (others.length) {
			box.appendChild(element('div', 'others', TEXT.alsoUnder + ': ' + others.map(other => other.title + ' (' + number(other.chars) + ')').join('; ')));
		}
		container.appendChild(box);
	}

	// The text of an article, a paragraph a line, or what stands in its place while it is read
	function fillText(body, entry) {
		body.textContent = '';
		if (!entry) {
			body.appendChild(element('p', 'status', TEXT.readingText));
		} else if (entry.error) {
			const message = entry.error === 'noJulia' ? TEXT.noJulia : entry.error === 'noPackage' ? TEXT.noPackage : format(TEXT.textError, entry.error);
			body.appendChild(element('p', 'status', message));
		} else if (entry.text === null || entry.text === undefined) {
			body.appendChild(element('p', 'status', TEXT.noText));
		} else {
			for (const paragraph of entry.text.split('\\n')) {
				if (paragraph.trim()) { body.appendChild(element('p', '', paragraph)); }
			}
		}
	}
	function textBodies(id) {
		return document.querySelectorAll('.articleText[data-id="' + id + '"]');
	}

	function showResult() {
		const container = document.getElementById('result');
		if (!container || !shown) { return; }
		container.textContent = '';
		const { lookup, result } = shown;
		if (!result.entries.length) {
			container.appendChild(element('p', 'status', format(TEXT.notFound, lookup.headword || '')));
			if (result.suggestions.length) {
				const line = element('p', 'help', TEXT.suggestions + ' ');
				result.suggestions.forEach((key, index) => {
					const link = element('button', 'link', key);
					link.addEventListener('click', () => {
						document.getElementById('headword').value = key;
						vscode.postMessage({ command: 'headword', headword: key });
					});
					line.appendChild(link);
					if (index < result.suggestions.length - 1) { line.appendChild(document.createTextNode(', ')); }
				});
				container.appendChild(line);
			}
			return;
		}
		const isFull = entry => { const edition = editions.find(item => item.edition === entry.edition); return !edition || edition.kind === 'full'; };
		const full = result.entries.filter(isFull);
		const parts = result.entries.filter(entry => !isFull(entry));
		const found = entries => entries.filter(entry => entry.articles.length).length;
		container.appendChild(element('p', 'help', format(TEXT.editionsFound, found(full), full.length, found(parts), parts.length)));
		container.appendChild(element('p', 'help', TEXT.partHelp));
		showBars(container, result.entries);
		for (const entry of result.entries) {
			showEdition(container, entry);
		}
	}

	${ONE_BLUE_BUTTON_JS.trim()}

	window.addEventListener('message', event => {
		const message = event.data;
		if (message.command === 'state') {
			scanTab = message.scanTab === 'same' ? 'same' : 'new';
			showControls(message.state);
		} else if (message.command === 'result') {
			shown = { lookup: message.lookup, result: message.result };
			showResult();
		} else if (message.command === 'textDownloading') {
			for (const body of textBodies(message.id)) {
				body.textContent = '';
				body.appendChild(element('p', 'status', TEXT.downloadingTexts));
			}
		} else if (message.command === 'text') {
			const entry = { text: message.text, error: message.error };
			// An error is shown but not kept, so that opening the text again asks again
			if (!entry.error) { texts.set(message.id, entry); }
			for (const body of textBodies(message.id)) {
				fillText(body, entry);
			}
		} else if (message.command === 'error') {
			const container = document.getElementById('result') || main;
			container.textContent = '';
			container.appendChild(element('p', 'status', format(TEXT.error, message.message)));
		}
	});
	vscode.postMessage({ command: 'ready' });
	})();
`,
	});
}

registerAction2(class extends Action2 {
	constructor() {
		super({
			id: BRITANNICA_COMMAND_ID,
			title: localize2('britannica.action', "Britannica Through the Editions"),
			category: localize2('databases.category', "Databases"),
			f1: true,
			menu: [{ id: DatabaseConnectionContextMenu, when: ContextKeyExpr.and(DatabaseItemKind.isEqualTo('connection'), DatabaseItemId.isEqualTo(BRITANNICA_DATABASE_ID)), group: '4_import', order: 0 }],
		});
	}
	run(accessor: ServicesAccessor): Promise<void> {
		return openBritannicaPage(accessor);
	}
});
