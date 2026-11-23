/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { DisposableStore } from '../../../../../base/common/lifecycle.js';
import { IFileService } from '../../../../../platform/files/common/files.js';
import { IPathService } from '../../../../services/path/common/pathService.js';
import { IWorkspaceContextService } from '../../../../../platform/workspace/common/workspace.js';
import { IConfigurationService } from '../../../../../platform/configuration/common/configuration.js';
import { IOpenerService } from '../../../../../platform/opener/common/opener.js';
import { IEditorService } from '../../../../services/editor/common/editorService.js';
import { INotificationService } from '../../../../../platform/notification/common/notification.js';
import { ICommandService } from '../../../../../platform/commands/common/commands.js';
import { IWebviewWorkbenchService } from '../../../webviewPanel/browser/webviewWorkbenchService.js';
import { IScaffoldPanelData } from '../common/model.types.js';
import { panelCitedKeys } from '../common/tomlPanelData.js';
import { IQuickInputService } from '../../../../../platform/quickinput/common/quickInput.js';
import { ISecretStorageService } from '../../../../../platform/secrets/common/secrets.js';
import { IWebviewService } from '../../../webview/browser/webview.js';
import { INotebookEditorModelResolverService } from '../../../notebook/common/notebookEditorModelResolverService.js';
import { INotebookKernelService } from '../../../notebook/common/notebookKernelService.js';
import { ILanguageService } from '../../../../../editor/common/languages/language.js';
import { IThemeService } from '../../../../../platform/theme/common/themeService.js';
import { tokenizeToString } from '../../../../../editor/common/languages/textToHtmlTokenizer.js';
import { TokenizationRegistry } from '../../../../../editor/common/languages.js';
import { generateTokensCSSForColorMap } from '../../../../../editor/common/languages/supports/tokenization.js';
import { Event } from '../../../../../base/common/event.js';
import { IUntitledTextResourceEditorInput } from '../../../../common/editor.js';
import { CellEditType, CellKind } from '../../../notebook/common/notebookCommon.js';
import { openWikiByFile, openNotebookByFile, openInBrowser, autoSelectJuliaKernel, createPackageStatusWiring, createExampleCodeWiring, createCustomCopyWiring, createSqlStepsWiring, createReferenceWiring, createVideoWiring, createApiKeyWiring, IApiKeyProvider, sendToJuliaRepl, withExampleFirst, withStepsFirst, IStepsRunMessage } from './model.handler.js';
import { createCodeHoverWiring } from './codeHover.js';
import { hasKey } from '../../../../../base/common/types.js';
import { ADD_ALERT_COMMAND_ID } from '../../../monitor/browser/alertsPage.js';
import { FORECASTING_CATALOGUE_COMMAND_ID } from '../../../compose/browser/forecastingActive.js';
import { localize } from '../../../../../nls.js';
import { IStorageService, StorageScope, StorageTarget } from '../../../../../platform/storage/common/storage.js';
import { handlePanelAskMessage, PanelAskMessage } from '../../../compose/browser/askPollisAttach.js';
import { getVoiceLanguage, getVoiceWriteIn, setVoiceLanguage, setVoiceWriteIn } from '../../../compose/browser/composerVoice.js';
import { IFileDialogService } from '../../../../../platform/dialogs/common/dialogs.js';
import { joinPath } from '../../../../../base/common/resources.js';
import { URI } from '../../../../../base/common/uri.js';
import { findPollisWorkspace, PollisWorkspaceFolder, pollisWorkspaceFolderPath } from '../../../pollisWorkspace/browser/pollisWorkspace.contribution.js';

/** The folder a path written in a folder input names: `~` is the home folder, as Julia's expanduser reads it. */
export function folderUri(path: string, home: URI): URI {
	const value = path.trim();
	return !value || value === '~' ? home : value.startsWith('~/') ? joinPath(home, value.slice(2)) : URI.file(value);
}

/** Whether the panels wrap the long lines of their code, the same for every panel. */
const CODE_WRAP_KEY = 'pollis.panels.codeWrap';

/** Messages a scaffold panel sends that are not handled by the shared wirings of model.handler.ts. */
type ScaffoldWebviewMessage =
	| { command: 'openNotebook'; target: string }
	| { command: 'openWiki'; target: string }
	| { command: 'openUrl'; url: string }
	| { command: 'openDataset'; id: string }
	| { command: 'runCode'; target: 'newFile' | 'juliaRepl' | 'notebook' | 'pluto' | 'duckdbRepl'; code: string; setup?: string; language?: 'sql'; before?: IStepsRunMessage['before']; stepCode?: boolean; name?: string; box?: string }
	| { command: 'colorize'; code: string; target?: string; language?: 'sql' }
	| { command: 'installPackages' }
	| { command: 'addAlert'; symbol: string; kind: 'quote' | 'filings' | 'fred' | 'ecb' | 'imf' | 'worldBank' }
	| { command: 'chooseModelFile'; input: string; kind: 'chat' | 'embedding'; value: string }
	| { command: 'chooseFolder'; input: string; value: string }
	| { command: 'setApiKey'; field?: number }
	| { command: 'clearApiKey'; field?: number }
	| PanelAskMessage
	| { command: 'voiceLanguage'; value: string }
	| { command: 'voiceWriteIn'; value: string }
	| { command: 'codeWrap'; value: boolean };

/**
 * Handle the messages of a panel built on the shared scaffold (see scaffoldParts.ts): Learn More,
 * running code, theme colourising, package status, editable examples, wikis, notebooks, references
 * and videos, and Ask Pollis beside the title. `panelId` names the panel's folder under ~/.pollis (saved examples,
 * references, videos); a question asked there is answered from the wikis titled `panelTitle` first. `apiKey`, when given, adds the Powered-by credentials indicator and sets them in the Julia REPL.
 */
/** Sends what Powered by and Learn More show: the links of the packages, and the references, notebooks, wikis and FAQ there are. */
export function postLearnMoreData(webview: { postMessage(message: unknown): void }, data: IScaffoldPanelData): void {
	const packages = data.packages.map(pkg => ({ name: pkg.name, url: pkg.github }));
	const hasReferences = data.references.some(r => !hasKey(r, { separator: true }));
	const notebookSections = data.notebookSections.map(s => ({
		label: s.label,
		notebooks: s.notebooks.map(n => ({ name: n.name, file: n.bundled ? n.file : '', description: n.description })),
	}));
	const wikiSections: Array<{ label: string; wikis: Array<{ name: string; file: string; description?: string }> }> = [];
	let currentWikiSection: { label: string; wikis: Array<{ name: string; file: string; description?: string }> } = { label: '', wikis: [] };
	for (const w of data.wikis) {
		if (hasKey(w, { separator: true })) {
			wikiSections.push(currentWikiSection);
			currentWikiSection = { label: w.label ?? '', wikis: [] };
		} else {
			currentWikiSection.wikis.push({ name: w.name, file: w.bundled ? w.file : '', description: w.description });
		}
	}
	if (currentWikiSection.wikis.length > 0) { wikiSections.push(currentWikiSection); }
	webview.postMessage({ command: 'packageLinks', packages });
	webview.postMessage({ command: 'paperLinks', papers: [], hasPapers: hasReferences });
	webview.postMessage({ command: 'notebookSections', sections: notebookSections });
	webview.postMessage({ command: 'wikiSections', sections: wikiSections });
	webview.postMessage({ command: 'faq', faq: (data.faq ?? []).map(entry => ({ question: entry.question, answer: entry.answer, wiki: entry.wiki })) });
}

export function registerScaffoldWebviewHandlers(
	webviewInput: ReturnType<IWebviewWorkbenchService['openWebview']>,
	panelId: string,
	panelTitle: string,
	data: IScaffoldPanelData,
	initialModel: string | undefined,
	openerService: IOpenerService,
	editorService: IEditorService,
	commandService: ICommandService,
	notificationService: INotificationService,
	notebookEditorModelResolverService: INotebookEditorModelResolverService,
	notebookKernelService: INotebookKernelService,
	languageService: ILanguageService,
	themeService: IThemeService,
	fileService: IFileService,
	pathService: IPathService,
	workspaceContextService: IWorkspaceContextService,
	configurationService: IConfigurationService,
	quickInputService: IQuickInputService,
	secretStorageService: ISecretStorageService,
	webviewService: IWebviewService,
	storageService: IStorageService,
	fileDialogService: IFileDialogService,
	apiKeyProvider: IApiKeyProvider | undefined,
): DisposableStore {
	const disposables = new DisposableStore();
	const lastCode: { [target: string]: string } = {};
	const postColorized = async (code: string, target: string): Promise<void> => {
		lastCode[target] = code;
		const html = await tokenizeToString(languageService, code, 'julia');
		const colorMap = TokenizationRegistry.getColorMap();
		const css = colorMap ? generateTokensCSSForColorMap(colorMap) : '';
		webviewInput.webview.postMessage({ command: 'colorizedCode', html, css, target });
	};
	disposables.add(themeService.onDidColorThemeChange(() => {
		for (const t of Object.keys(lastCode)) { void postColorized(lastCode[t], t); }
	}));
	const pkgStatus = createPackageStatusWiring(webviewInput.webview, disposables, data.packages, data.requires ?? [], fileService, pathService, commandService, workspaceContextService);
	createExampleCodeWiring(webviewInput.webview, disposables, panelId, fileService, pathService, notificationService);
	createCustomCopyWiring(webviewInput.webview, disposables, data.wikis, data.notebooks, fileService, pathService, editorService, commandService, notificationService);
	createSqlStepsWiring(webviewInput.webview, disposables, commandService, editorService);
	createReferenceWiring(webviewInput.webview, disposables, panelId, data.references, fileService, pathService, commandService, notificationService);
	createVideoWiring(webviewInput.webview, disposables, panelId, data.packages, fileService, pathService, commandService, notificationService);
	createCodeHoverWiring(webviewInput.webview, disposables, commandService);
	// The folder inputs' defaults in the open Pollis Workspace, as programs/executables; without one, the TOML's default
	const postFolderDefaults = async (): Promise<void> => {
		const folderInputs = [...data.inputs ?? [], ...(data.steps ?? []).flatMap(step => step.inputs)].filter(input => input.folder);
		const workspace = folderInputs.length ? await findPollisWorkspace(workspaceContextService, fileService, configurationService) : undefined;
		if (!workspace) {
			return;
		}
		for (const input of folderInputs) {
			const [kind, ...rest] = input.folder!.split('/');
			const folder = joinPath(await pollisWorkspaceFolderPath(fileService, workspace, kind as PollisWorkspaceFolder), ...rest);
			webviewInput.webview.postMessage({ command: 'setInputDefault', input: input.id, value: folder.fsPath });
		}
	};
	const apiKey = apiKeyProvider ? createApiKeyWiring(webviewInput.webview, apiKeyProvider, secretStorageService, quickInputService, webviewService) : undefined;

	setTimeout(() => {
		postLearnMoreData(webviewInput.webview, data);
		if (initialModel) {
			webviewInput.webview.postMessage({ command: 'setModel', model: initialModel });
		}
		// The languages spoken and written of Ask Pollis beside the title, which the HTML is made without
		webviewInput.webview.postMessage({ command: 'voiceLanguage', value: getVoiceLanguage(storageService) });
		webviewInput.webview.postMessage({ command: 'voiceWriteIn', value: getVoiceWriteIn(storageService) });
		webviewInput.webview.postMessage({ command: 'codeWrap', value: storageService.getBoolean(CODE_WRAP_KEY, StorageScope.PROFILE, false) });
		void pkgStatus.postStatus();
		void apiKey?.postStatus();
		void postFolderDefaults();
	}, 0);

	disposables.add(webviewInput.webview.onDidDispose(() => disposables.dispose()));
	disposables.add(webviewInput.webview.onMessage(async (e: { message: ScaffoldWebviewMessage }) => {
		const msg = e.message;
		switch (msg.command) {
			case 'openDataset':
				// A step's dataset, in Manage Challenge Datasets; the id comes from a page, so only a string is passed on
				if (typeof msg.id === 'string') {
					void commandService.executeCommand(FORECASTING_CATALOGUE_COMMAND_ID, msg.id);
				}
				break;
			case 'openNotebook':
				await openNotebookByFile(msg.target, data.notebooks, openerService, editorService, notebookKernelService, notebookEditorModelResolverService);
				break;
			case 'openWiki':
				await openWikiByFile(msg.target, data.wikis, openerService, editorService, commandService);
				break;
			case 'runCode': {
				// A query of the action group sql: createSqlStepsWiring runs it
				if (msg.language === 'sql') {
					break;
				}
				// A step of a Time Arrow panel goes after the steps before it; a Next Step of a Classical one after its Code Example
				const ordered = msg.before
					? await withStepsFirst({ code: msg.code, target: msg.target, before: msg.before, stepCode: msg.stepCode, name: msg.name ?? '', box: msg.box ?? '' }, panelId, webviewInput.webview, commandService)
					: await withExampleFirst(msg, webviewInput.webview, commandService);
				const code = pkgStatus.withPackageCheck(ordered, msg.target);
				if (msg.target === 'newFile') {
					const input: IUntitledTextResourceEditorInput = {
						resource: undefined,
						contents: code,
						languageId: 'julia',
					};
					await editorService.openEditor(input);
				} else if (msg.target === 'juliaRepl') {
					// Inject the credentials as session env vars so they never land in a saved file.
					const prefix = apiKey ? await apiKey.replPrefix(msg.target) : '';
					if (!await sendToJuliaRepl(prefix + code, commandService)) { break; }
				} else if (msg.target === 'notebook') {
					const ref = await notebookEditorModelResolverService.resolve({ untitledResource: undefined }, 'jupyter-notebook');
					const notebook = ref.object.notebook;
					notebook.applyEdits([{
						editType: CellEditType.Replace,
						index: 0,
						count: notebook.cells.length,
						cells: [{
							cellKind: CellKind.Code,
							source: code,
							language: 'julia',
							mime: undefined,
							outputs: [],
							metadata: {},
						}],
					}], true, undefined, () => undefined, undefined, false);
					Event.once(notebook.onWillDispose)(() => ref.dispose());
					await editorService.openEditor({ resource: notebook.uri, options: { override: 'jupyter-notebook' } });
					autoSelectJuliaKernel(notebook, notebookKernelService);
				} else if (msg.target === 'pluto') {
					await commandService.executeCommand('pollis.action.sendToPluto', code);
				}
				break;
			}
			case 'colorize':
				if (msg.language === 'sql') {
					// A query, which createSqlStepsWiring colours: a change of theme must not colour the box again as Julia
					delete lastCode[msg.target || ''];
				} else if (msg.code) {
					await postColorized(msg.code, msg.target || '');
				}
				break;
			case 'openUrl':
				if (msg.url) { await openInBrowser(msg.url, commandService); }
				break;
			case 'installPackages':
				await pkgStatus.handleInstall();
				break;
			case 'addAlert':
				await commandService.executeCommand(ADD_ALERT_COMMAND_ID, msg.symbol, msg.kind === 'quote' ? undefined : msg.kind);
				break;
			case 'chooseModelFile': {
				// The picker of the Julia extension (pollisModels.ts): a path, an hf: file, or nothing when dismissed
				let value: string | undefined;
				try {
					value = await commandService.executeCommand<string>('language-julia.pollisChooseModel', { kind: msg.kind, value: msg.value });
				} catch {
					notificationService.error(localize('scaffold.chooseModelFailed', "The models cannot be listed: the Julia extension of Pollis is not running."));
				}
				if (value) {
					webviewInput.webview.postMessage({ command: 'setInputValue', input: msg.input, value });
				}
				break;
			}
			case 'chooseFolder': {
				// Opened at the folder of the input when it exists, otherwise at the home folder
				const home = await pathService.userHome({ preferLocal: true });
				const current = folderUri(msg.value, home);
				const picked = await fileDialogService.showOpenDialog({
					title: localize('scaffold.chooseFolder', "Choose the Folder"),
					canSelectFiles: false,
					canSelectFolders: true,
					canSelectMany: false,
					defaultUri: await fileService.exists(current) ? current : home,
				});
				if (picked?.[0]) {
					webviewInput.webview.postMessage({ command: 'setInputValue', input: msg.input, value: picked[0].fsPath });
				}
				break;
			}
			case 'setApiKey':
				await apiKey?.handleSet(typeof msg.field === 'number' ? msg.field : undefined);
				break;
			case 'clearApiKey':
				await apiKey?.handleClear(typeof msg.field === 'number' ? msg.field : undefined);
				break;
			case 'askPollis':
			case 'askPollisModel':
			case 'attachFile':
			case 'pickDataset':
			case 'pickDatabase':
			case 'openPdf':
				// Answered in Ask Pollis beside the panel, from its wikis and its packages' vignettes first
				await handlePanelAskMessage(msg, webviewInput.webview, commandService, { title: panelTitle, packages: data.packages.map(pkg => pkg.name), references: panelCitedKeys(data) });
				break;
			case 'voiceLanguage':
				setVoiceLanguage(storageService, msg.value);
				break;
			case 'voiceWriteIn':
				setVoiceWriteIn(storageService, msg.value);
				break;
			case 'codeWrap':
				storageService.store(CODE_WRAP_KEY, msg.value === true, StorageScope.PROFILE, StorageTarget.USER);
				break;
		}
	}));

	return disposables;
}
