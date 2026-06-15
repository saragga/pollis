/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Antonio Saragga Seabra. All rights reserved.
 *  Proprietary and confidential. Unauthorised copying or distribution is prohibited.
 *--------------------------------------------------------------------------------------------*/

import { DisposableStore } from '../../../../../base/common/lifecycle.js';
import { IFileService } from '../../../../../platform/files/common/files.js';
import { IPathService } from '../../../../services/path/common/pathService.js';
import { IWorkspaceContextService } from '../../../../../platform/workspace/common/workspace.js';
import { ISecretStorageService } from '../../../../../platform/secrets/common/secrets.js';
import { IWebviewService } from '../../../webview/browser/webview.js';
import { IOpenerService } from '../../../../../platform/opener/common/opener.js';
import { IEditorService } from '../../../../services/editor/common/editorService.js';
import { IQuickInputService } from '../../../../../platform/quickinput/common/quickInput.js';
import { IClipboardService } from '../../../../../platform/clipboard/common/clipboardService.js';
import { INotificationService } from '../../../../../platform/notification/common/notification.js';
import { ICommandService } from '../../../../../platform/commands/common/commands.js';
import { IWebviewWorkbenchService } from '../../../webviewPanel/browser/webviewWorkbenchService.js';
import { IAlpvMetadata, AlpvWebviewMessage } from '../common/alpv.types.js';
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
import { openWikiByFile, openNotebookByFile, openPackageItem, openVideoList, openInBrowser, autoSelectJuliaKernel, createPackageStatusWiring, createApiKeyWiring } from './model.handler.js';
import { CREDENTIALS } from '../common/credentials.js';

const ALPV_API_KEY = { label: 'Alpha Vantage', fields: [{ ...CREDENTIALS.alphaVantage, prompt: 'Alpha Vantage API key' }] };

export function registerAlpvWebviewHandlers(
	webviewInput: ReturnType<IWebviewWorkbenchService['openWebview']>,
	metadata: IAlpvMetadata,
	openerService: IOpenerService,
	editorService: IEditorService,
	quickInputService: IQuickInputService,
	commandService: ICommandService,
	clipboardService: IClipboardService,
	notificationService: INotificationService,
	notebookEditorModelResolverService: INotebookEditorModelResolverService,
	notebookKernelService: INotebookKernelService,
	languageService: ILanguageService,
	themeService: IThemeService,
	fileService: IFileService,
	pathService: IPathService,
	workspaceContextService: IWorkspaceContextService,
	secretStorageService: ISecretStorageService,
	webviewService: IWebviewService,
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
	const alpvData = metadata.alpv;
	const pkgStatus = createPackageStatusWiring(webviewInput.webview, disposables, alpvData.packages.map(p => p.name), fileService, pathService, commandService, notificationService, workspaceContextService);
	const apiKey = createApiKeyWiring(webviewInput.webview, ALPV_API_KEY, secretStorageService, quickInputService, webviewService);

	setTimeout(() => {
		const packages = alpvData.packages.map(pkg => ({ name: pkg.name, url: pkg.github }));
		const hasReferences = alpvData.references.some(r => !('separator' in r));
		const notebookSections = alpvData.notebookSections.map(s => ({
			label: s.label,
			notebooks: s.notebooks.map(n => ({ name: n.name, file: n.bundled ? n.file : '', description: n.description })),
		}));
		const wikiSections: Array<{ label: string; wikis: Array<{ name: string; file: string; description?: string }> }> = [];
		let currentWikiSection: { label: string; wikis: Array<{ name: string; file: string; description?: string }> } = { label: '', wikis: [] };
		for (const w of alpvData.wikis) {
			if ('separator' in w) {
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
		if (alpvData.conceptMap) {
			webviewInput.webview.postMessage({ command: 'conceptMap', map: alpvData.conceptMap });
		}
		void pkgStatus.postStatus();
		void apiKey.postStatus();
	}, 0);

	disposables.add(webviewInput.webview.onDidDispose(() => disposables.dispose()));
	disposables.add(webviewInput.webview.onMessage(async (e: { message: AlpvWebviewMessage }) => {
		const msg = e.message;
		switch (msg.command) {
			case 'openDocs':
				if (msg.target === 'paper') {
					const papers = alpvData.references.filter((r): r is import('../common/model.types.js').IModelPaper => !('separator' in r));
					webviewInput.webview.postMessage({ command: 'showReferences', references: papers });
				} else if (msg.target === 'repository') {
					try {
						await openPackageItem('repository', alpvData.packages, commandService, quickInputService, clipboardService, notificationService);
					} finally {
						webviewInput.webview.postMessage({ command: 'actionDone' });
					}
				}
				break;
			case 'openReference': {
				const papers = alpvData.references.filter((r): r is import('../common/model.types.js').IModelPaper => !('separator' in r));
				const paper = papers.find(p => p.title === msg.id);
				if (paper) {
					const url = paper.doi ? `https://doi.org/${paper.doi}` : paper.url;
					if (url) { await openInBrowser(url, commandService); }
				}
				break;
			}
			case 'openNotebook':
				await openNotebookByFile(msg.target, alpvData.notebooks, openerService, editorService, notebookKernelService, notebookEditorModelResolverService);
				break;
			case 'openWiki':
				await openWikiByFile(msg.target, alpvData.wikis, openerService, editorService, commandService);
				break;
			case 'runCode': {
				const code = msg.code;
				if (msg.target === 'newFile') {
					const input: IUntitledTextResourceEditorInput = {
						resource: undefined,
						contents: code,
						languageId: 'julia',
					};
					await editorService.openEditor(input);
				} else if (msg.target === 'juliaRepl') {
					// Inject the API key as a session env var so it never lands in a saved file.
					const prefix = await apiKey.replPrefix(msg.target);
					await commandService.executeCommand('language-julia.startREPL');
					await commandService.executeCommand('workbench.action.terminal.sendSequence', { text: prefix + code + '\n' });
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
				// Executing targets need the packages present; nudge the user if any are missing (non-blocking).
				await pkgStatus.nudgeIfMissing(msg.target);
				break;
			}
			case 'colorize':
				if (msg.code) { await postColorized(msg.code, msg.target || ''); }
				break;
			case 'openUrl':
				if (msg.url) { await openInBrowser(msg.url, commandService); }
				break;
			case 'openVideoList':
				try {
					await openVideoList(alpvData.packages, quickInputService, commandService);
				} finally {
					webviewInput.webview.postMessage({ command: 'actionDone' });
				}
				break;
			case 'installPackages':
				await pkgStatus.handleInstall();
				break;
			case 'setApiKey':
				await apiKey.handleSet();
				break;
			case 'clearApiKey':
				await apiKey.handleClear();
				break;
			case 'cancelAction':
				await quickInputService.cancel();
				break;
		}
	}));

	return disposables;
}
