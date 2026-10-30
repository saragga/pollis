/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { DisposableStore } from '../../../../../base/common/lifecycle.js';
import { IFileService } from '../../../../../platform/files/common/files.js';
import { IPathService } from '../../../../services/path/common/pathService.js';
import { IWorkspaceContextService } from '../../../../../platform/workspace/common/workspace.js';
import { IOpenerService } from '../../../../../platform/opener/common/opener.js';
import { IEditorService } from '../../../../services/editor/common/editorService.js';
import { INotificationService } from '../../../../../platform/notification/common/notification.js';
import { ICommandService } from '../../../../../platform/commands/common/commands.js';
import { IWebviewWorkbenchService } from '../../../webviewPanel/browser/webviewWorkbenchService.js';
import { IScaffoldPanelData } from '../common/model.types.js';
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
import { openWikiByFile, openNotebookByFile, openInBrowser, autoSelectJuliaKernel, createPackageStatusWiring, createExampleCodeWiring, createCustomCopyWiring, createReferenceWiring, createVideoWiring, createApiKeyWiring, IApiKeyProvider, sendToJuliaRepl, withExampleFirst } from './model.handler.js';
import { hasKey } from '../../../../../base/common/types.js';
import { ADD_ALERT_COMMAND_ID } from '../../../monitor/browser/alertsPage.js';
import { localize } from '../../../../../nls.js';
import { IStorageService } from '../../../../../platform/storage/common/storage.js';
import { ASK_POLLIS_COMMAND_ID, IAskPollisFromPanel } from '../../../compose/common/askPollis.js';
import { getVoiceLanguage, getVoiceWriteIn, setVoiceLanguage, setVoiceWriteIn } from '../../../compose/browser/composerVoice.js';

/** Messages a scaffold panel sends that are not handled by the shared wirings of model.handler.ts. */
type ScaffoldWebviewMessage =
	| { command: 'openNotebook'; target: string }
	| { command: 'openWiki'; target: string }
	| { command: 'openUrl'; url: string }
	| { command: 'runCode'; target: 'newFile' | 'juliaRepl' | 'notebook' | 'pluto'; code: string; setup?: string }
	| { command: 'colorize'; code: string; target?: string }
	| { command: 'installPackages' }
	| { command: 'addAlert'; symbol: string; kind: 'quote' | 'filings' | 'fred' | 'ecb' | 'imf' | 'worldBank' }
	| { command: 'chooseModelFile'; input: string; kind: 'chat' | 'embedding'; value: string }
	| { command: 'setApiKey' }
	| { command: 'clearApiKey' }
	| { command: 'askPollis'; question: string }
	| { command: 'voiceLanguage'; value: string }
	| { command: 'voiceWriteIn'; value: string };

/**
 * Handle the messages of a panel built on the shared scaffold (see scaffoldParts.ts): Learn More,
 * running code, theme colourising, package status, editable examples, wikis, notebooks, references
 * and videos, and Ask Pollis beside the title. `panelId` names the panel's folder under ~/.pollis (saved examples,
 * references, videos); a question asked there is answered from the wikis titled `panelTitle` first. `apiKey`, when given, adds the Powered-by credentials indicator and sets them in the Julia REPL.
 */
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
	quickInputService: IQuickInputService,
	secretStorageService: ISecretStorageService,
	webviewService: IWebviewService,
	storageService: IStorageService,
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
	createReferenceWiring(webviewInput.webview, disposables, panelId, data.references, fileService, pathService, commandService, notificationService);
	createVideoWiring(webviewInput.webview, disposables, panelId, data.packages, fileService, pathService, commandService, notificationService);
	const apiKey = apiKeyProvider ? createApiKeyWiring(webviewInput.webview, apiKeyProvider, secretStorageService, quickInputService, webviewService) : undefined;

	setTimeout(() => {
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
		webviewInput.webview.postMessage({ command: 'packageLinks', packages });
		webviewInput.webview.postMessage({ command: 'paperLinks', papers: [], hasPapers: hasReferences });
		webviewInput.webview.postMessage({ command: 'notebookSections', sections: notebookSections });
		webviewInput.webview.postMessage({ command: 'wikiSections', sections: wikiSections });
		if (initialModel) {
			webviewInput.webview.postMessage({ command: 'setModel', model: initialModel });
		}
		// The languages spoken and written of Ask Pollis beside the title, which the HTML is made without
		webviewInput.webview.postMessage({ command: 'voiceLanguage', value: getVoiceLanguage(storageService) });
		webviewInput.webview.postMessage({ command: 'voiceWriteIn', value: getVoiceWriteIn(storageService) });
		void pkgStatus.postStatus();
		void apiKey?.postStatus();
	}, 0);

	disposables.add(webviewInput.webview.onDidDispose(() => disposables.dispose()));
	disposables.add(webviewInput.webview.onMessage(async (e: { message: ScaffoldWebviewMessage }) => {
		const msg = e.message;
		switch (msg.command) {
			case 'openNotebook':
				await openNotebookByFile(msg.target, data.notebooks, openerService, editorService, notebookKernelService, notebookEditorModelResolverService);
				break;
			case 'openWiki':
				await openWikiByFile(msg.target, data.wikis, openerService, editorService, commandService);
				break;
			case 'runCode': {
				const code = pkgStatus.withPackageCheck(await withExampleFirst(msg, webviewInput.webview, commandService), msg.target);
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
				if (msg.code) { await postColorized(msg.code, msg.target || ''); }
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
			case 'setApiKey':
				await apiKey?.handleSet();
				break;
			case 'clearApiKey':
				await apiKey?.handleClear();
				break;
			case 'askPollis':
				// Answered in Ask Pollis beside the panel, from its wikis and its packages' vignettes first
				if (msg.question.trim()) {
					await commandService.executeCommand(ASK_POLLIS_COMMAND_ID, {
						question: msg.question.trim(),
						panel: { title: panelTitle, packages: data.packages.map(pkg => pkg.name) },
					} satisfies IAskPollisFromPanel);
				}
				break;
			case 'voiceLanguage':
				setVoiceLanguage(storageService, msg.value);
				break;
			case 'voiceWriteIn':
				setVoiceWriteIn(storageService, msg.value);
				break;
		}
	}));

	return disposables;
}
