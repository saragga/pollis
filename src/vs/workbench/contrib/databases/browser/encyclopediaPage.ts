/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

// A page in the Minimal style of the scaffold that follows an article of an encyclopedia through its editions, for a
// headword the user looks up: its length, its share of its edition, its contributor where articles are signed and its
// text, with a link to its page of the scan. Britannica Through the Editions (britannicaPage.ts) and Larousse Through
// the Editions (laroussePage.ts) are made with it. The texts are downloaded the first time one is asked for, by the Julia
// extension.

import { DisposableStore } from '../../../../base/common/lifecycle.js';
import { localize } from '../../../../nls.js';
import { ICommandService } from '../../../../platform/commands/common/commands.js';
import { IFileService } from '../../../../platform/files/common/files.js';
import { ServiceIdentifier, ServicesAccessor } from '../../../../platform/instantiation/common/instantiation.js';
import { INotificationService } from '../../../../platform/notification/common/notification.js';
import { IOpenerService } from '../../../../platform/opener/common/opener.js';
import { IRequestService } from '../../../../platform/request/common/request.js';
import { IStorageService, StorageScope, StorageTarget } from '../../../../platform/storage/common/storage.js';
import { IEditorService } from '../../../services/editor/common/editorService.js';
import { IPathService } from '../../../services/path/common/pathService.js';
import { archivePageImages, archiveReaderUrl } from '../../browserView/common/internetArchive.js';
import { IScaffoldPanelData } from '../../model/browser/common/model.types.js';
import { registerScaffoldPageHandlers } from '../../model/browser/handlers/scaffoldPage.handler.js';
import { buildWebviewHtml, IScaffoldSqlStep, ONE_BLUE_BUTTON_CSS, ONE_BLUE_BUTTON_JS } from '../../model/browser/webviews/webviewScaffold.js';
import { INotebookEditorModelResolverService } from '../../notebook/common/notebookEditorModelResolverService.js';
import { INotebookKernelService } from '../../notebook/common/notebookKernelService.js';
import { WebviewInput } from '../../webviewPanel/browser/webviewEditorInput.js';
import { IWebviewWorkbenchService } from '../../webviewPanel/browser/webviewWorkbenchService.js';
import { IEncyclopedia, IEncyclopediaLookup, IEncyclopediaTextsAnswer } from '../common/encyclopedia.js';

/** The texts of a page that name its encyclopedia, its editions or its package; the others are the same on every page. */
export interface IEncyclopediaPageText {
	readonly intro: string;
	readonly placeholder: string;
	readonly lookUpHelp: string;
	/** The measure of the bars by share: per million characters of the edition. */
	readonly share: string;
	/** The share on a card, with {0} for the value. */
	readonly perMillion: string;
	/** The heading of the column of the editions' keys. */
	readonly editionColumn: string;
	readonly downloadingTexts: string;
	readonly noText: string;
	readonly noPackage: string;
	/** No article in any edition, with {0} for the headword. */
	readonly notFound: string;
	/** The editions and supplements that have the article, with {0} to {3}. */
	readonly editionsFound: string;
	/** What the editions that are not full editions are. */
	readonly partHelp: string;
	readonly missing: string;
	readonly loading: string;
	/** The database could not be read, with {0} for the error. */
	readonly error: string;
	readonly ocr: string;
}

/** What tells one page apart from another. */
export interface IEncyclopediaPage {
	/** The page's id, such as britannica, which names its view type, its Learn More and the keys it stores. */
	readonly id: string;
	readonly title: string;
	readonly metadata: IScaffoldPanelData;
	/** The service of the queries of the encyclopedia's database. */
	readonly service: ServiceIdentifier<IEncyclopedia>;
	/** The command of the Julia extension that finds the texts, and downloads them the first time (IEncyclopediaTextsAnswer). */
	readonly textsCommand: string;
	/** Whether the articles are signed, so that each card says who signed it. */
	readonly signatures: boolean;
	readonly text: IEncyclopediaPageText;
	/** The Next Steps: queries of the database, in the duckdb> terminal. */
	readonly nextSteps: readonly IScaffoldSqlStep[];
}

type EncyclopediaMessage =
	| { readonly command: 'ready' }
	| { readonly command: 'headword'; readonly headword: string }
	| { readonly command: 'text'; readonly id: number }
	| { readonly command: 'scanTab'; readonly value: ScanTab }
	| ({ readonly command: 'openScan'; readonly title: string } & IScanPage)
	| ({ readonly command: 'openArchive' } & IScanPage);

/** Where Open the Scan opens a page: in a new tab of Pollis's browser each time, or in the same tab, the one it opened last. */
type ScanTab = 'new' | 'same';

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

/** The open pages, by id, so a second request shows a page again. */
const openPages = new Map<string, WebviewInput>();

/** Opens the page of an encyclopedia, or shows it again when it is open. */
export async function openEncyclopediaPage(accessor: ServicesAccessor, page: IEncyclopediaPage): Promise<void> {
	const webviewWorkbenchService = accessor.get(IWebviewWorkbenchService);
	const encyclopedia = accessor.get(page.service);
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

	const open = openPages.get(page.id);
	if (open && !open.isDisposed()) {
		webviewWorkbenchService.revealWebview(open, open.group ?? -1, false);
		return;
	}
	const webviewInput = webviewWorkbenchService.openWebview(
		{
			title: page.title,
			options: { retainContextWhenHidden: true },
			contentOptions: { allowScripts: true, localResourceRoots: [] },
			extension: undefined,
		},
		`pollis.${page.id}`,
		page.title,
		undefined,
		{ group: undefined, preserveFocus: false }
	);
	webviewInput.webview.setHtml(pageHtml(page));
	openPages.set(page.id, webviewInput);

	const disposables = new DisposableStore();
	disposables.add(registerScaffoldPageHandlers(webviewInput, page.id, page.title, page.metadata, openerService, editorService, commandService, notificationService, notebookEditorModelResolverService, notebookKernelService, fileService, pathService, storageService));
	disposables.add(webviewInput.webview.onDidDispose(() => {
		openPages.delete(page.id);
		disposables.dispose();
	}));

	// A lookup answered with the lookup it answers, so that the page shows only the last one asked
	const lookUp = async (lookup: IEncyclopediaLookup) => {
		try {
			const result = await encyclopedia.lookup(lookup);
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
				let answer = await commandService.executeCommand<IEncyclopediaTextsAnswer>(page.textsCommand, { task: 'locate' });
				if (answer?.path === '') {
					webviewInput.webview.postMessage({ command: 'textDownloading', id });
					answer = await commandService.executeCommand<IEncyclopediaTextsAnswer>(page.textsCommand, { task: 'download' });
				}
				if (!answer?.path) {
					webviewInput.webview.postMessage({ command: 'text', id, error: answer?.error ?? 'failed' });
					return;
				}
				textsFile = answer.path;
			}
			webviewInput.webview.postMessage({ command: 'text', id, text: await encyclopedia.text(textsFile, id) });
		} catch (error) {
			webviewInput.webview.postMessage({ command: 'text', id, error: error instanceof Error ? error.message : String(error) });
		}
	};

	// The user's choice of tab for the scans, kept from one session to the next, and the key by which the browser reuses
	// the tab of the scans when the user chose the same tab
	const scanTabStorageKey = `pollis.${page.id}.scanTab`;
	const scanTabReuseKey = `pollis.${page.id}.scan`;
	const scanTab = (): ScanTab => storageService.get(scanTabStorageKey, StorageScope.PROFILE) === 'same' ? 'same' : 'new';

	disposables.add(webviewInput.webview.onMessage(async (e: { message: EncyclopediaMessage }) => {
		const message = e.message;
		switch (message.command) {
			case 'ready':
				try {
					webviewInput.webview.postMessage({ command: 'state', state: await encyclopedia.state(), scanTab: scanTab() });
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
					storageService.store(scanTabStorageKey, message.value, StorageScope.PROFILE, StorageTarget.USER);
				}
				break;
			case 'openScan':
				// The page of the scan opens as an image in Pollis's own browser, beside the page, titled with its edition, volume
				// and page, with Previous Page and Next Page on the browser's bar, in a new tab or in the tab of the scan opened
				// last; or in the archive's reader when there is no image
				if (isScanPage(message)) {
					const images = message.page === null ? undefined : await archivePageImages(requestService, message.item, message.file ?? undefined, scanTabReuseKey);
					const reuseKey = scanTab() === 'same' ? scanTabReuseKey : undefined;
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

/** The page: its texts come from here and from the page's own, the editions and articles from the `state` and `result` messages. */
function pageHtml(page: IEncyclopediaPage): string {
	const text = {
		...page.text,
		signatures: page.signatures,
		yourEntry: localize('encyclopedia.yourEntry', "Headword"),
		lookUp: localize('encyclopedia.lookUp', "Look Up"),
		characters: localize('encyclopedia.characters', "Length in Characters"),
		measure: localize('encyclopedia.measure', "Bars"),
		yearsColumn: localize('encyclopedia.yearsColumn', "Years"),
		perMillionShort: localize('encyclopedia.perMillionShort', "{0} per million"),
		noArticle: localize('encyclopedia.noArticle', "No article"),
		notInSupplement: localize('encyclopedia.notInSupplement', "Not in this supplement"),
		notInNewVolumes: localize('encyclopedia.notInNewVolumes', "Not in these new volumes"),
		notInVolumesRead: localize('encyclopedia.notInVolumesRead', "Not in the volumes read"),
		volumesRead: localize('encyclopedia.volumesRead', "The volumes read run from {0}."),
		chars: localize('encyclopedia.chars', "{0} characters"),
		signed: localize('encyclopedia.signed', "Signed {0}"),
		unsigned: localize('encyclopedia.unsigned', "Unsigned"),
		volumePage: localize('encyclopedia.volumePage', "Volume {0}, page {1} of the scan"),
		volume: localize('encyclopedia.volume', "Volume {0}"),
		openScan: localize('encyclopedia.openScan', "Open the Scan"),
		openArchive: localize('encyclopedia.openArchive', "Open in the Internet Archive"),
		scanTab: localize('encyclopedia.scanTab', "Open the Scan In"),
		newTab: localize('encyclopedia.newTab', "A New Tab"),
		sameTab: localize('encyclopedia.sameTab', "The Same Tab"),
		scanTitle: localize('encyclopedia.scanTitle', "{0}, Volume {1}, Page {2} of the Scan"),
		showText: localize('encyclopedia.showText', "Show the Text"),
		hideText: localize('encyclopedia.hideText', "Hide the Text"),
		readingText: localize('encyclopedia.readingText', "Reading the text..."),
		noJulia: localize('encyclopedia.noJulia', "The texts are downloaded with Julia, which is not installed."),
		textError: localize('encyclopedia.textError', "The text could not be read: {0}"),
		alsoUnder: localize('encyclopedia.alsoUnder', "Also under this headword"),
		suggestions: localize('encyclopedia.suggestions', "Headwords that start the same:"),
	};
	return buildWebviewHtml({
		title: page.title,
		omitPoweredBy: !page.metadata.packages.length,
		introHtml: text.intro,
		sqlSteps: [...page.nextSteps],
		extraCss: `
		.encyclopediaPage * { box-sizing: border-box; }
		.encyclopediaPage .label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.04em; color: var(--vscode-descriptionForeground); margin: 14px 0 6px 0; }
		.encyclopediaPage .lookup { display: flex; gap: 8px; align-items: center; }
		.encyclopediaPage .lookup input { flex: 1; min-width: 0; font: inherit; color: var(--vscode-input-foreground); background: var(--vscode-input-background); border: 1px solid var(--vscode-input-border, transparent); border-radius: 2px; padding: 4px 8px; }
		.encyclopediaPage .lookup input:focus { outline: 1px solid var(--vscode-focusBorder); }
		.encyclopediaPage button.action { font: inherit; color: var(--vscode-button-secondaryForeground); background: var(--vscode-button-secondaryBackground); border: none; box-shadow: inset 0 0 0 1px var(--vscode-button-background); border-radius: 2px; padding: 4px 12px; cursor: pointer; white-space: nowrap; font-size: 11px; opacity: 0.7; }
		.encyclopediaPage button.action:not(:disabled):hover { opacity: 1; }
		${ONE_BLUE_BUTTON_CSS.trim()}
		.encyclopediaPage .help, .encyclopediaPage .ocr { font-size: 12px; color: var(--vscode-descriptionForeground); line-height: 1.45; margin: 6px 0 0 0; }
		.encyclopediaPage .status { color: var(--vscode-descriptionForeground); margin-top: 16px; }
		.encyclopediaPage .measureRow { display: flex; align-items: center; gap: 10px; margin: 14px 0 6px 0; font-size: 12px; color: var(--vscode-descriptionForeground); }
		.encyclopediaPage .measureRow label { display: flex; align-items: center; gap: 4px; cursor: pointer; }
		.encyclopediaPage .bars { display: grid; grid-template-columns: max-content max-content 1fr max-content; gap: 3px 10px; align-items: center; font-size: 12px; }
		.encyclopediaPage .bars .head { font-size: 11px; font-weight: 600; color: var(--vscode-descriptionForeground); }
		.encyclopediaPage .bars .editionKey { text-align: right; font-variant-numeric: tabular-nums; }
		.encyclopediaPage .bars .years { color: var(--vscode-descriptionForeground); white-space: nowrap; font-variant-numeric: tabular-nums; }
		.encyclopediaPage .bars .track { height: 10px; background: var(--vscode-editorWidget-background); border-radius: 2px; overflow: hidden; }
		.encyclopediaPage .bars .fill { height: 100%; background: var(--vscode-charts-blue); border-radius: 2px; }
		.encyclopediaPage .bars .value { white-space: nowrap; font-variant-numeric: tabular-nums; color: var(--vscode-descriptionForeground); }
		.encyclopediaPage .bars .none { color: var(--vscode-disabledForeground); }
		.encyclopediaPage .edition { margin-top: 12px; padding: 10px 12px; border-radius: 4px; background: var(--vscode-sideBar-background); }
		.encyclopediaPage .editionHead { font-weight: 600; }
		.encyclopediaPage .editionHead .years { font-weight: normal; color: var(--vscode-descriptionForeground); margin-left: 6px; }
		.encyclopediaPage .article { margin-top: 8px; }
		.encyclopediaPage .articleTitle { font-weight: 600; }
		.encyclopediaPage .facts { font-size: 12px; color: var(--vscode-descriptionForeground); margin-top: 2px; display: flex; flex-wrap: wrap; gap: 4px 12px; align-items: center; }
		.encyclopediaPage .articleText { margin: 8px 0 0 0; max-height: 420px; overflow-y: auto; line-height: 1.5; padding-right: 6px; }
		.encyclopediaPage .articleText p { margin: 0 0 8px 0; }
		.encyclopediaPage .articleText .status { margin-top: 0; }
		.encyclopediaPage .others { font-size: 12px; color: var(--vscode-descriptionForeground); margin-top: 8px; }
		.encyclopediaPage .link { color: var(--vscode-textLink-foreground); cursor: pointer; background: none; border: none; padding: 0; font: inherit; }
		.encyclopediaPage .link:hover { color: var(--vscode-textLink-activeForeground); text-decoration: underline; }
		.encyclopediaPage .noArticle { color: var(--vscode-descriptionForeground); margin-top: 6px; }
`,
		bodyHtml: `
	<div class="encyclopediaPage">
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
	function editionOf(entry) {
		return editions.find(item => item.edition === entry.edition);
	}

	// What an edition without the article says: a supplement or new volumes left it to the volumes before them, and an
	// edition read in some of its volumes may have it in the others
	function absentText(edition, entry) {
		return entry.outsideVolumes ? TEXT.notInVolumesRead : edition && edition.kind === 'supplement' ? TEXT.notInSupplement : edition && edition.kind === 'newVolumes' ? TEXT.notInNewVolumes : TEXT.noArticle;
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
			const edition = editionOf(entry);
			const article = entry.articles[0];
			return article ? (measure === 'share' ? perMillion(article, edition) : article.chars) : 0;
		});
		const top = Math.max(...values, 1e-9);
		entries.forEach((entry, index) => {
			const edition = editionOf(entry);
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
				const value = element('span', 'value none', entry.outsideVolumes || (edition && edition.kind !== 'full' && edition.kind !== 'partial') ? absentText(edition, entry) : '—');
				if (entry.outsideVolumes && edition && edition.range) { value.title = format(TEXT.volumesRead, edition.range); }
				bars.appendChild(value);
			}
		});
		container.appendChild(bars);
	}

	// An edition: each article with its facts, its scan and its text
	function showEdition(container, entry) {
		const edition = editionOf(entry);
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
			if (TEXT.signatures) {
				facts.appendChild(element('span', '', first.signature ? format(TEXT.signed, first.signature) : TEXT.unsigned));
			}
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
			const absent = absentText(edition, entry);
			box.appendChild(element('div', 'noArticle', entry.outsideVolumes && edition && edition.range ? absent + '. ' + format(TEXT.volumesRead, edition.range) : absent));
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
		// The full editions, and those read in some volumes when the headword falls in them, apart from the supplements and
		// new volumes; an edition whose volumes read leave out the headword counts in neither
		const isFull = entry => { const edition = editionOf(entry); return !edition || edition.kind === 'full' || edition.kind === 'partial'; };
		const counted = result.entries.filter(entry => !entry.outsideVolumes);
		const full = counted.filter(isFull);
		const parts = counted.filter(entry => !isFull(entry));
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
