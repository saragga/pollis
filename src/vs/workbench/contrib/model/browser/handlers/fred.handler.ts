/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
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
import { IFredMetadata, FredWebviewMessage } from '../common/fred.types.js';
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
import { openWikiByFile, openNotebookByFile, openInBrowser, autoSelectJuliaKernel, createPackageStatusWiring, createExampleCodeWiring, createCustomCopyWiring, createReferenceWiring, createVideoWiring, createApiKeyWiring, sendToJuliaRepl } from './model.handler.js';
import { CREDENTIALS } from '../common/credentials.js';
import { hasKey } from '../../../../../base/common/types.js';

const FRED_API_KEY = { label: 'FRED', fields: [{ ...CREDENTIALS.fred, prompt: 'FRED API key' }] };

export function registerFredWebviewHandlers(
	webviewInput: ReturnType<IWebviewWorkbenchService['openWebview']>,
	metadata: IFredMetadata,
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
	const fredData = metadata.fred;
	const pkgStatus = createPackageStatusWiring(webviewInput.webview, disposables, fredData.packages.map(p => p.name), fileService, pathService, commandService, notificationService, workspaceContextService);
	createExampleCodeWiring(webviewInput.webview, disposables, 'fred', fileService, pathService, notificationService);
	createCustomCopyWiring(webviewInput.webview, disposables, fredData.wikis, fredData.notebooks, fileService, pathService, editorService, commandService, notificationService);
	createReferenceWiring(webviewInput.webview, disposables, 'fred', fredData.references, fileService, pathService, commandService, notificationService);
	createVideoWiring(webviewInput.webview, disposables, 'fred', fredData.packages, fileService, pathService, commandService, notificationService);
	const apiKey = createApiKeyWiring(webviewInput.webview, FRED_API_KEY, secretStorageService, quickInputService, webviewService);

	setTimeout(() => {
		const packages = fredData.packages.map(pkg => ({ name: pkg.name, url: pkg.github }));
		const hasReferences = fredData.references.some(r => !hasKey(r, { separator: true }));
		const notebookSections = fredData.notebookSections.map(s => ({
			label: s.label,
			notebooks: s.notebooks.map(n => ({ name: n.name, file: n.bundled ? n.file : '', description: n.description })),
		}));
		const wikiSections: Array<{ label: string; wikis: Array<{ name: string; file: string; description?: string }> }> = [];
		let currentWikiSection: { label: string; wikis: Array<{ name: string; file: string; description?: string }> } = { label: '', wikis: [] };
		for (const w of fredData.wikis) {
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
		void pkgStatus.postStatus();
		void apiKey.postStatus();
	}, 0);

	disposables.add(webviewInput.webview.onDidDispose(() => disposables.dispose()));
	disposables.add(webviewInput.webview.onMessage(async (e: { message: FredWebviewMessage }) => {
		const msg = e.message;
		switch (msg.command) {
			case 'openNotebook':
				await openNotebookByFile(msg.target, fredData.notebooks, openerService, editorService, notebookKernelService, notebookEditorModelResolverService);
				break;
			case 'openWiki':
				await openWikiByFile(msg.target, fredData.wikis, openerService, editorService, commandService);
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
			case 'installPackages':
				await pkgStatus.handleInstall();
				break;
			case 'setApiKey':
				await apiKey.handleSet();
				break;
			case 'clearApiKey':
				await apiKey.handleClear();
				break;
		}
	}));

	return disposables;
}
