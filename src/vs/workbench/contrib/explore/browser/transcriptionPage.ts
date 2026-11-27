/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { RunOnceScheduler } from '../../../../base/common/async.js';
import { DisposableStore, MutableDisposable } from '../../../../base/common/lifecycle.js';
import { basename, dirname, joinPath } from '../../../../base/common/resources.js';
import { hasKey } from '../../../../base/common/types.js';
import { URI } from '../../../../base/common/uri.js';
import { TokenizationRegistry } from '../../../../editor/common/languages.js';
import { ILanguageService } from '../../../../editor/common/languages/language.js';
import { generateTokensCSSForColorMap } from '../../../../editor/common/languages/supports/tokenization.js';
import { tokenizeToString } from '../../../../editor/common/languages/textToHtmlTokenizer.js';
import { localize, localize2 } from '../../../../nls.js';
import { Action2, registerAction2 } from '../../../../platform/actions/common/actions.js';
import { IClipboardService } from '../../../../platform/clipboard/common/clipboardService.js';
import { ICommandService } from '../../../../platform/commands/common/commands.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { IFileDialogService } from '../../../../platform/dialogs/common/dialogs.js';
import { IFileService } from '../../../../platform/files/common/files.js';
import { ServicesAccessor } from '../../../../platform/instantiation/common/instantiation.js';
import { INotificationService } from '../../../../platform/notification/common/notification.js';
import { IOpenerService } from '../../../../platform/opener/common/opener.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
import { IThemeService } from '../../../../platform/theme/common/themeService.js';
import { IWorkspaceContextService } from '../../../../platform/workspace/common/workspace.js';
import { IEditorService } from '../../../services/editor/common/editorService.js';
import { IPathService } from '../../../services/path/common/pathService.js';
import { compareCss } from '../../compose/browser/compareShared.js';
import { juliaString } from '../../databases/common/databaseDrivers.js';
import { sendToJuliaRepl } from '../../model/browser/handlers/model.handler.js';
import { registerScaffoldPageHandlers } from '../../model/browser/handlers/scaffoldPage.handler.js';
import { TRANSCRIPTION_METADATA } from '../../model/browser/webviews/transcription.data.js';
import { buildWebviewHtml, colorizeBracketsJs, lineNumbersJs, ONE_BLUE_BUTTON_JS, spinnerSvg } from '../../model/browser/webviews/webviewScaffold.js';
import { INotebookEditorModelResolverService } from '../../notebook/common/notebookEditorModelResolverService.js';
import { INotebookKernelService } from '../../notebook/common/notebookKernelService.js';
import { defaultCopyFolder } from '../../pollisWorkspace/browser/pollisWorkspace.contribution.js';
import { asWebviewUri } from '../../webview/common/webview.js';
import { WebviewInput } from '../../webviewPanel/browser/webviewEditorInput.js';
import { IWebviewWorkbenchService } from '../../webviewPanel/browser/webviewWorkbenchService.js';

// Transcription, from Explore > Transcription (explore.contribution.ts). A page of the scaffold in the Time Arrow style,
// in four steps: 1, Page, an ALTO or PAGE file with the baselines and polygons of its text lines and the image it names;
// 2, Model, CATMuS Medieval 1.6.2, which MedievalATR.jl downloads once, or a Kraken model file of the user's own;
// 3, Transcribe, the Julia code that reads every line with MedievalATR.jl, sent to the Julia REPL, which writes the text
// read to a results file next to the page file; 4, Text, the page image with the outline of each line drawn on it, and
// the text read on each line beside it, read from the results file as soon as the REPL writes it.

/** The command that opens the page, from Explore > Transcription. */
export const TRANSCRIPTION_PAGE_COMMAND_ID = 'pollis.transcription';

/**
 * Where MedievalATR.jl keeps CATMuS Medieval once downloaded, in its scratch space of the default Julia depot (the uuid
 * is MedievalATR's), from the user's home folder.
 */
const CATMUS_MODEL_PATH = ['.julia', 'scratchspaces', '4bd75f57-a54a-4714-ba94-bb195753c61d', 'models', 'catmus-medieval-1.6.0.mlmodel'];

/** The ending of the results file, which replaces the page file's `.xml`. */
const RESULTS_ENDING = '.transcription.json';

type ModelKind = 'catmus' | 'file';

type TranscriptionMessage =
	| { readonly command: 'ready' }
	| { readonly command: 'choosePage' }
	| { readonly command: 'chooseModel' }
	| { readonly command: 'model'; readonly kind: ModelKind }
	| { readonly command: 'transcribe' }
	| { readonly command: 'copyText' }
	| { readonly command: 'openResults' };

/** The page file chosen in step 1, as its own text describes it. */
interface IPageFile {
	readonly file: URI;
	readonly format: 'ALTO' | 'PAGE';
	/** The image file name the page file gives. */
	readonly imageName: string;
	/** The image found: at that path, relative to the page file's folder, or of that name next to the page file. */
	readonly image: URI | undefined;
	readonly lines: number;
}

/** A line of the results file that MedievalATR's `write_predictions` writes. */
interface IResultLine {
	readonly id: string;
	readonly boundary: readonly (readonly [number, number])[] | null;
	readonly text: string;
	readonly transcription: string;
}

/** The page, when it is open. */
let openPage: WebviewInput | undefined;

/** The results file of a page file: its name with `.transcription.json` in place of `.xml`, in the same folder. */
function resultsFile(pageFile: URI): URI {
	return joinPath(dirname(pageFile), basename(pageFile).replace(/\.xml$/i, '') + RESULTS_ENDING);
}

/** The Julia code of step 3: read every line of the page file with the model, and write the results file. */
function transcribeCode(pageFile: URI, model: URI | undefined): string {
	return [
		'using MedievalATR',
		`model = load_model(${model ? juliaString(model.fsPath) : ':catmus_medieval'})`,
		`page = read_page(${juliaString(pageFile.fsPath)})`,
		'predictions = recognize(model, page)',
		`write_predictions(${juliaString(resultsFile(pageFile).fsPath)}, page, predictions)`,
	].join('\n');
}

/** The lines of a results file, the ones that are not as `write_predictions` writes them left out. */
function resultLines(json: unknown): IResultLine[] {
	const raw = typeof json === 'object' && json !== null && 'lines' in json && Array.isArray(json.lines) ? json.lines as unknown[] : [];
	const lines: IResultLine[] = [];
	for (const entry of raw) {
		if (typeof entry !== 'object' || entry === null) {
			continue;
		}
		const line = entry as Record<string, unknown>;
		if (typeof line.id !== 'string' || typeof line.text !== 'string') {
			continue;
		}
		const boundary = Array.isArray(line.boundary)
			? line.boundary.filter((p: unknown): p is [number, number] => Array.isArray(p) && p.length === 2 && typeof p[0] === 'number' && typeof p[1] === 'number')
			: null;
		lines.push({ id: line.id, boundary, text: line.text, transcription: typeof line.transcription === 'string' ? line.transcription : '' });
	}
	return lines;
}

async function openTranscriptionPage(accessor: ServicesAccessor): Promise<void> {
	const webviewWorkbenchService = accessor.get(IWebviewWorkbenchService);
	const commandService = accessor.get(ICommandService);
	const openerService = accessor.get(IOpenerService);
	const editorService = accessor.get(IEditorService);
	const notificationService = accessor.get(INotificationService);
	const notebookEditorModelResolverService = accessor.get(INotebookEditorModelResolverService);
	const notebookKernelService = accessor.get(INotebookKernelService);
	const fileService = accessor.get(IFileService);
	const pathService = accessor.get(IPathService);
	const storageService = accessor.get(IStorageService);
	const fileDialogService = accessor.get(IFileDialogService);
	const contextService = accessor.get(IWorkspaceContextService);
	const configurationService = accessor.get(IConfigurationService);
	const clipboardService = accessor.get(IClipboardService);
	const languageService = accessor.get(ILanguageService);
	const themeService = accessor.get(IThemeService);

	if (openPage && !openPage.isDisposed()) {
		webviewWorkbenchService.revealWebview(openPage, openPage.group ?? -1, false);
		return;
	}
	const title = localize('transcription.title', "Transcription");
	const webviewInput = webviewWorkbenchService.openWebview(
		{
			title,
			options: { retainContextWhenHidden: true },
			contentOptions: { allowScripts: true, localResourceRoots: [] },
			extension: undefined,
		},
		'pollis.transcription',
		title,
		undefined,
		{ group: undefined, preserveFocus: false }
	);
	openPage = webviewInput;
	webviewInput.webview.setHtml(pageHtml());
	const post = (message: object) => webviewInput.webview.postMessage(message);
	const disposables = new DisposableStore();
	disposables.add(registerScaffoldPageHandlers(webviewInput, 'transcription', title, TRANSCRIPTION_METADATA.transcription, openerService, editorService, commandService, notificationService, notebookEditorModelResolverService, notebookKernelService, fileService, pathService, storageService));

	let page: IPageFile | undefined;
	let pageError: string | undefined;
	let modelKind: ModelKind = 'catmus';
	let modelFile: URI | undefined;
	let modelDownloaded = false;
	/** Whether the code was sent to the REPL and its results file has not been read since. */
	let sent = false;
	let results: IResultLine[] = [];
	let resultsError: string | undefined;

	/** The model of step 2, or none for a file of the user's own not chosen yet. */
	const chosenModel = (): { readonly ready: boolean; readonly file: URI | undefined } =>
		modelKind === 'file' ? { ready: !!modelFile, file: modelFile } : { ready: true, file: undefined };

	/** The code box of step 3, coloured as Example Code colours Julia; a newer code drops an older one's colours. */
	let codeVersion = 0;
	let code = '';
	const postCode = async (): Promise<void> => {
		const version = ++codeVersion;
		const html = code ? await tokenizeToString(languageService, code, 'julia') : '';
		if (version !== codeVersion) {
			return;
		}
		const colorMap = TokenizationRegistry.getColorMap();
		post({ command: 'colorizedCode', html, css: colorMap ? generateTokensCSSForColorMap(colorMap) : '' });
	};
	disposables.add(themeService.onDidColorThemeChange(() => postCode()));

	const postState = () => {
		const model = chosenModel();
		const nextCode = page && model.ready ? transcribeCode(page.file, model.file) : '';
		if (nextCode !== code) {
			code = nextCode;
			postCode();
		}
		post({
			command: 'state',
			page: page && { name: basename(page.file), path: page.file.fsPath, format: page.format, imageName: page.imageName, imageFound: !!page.image, lines: page.lines, results: basename(resultsFile(page.file)) },
			pageError,
			modelKind,
			modelFile: modelFile && { name: basename(modelFile), path: modelFile.fsPath },
			modelDownloaded,
			sent,
			image: page?.image && asWebviewUri(page.image).toString(true),
			results,
			resultsError,
		});
	};

	/** Reads the results file of the page, if the REPL has written it. */
	const readResults = async () => {
		if (!page) {
			return;
		}
		try {
			const content = await fileService.readFile(resultsFile(page.file));
			results = resultLines(JSON.parse(content.value.toString()));
			resultsError = results.length ? undefined : localize('transcription.resultsEmpty', "The results file holds no lines.");
			sent = false;
		} catch {
			results = [];
			resultsError = undefined;
		}
		postState();
	};
	const refresh = disposables.add(new RunOnceScheduler(() => readResults(), 300));
	/** The watcher of the page file's folder, where the REPL writes the results file. */
	const watcher = disposables.add(new MutableDisposable<DisposableStore>());

	/** Reads a page file: its format, the image it names, and how many text lines it has. */
	const readPageFile = async (file: URI): Promise<IPageFile> => {
		const text = (await fileService.readFile(file)).value.toString();
		const alto = /<(?:\w+:)?alto\b/.test(text);
		if (!alto && !/<(?:\w+:)?PcGts\b/.test(text)) {
			throw new Error(localize('transcription.notLayout', "{0} is neither an ALTO nor a PAGE file.", basename(file)));
		}
		const imageName = (alto ? /<(?:\w+:)?fileName>\s*([^<]*?)\s*<\//.exec(text)?.[1] : /<(?:\w+:)?Page\b[^>]*\bimageFilename="([^"]*)"/.exec(text)?.[1]) ?? '';
		const folder = dirname(file);
		let image: URI | undefined;
		for (const candidate of imageName ? [joinPath(folder, imageName), joinPath(folder, imageName.split(/[\\/]/).pop() ?? imageName)] : []) {
			if (await fileService.exists(candidate)) {
				image = candidate;
				break;
			}
		}
		const lines = (text.match(/<(?:\w+:)?TextLine\b/g) ?? []).length;
		return { file, format: alto ? 'ALTO' : 'PAGE', imageName, image, lines };
	};

	const choosePage = async (file: URI) => {
		try {
			page = await readPageFile(file);
			pageError = undefined;
		} catch (error) {
			page = undefined;
			pageError = error instanceof Error ? error.message : String(error);
		}
		results = [];
		resultsError = undefined;
		sent = false;
		// The page shows the image of the page file's folder, and nothing else of the disk
		webviewInput.webview.contentOptions = { allowScripts: true, localResourceRoots: page?.image ? [dirname(page.image)] : [] };
		if (page) {
			const store = new DisposableStore();
			const folderWatcher = store.add(fileService.createWatcher(dirname(page.file), { recursive: false, excludes: [] }));
			const written = resultsFile(page.file);
			store.add(folderWatcher.onDidChange(e => {
				if (e.affects(written)) {
					refresh.schedule();
				}
			}));
			watcher.value = store;
		} else {
			watcher.clear();
		}
		await readResults();
	};

	const checkDownloaded = async () => {
		modelDownloaded = await fileService.exists(joinPath(await pathService.userHome(), ...CATMUS_MODEL_PATH));
	};

	disposables.add(webviewInput.webview.onDidDispose(() => {
		openPage = undefined;
		disposables.dispose();
	}));
	disposables.add(webviewInput.webview.onMessage(async (e: { message: TranscriptionMessage }) => {
		const message = e.message;
		if (message.command === 'ready') {
			await checkDownloaded();
			postState();
		} else if (message.command === 'choosePage') {
			const files = await fileDialogService.showOpenDialog({
				title: localize('transcription.choosePageTitle', "Choose the ALTO or PAGE File of a Page"),
				defaultUri: page ? dirname(page.file) : await defaultCopyFolder(contextService, fileService, configurationService) ?? await fileDialogService.defaultFilePath(),
				canSelectFiles: true,
				canSelectFolders: false,
				canSelectMany: false,
				filters: [{ name: localize('transcription.layoutFiles', "ALTO or PAGE XML"), extensions: ['xml'] }],
			});
			if (files?.length) {
				await choosePage(files[0]);
			}
		} else if (message.command === 'model' && hasKey(message, { kind: true })) {
			modelKind = message.kind === 'file' ? 'file' : 'catmus';
			postState();
		} else if (message.command === 'chooseModel') {
			const files = await fileDialogService.showOpenDialog({
				title: localize('transcription.chooseModelTitle', "Choose a Kraken Recognition Model"),
				defaultUri: modelFile ? dirname(modelFile) : page ? dirname(page.file) : await fileDialogService.defaultFilePath(),
				canSelectFiles: true,
				canSelectFolders: false,
				canSelectMany: false,
				filters: [{ name: localize('transcription.modelFiles', "Kraken Model"), extensions: ['mlmodel'] }],
			});
			if (files?.length) {
				modelFile = files[0];
				modelKind = 'file';
				postState();
			}
		} else if (message.command === 'transcribe') {
			const model = chosenModel();
			if (!page || !model.ready) {
				return;
			}
			sent = true;
			postState();
			await sendToJuliaRepl(transcribeCode(page.file, model.file), commandService);
		} else if (message.command === 'copyText') {
			await clipboardService.writeText(results.map(line => line.text).join('\n'));
			post({ command: 'copied' });
		} else if (message.command === 'openResults' && page) {
			await editorService.openEditor({ resource: resultsFile(page.file) });
		}
	}));
}

function pageHtml(): string {
	const text = {
		title: localize('transcription.title', "Transcription"),
		intro: localize('transcription.intro', "Transcription reads the text of a manuscript page by automatic text recognition: a model reads each line of the page, cut out along its baseline and outline, as Kraken reads it, in the Julia REPL with {0}. The page comes with its layout, an ALTO or PAGE file that gives the lines.", '<span class="yellow">MedievalATR.jl</span>'),
		page: localize('transcription.page', "Page"),
		pageIntro: localize('transcription.pageIntro', "Choose the ALTO or PAGE file of the page: it names the page image, and gives the baseline and outline of each text line, as eScriptorium, Transkribus and Kraken's segmenter write them."),
		choosePage: localize('transcription.choosePage', "Choose a Page File..."),
		noPage: localize('transcription.noPage', "No page chosen."),
		pageFile: localize('transcription.pageFile', "Page File"),
		image: localize('transcription.image', "Image"),
		lines: localize('transcription.lines', "Text Lines"),
		imageMissing: localize('transcription.imageMissing', "{0}, not found next to the page file", '{0}'),
		noLines: localize('transcription.noLines', "The page file has no text lines: their baselines and outlines come from a segmenter, or from a transcription platform."),
		headLines: localize('transcription.headLines', "{0} lines", '{0}'),
		model: localize('transcription.model', "Model"),
		modelIntro: localize('transcription.modelIntro', "CATMuS Medieval reads Old and Middle French, Latin, Spanish and Italian manuscripts, graphematically: abbreviations are kept as written, each mark a character of its own. A Kraken recognition model of your own reads the lines in the same way."),
		catmus: localize('transcription.catmus', "CATMuS Medieval 1.6.2"),
		ownModel: localize('transcription.ownModel', "A Model File of Your Own"),
		chooseModel: localize('transcription.chooseModel', "Choose..."),
		downloaded: localize('transcription.downloaded', "Downloaded."),
		notDownloaded: localize('transcription.notDownloaded', "Downloaded from Zenodo (16 MB) the first time it is used, then kept."),
		needModel: localize('transcription.needModel', "Choose the model file, a Kraken .mlmodel."),
		transcribe: localize('transcription.transcribe', "Transcribe"),
		transcribeIntro: localize('transcription.transcribeIntro', "The Julia REPL reads every line of the page with the model and writes the text read to {0}, next to the page file, which step 4 shows as soon as it is written. The lines are read on the REPL's threads.", '{0}'),
		code: localize('transcription.code', "Julia Code"),
		transcribeButton: localize('transcription.transcribeButton', "Transcribe"),
		needPage: localize('transcription.needPage', "Choose the page file in step 1 first."),
		needImage: localize('transcription.needImage', "The image the page file names is not next to it."),
		sending: localize('transcription.sending', "Reading the lines in the Julia REPL: its progress and any error show there."),
		textStep: localize('transcription.textStep', "Text"),
		textIntro: localize('transcription.textIntro', "Each line's text beside the page image: point to a line to see its outline on the image, or to an outline to find its line. A transcription in the page file is shown under the text read, for comparison."),
		noResults: localize('transcription.noResults', "The text shows here once the page is transcribed in step 3."),
		inFile: localize('transcription.inFile', "In the page file:"),
		empty: localize('transcription.empty', "(not read)"),
		copyText: localize('transcription.copyText', "Copy Text"),
		openResults: localize('transcription.openResults', "Open the Results File"),
		copied: localize('transcription.copied', "The text read, one line of the page to a line, is on the clipboard."),
		headRead: localize('transcription.headRead', "{0} lines read", '{0}'),
	};
	return buildWebviewHtml({
		title: text.title,
		introHtml: text.intro,
		extraCss: `
		${compareCss}
		.missing { color: var(--vscode-errorForeground); }
		.choices label { margin-right: 16px; }
		.tr-facts { display: grid; grid-template-columns: max-content 1fr; gap: 2px 14px; margin: 6px 0; }
		.tr-facts .small { color: var(--vscode-descriptionForeground); }
		.tr-path { color: #e8a33d; word-break: break-all; }
		body.vscode-light .tr-path { color: #a8650d; }
		.tr-code { margin: 6px 0 0; padding: 10px 12px; background: var(--vscode-textCodeBlock-background); border-radius: 3px; font-family: var(--vscode-editor-font-family); font-size: var(--vscode-editor-font-size); white-space: pre; overflow-x: auto; tab-size: 4; max-width: 900px; }
		.tr-view { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 16px; margin-top: 8px; }
		.tr-image { max-height: 75vh; overflow: auto; border: 1px solid var(--vscode-panel-border); border-radius: 3px; }
		.tr-frame { position: relative; }
		.tr-frame img { display: block; width: 100%; height: auto; }
		.tr-frame svg { position: absolute; inset: 0; width: 100%; height: 100%; }
		.tr-frame polygon { fill: transparent; stroke: var(--vscode-focusBorder); stroke-width: 1.5; stroke-opacity: 0.5; vector-effect: non-scaling-stroke; cursor: pointer; }
		.tr-frame polygon.on { fill: var(--vscode-focusBorder); fill-opacity: 0.2; stroke-opacity: 1; stroke-width: 2.5; }
		.tr-lines { max-height: 75vh; overflow: auto; margin: 0; padding-left: 3.2em; }
		.tr-lines li { padding: 3px 6px; border-radius: 3px; cursor: default; }
		.tr-lines li.on { background: var(--vscode-list-hoverBackground); }
		.tr-lines .tr-text { font-size: 1.1em; }
		.tr-lines .tr-file { color: var(--vscode-descriptionForeground); font-size: 0.92em; }
		.tr-lines .tr-empty { color: var(--vscode-descriptionForeground); font-style: italic; }
		@media (max-width: 800px) { .tr-view { grid-template-columns: 1fr; } }
`,
		steps: [
			{
				id: 'step-page',
				title: text.page,
				headHtml: '<span class="small" id="pageHead"></span>',
				bodyHtml: `
		<p class="hint">${text.pageIntro}</p>
		<div class="row bar"><button class="action current" id="choosePage">${text.choosePage}</button></div>
		<div id="pageFacts"></div>
		<div class="small status" id="pageStatus"></div>
`,
			},
			{
				id: 'step-model',
				title: text.model,
				headHtml: '<span class="small" id="modelHead"></span>',
				bodyHtml: `
		<p class="hint">${text.modelIntro}</p>
		<div class="row choices">
			<label><input type="radio" name="model" value="catmus" id="modelCatmus" checked> ${text.catmus}</label>
			<label><input type="radio" name="model" value="file" id="modelFile"> ${text.ownModel}</label>
		</div>
		<div class="row" id="modelFileRow" hidden>
			<span class="tr-path" id="modelPath"></span>
			<span class="bar"><button class="action current" id="chooseModel">${text.chooseModel}</button></span>
		</div>
		<div class="small status" id="modelStatus"></div>
`,
			},
			{
				id: 'step-transcribe',
				title: text.transcribe,
				bodyHtml: `
		<p class="hint" id="transcribeIntro"></p>
		<h3 class="part">${text.code}</h3>
		<pre class="tr-code" id="code"></pre>
		<div class="settings"><span class="bar">
			<button class="action current" id="transcribe">${text.transcribeButton}</button>
		</span></div>
		<div class="small status" id="transcribeStatus"></div>
`,
			},
			{
				id: 'step-text',
				title: text.textStep,
				headHtml: '<span class="small" id="textHead"></span>',
				bodyHtml: `
		<p class="hint">${text.textIntro}</p>
		<div class="small status" id="textStatus"></div>
		<div class="tr-view" id="view" hidden>
			<div class="tr-image"><div class="tr-frame"><img id="pageImage" alt=""><svg id="overlay" preserveAspectRatio="none"></svg></div></div>
			<ol class="tr-lines" id="lines"></ol>
		</div>
		<div class="settings" id="textActions" hidden><span class="bar">
			<button class="action current" id="copyText">${text.copyText}</button>
			<button class="action" id="openResults">${text.openResults}</button>
		</span></div>
`,
			},
		],
		pageScriptJs: `
	${colorizeBracketsJs}
	${lineNumbersJs}
	${ONE_BLUE_BUTTON_JS}
	const TEXT = ${JSON.stringify(text)};
	const SPINNER = ${JSON.stringify(spinnerSvg)};
	const SVG = 'http://www.w3.org/2000/svg';
	let state;
	let shownResults;

	function fact(label, value, className) {
		const name = document.createElement('span');
		name.className = 'small';
		name.textContent = label;
		const content = document.createElement('span');
		if (className) { content.className = className; }
		content.textContent = value;
		return [name, content];
	}
	function setStatus(element, message, spinner, missing) {
		element.classList.toggle('missing', !!missing);
		element.innerHTML = spinner ? SPINNER + ' ' : '';
		element.appendChild(document.createTextNode(message || ''));
	}

	document.getElementById('choosePage').addEventListener('click', () => vscode.postMessage({ command: 'choosePage' }));
	document.querySelectorAll('input[name=model]').forEach(radio => radio.addEventListener('change', () => vscode.postMessage({ command: 'model', kind: document.querySelector('input[name=model]:checked').value })));
	document.getElementById('chooseModel').addEventListener('click', () => vscode.postMessage({ command: 'chooseModel' }));
	document.getElementById('transcribe').addEventListener('click', () => vscode.postMessage({ command: 'transcribe' }));
	document.getElementById('copyText').addEventListener('click', () => vscode.postMessage({ command: 'copyText' }));
	document.getElementById('openResults').addEventListener('click', () => vscode.postMessage({ command: 'openResults' }));

	function renderPage(message) {
		const facts = document.getElementById('pageFacts');
		facts.textContent = '';
		const page = message.page;
		document.getElementById('pageHead').textContent = page ? TEXT.headLines.replace('{0}', String(page.lines)) : '';
		if (!page) {
			setStatus(document.getElementById('pageStatus'), message.pageError || TEXT.noPage, false, !!message.pageError);
			return;
		}
		const grid = document.createElement('div');
		grid.className = 'tr-facts';
		grid.append(...fact(TEXT.pageFile + ' (' + page.format + ')', page.path, 'tr-path'));
		grid.append(...fact(TEXT.image, page.imageFound ? page.imageName : TEXT.imageMissing.replace('{0}', page.imageName), page.imageFound ? 'tr-path' : 'missing'));
		grid.append(...fact(TEXT.lines, String(page.lines)));
		facts.appendChild(grid);
		setStatus(document.getElementById('pageStatus'), page.lines ? '' : TEXT.noLines, false, !page.lines);
	}
	function renderModel(message) {
		const own = message.modelKind === 'file';
		document.getElementById('modelCatmus').checked = !own;
		document.getElementById('modelFile').checked = own;
		document.getElementById('modelFileRow').hidden = !own;
		document.getElementById('modelPath').textContent = message.modelFile ? message.modelFile.path : '';
		document.getElementById('modelHead').textContent = own ? (message.modelFile ? message.modelFile.name : '') : TEXT.catmus;
		const status = own ? (message.modelFile ? '' : TEXT.needModel) : (message.modelDownloaded ? TEXT.downloaded : TEXT.notDownloaded);
		setStatus(document.getElementById('modelStatus'), status, false, own && !message.modelFile);
	}
	function transcribeProblem(message) {
		if (!message.page) { return TEXT.needPage; }
		if (!message.page.imageFound) { return TEXT.needImage; }
		if (message.modelKind === 'file' && !message.modelFile) { return TEXT.needModel; }
		return '';
	}
	function renderTranscribe(message) {
		const intro = document.getElementById('transcribeIntro');
		intro.textContent = '';
		const parts = TEXT.transcribeIntro.split('{0}');
		const results = document.createElement('span');
		results.className = 'tr-path';
		results.textContent = message.page ? message.page.results : '*' + ${JSON.stringify(RESULTS_ENDING)};
		intro.append(parts[0], results, parts[1] || '');
		const why = transcribeProblem(message);
		document.getElementById('transcribe').disabled = !!why || !message.page.lines;
		if (why) {
			document.getElementById('code').textContent = '';
		}
		setStatus(document.getElementById('transcribeStatus'), why || (message.sent ? TEXT.sending : ''), !why && message.sent, false);
	}

	function highlight(index, on, scroll) {
		const item = document.querySelector('#lines li[data-index="' + index + '"]');
		const polygon = document.querySelector('#overlay polygon[data-index="' + index + '"]');
		if (item) { item.classList.toggle('on', on); if (on && scroll) { item.scrollIntoView({ block: 'nearest' }); } }
		if (polygon) { polygon.classList.toggle('on', on); }
	}
	function drawOutlines() {
		const image = document.getElementById('pageImage');
		const overlay = document.getElementById('overlay');
		overlay.textContent = '';
		if (!image.naturalWidth || !shownResults) { return; }
		overlay.setAttribute('viewBox', '0 0 ' + image.naturalWidth + ' ' + image.naturalHeight);
		shownResults.forEach((line, index) => {
			if (!line.boundary || !line.boundary.length) { return; }
			const polygon = document.createElementNS(SVG, 'polygon');
			polygon.setAttribute('points', line.boundary.map(p => p[0] + ',' + p[1]).join(' '));
			polygon.dataset.index = String(index);
			polygon.addEventListener('mouseenter', () => highlight(index, true, true));
			polygon.addEventListener('mouseleave', () => highlight(index, false, false));
			overlay.appendChild(polygon);
		});
	}
	document.getElementById('pageImage').addEventListener('load', drawOutlines);
	function renderText(message) {
		const lines = message.results || [];
		const has = lines.length > 0;
		document.getElementById('view').hidden = !has;
		document.getElementById('textActions').hidden = !has;
		document.getElementById('textHead').textContent = has ? TEXT.headRead.replace('{0}', String(lines.length)) : '';
		setStatus(document.getElementById('textStatus'), message.resultsError || (has ? '' : TEXT.noResults), false, !!message.resultsError);
		if (JSON.stringify(lines) === JSON.stringify(shownResults)) { return; }
		shownResults = lines;
		const list = document.getElementById('lines');
		list.textContent = '';
		lines.forEach((line, index) => {
			const item = document.createElement('li');
			item.dataset.index = String(index);
			const read = document.createElement('div');
			read.className = line.text ? 'tr-text' : 'tr-text tr-empty';
			read.textContent = line.text || TEXT.empty;
			item.appendChild(read);
			if (line.transcription.trim()) {
				const file = document.createElement('div');
				file.className = 'tr-file';
				file.textContent = TEXT.inFile + ' ' + line.transcription.trim();
				item.appendChild(file);
			}
			item.addEventListener('mouseenter', () => highlight(index, true, false));
			item.addEventListener('mouseleave', () => highlight(index, false, false));
			list.appendChild(item);
		});
		const image = document.getElementById('pageImage');
		if (message.image && image.getAttribute('src') !== message.image) {
			image.setAttribute('src', message.image);
		} else {
			drawOutlines();
		}
	}

	window.addEventListener('message', event => {
		const message = event.data;
		if (message.command === 'state') {
			state = message;
			renderPage(message);
			renderModel(message);
			renderTranscribe(message);
			renderText(message);
		} else if (message.command === 'colorizedCode') {
			document.getElementById('mtk-theme').textContent = message.css;
			const box = document.getElementById('code');
			box.innerHTML = message.html;
			colorizeBrackets(box, '#');
			numberCodeLines(box);
		} else if (message.command === 'copied') {
			setStatus(document.getElementById('textStatus'), TEXT.copied, false, false);
		}
	});
	vscode.postMessage({ command: 'ready' });
`,
	});
}

registerAction2(class extends Action2 {
	constructor() {
		super({
			id: TRANSCRIPTION_PAGE_COMMAND_ID,
			title: localize2('transcription.action', "Transcribe a Page"),
			category: localize2('transcription.category', "Explore"),
			f1: true,
		});
	}
	run(accessor: ServicesAccessor): Promise<void> {
		return openTranscriptionPage(accessor);
	}
});
