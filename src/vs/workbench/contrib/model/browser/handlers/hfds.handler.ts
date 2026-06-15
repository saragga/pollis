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
import { IHfdsMetadata, HfdsWebviewMessage } from '../common/hfds.types.js';
import type { IHfApiDataset } from '../common/hfds.types.js';
import { IRequestService, asJson } from '../../../../../platform/request/common/request.js';
import { CancellationToken } from '../../../../../base/common/cancellation.js';
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

// Hugging Face uses a personal access token (not an API key). The same token is shared with the
// Hugging Face Models webview, so reuse its Secret Storage key and the env var the Python
// `datasets`/`huggingface_hub` stack reads (HUGGING_FACE_HUB_TOKEN).
const HFDS_API_KEY = { label: 'Hugging Face', noun: 'token', fields: [{ ...CREDENTIALS.huggingFace, prompt: 'Hugging Face access token' }] };

export function registerHfdsWebviewHandlers(
	webviewInput: ReturnType<IWebviewWorkbenchService['openWebview']>,
	metadata: IHfdsMetadata,
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
	requestService: IRequestService,
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
	const hfdsData = metadata.hfds;
	const pkgStatus = createPackageStatusWiring(webviewInput.webview, disposables, hfdsData.packages.map(p => p.name), fileService, pathService, commandService, notificationService, workspaceContextService);
	const apiKey = createApiKeyWiring(webviewInput.webview, HFDS_API_KEY, secretStorageService, quickInputService, webviewService);

	setTimeout(() => {
		const packages = hfdsData.packages.map(pkg => ({ name: pkg.name, url: pkg.github }));
		const hasReferences = hfdsData.references.some(r => !('separator' in r));
		const notebookSections = hfdsData.notebookSections.map(s => ({
			label: s.label,
			notebooks: s.notebooks.map(n => ({ name: n.name, file: n.bundled ? n.file : '', description: n.description })),
		}));
		const wikiSections: Array<{ label: string; wikis: Array<{ name: string; file: string; description?: string }> }> = [];
		let currentWikiSection: { label: string; wikis: Array<{ name: string; file: string; description?: string }> } = { label: '', wikis: [] };
		for (const w of hfdsData.wikis) {
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
		if (hfdsData.conceptMap) {
			webviewInput.webview.postMessage({ command: 'conceptMap', map: hfdsData.conceptMap });
		}
		void pkgStatus.postStatus();
		void apiKey.postStatus();
	}, 0);

	disposables.add(webviewInput.webview.onDidDispose(() => disposables.dispose()));
	disposables.add(webviewInput.webview.onMessage(async (e: { message: HfdsWebviewMessage }) => {
		const msg = e.message;
		switch (msg.command) {
			case 'openDocs':
				if (msg.target === 'paper') {
					const papers = hfdsData.references.filter((r): r is import('../common/model.types.js').IModelPaper => !('separator' in r));
					webviewInput.webview.postMessage({ command: 'showReferences', references: papers });
				} else if (msg.target === 'repository') {
					try {
						await openPackageItem('repository', hfdsData.packages, commandService, quickInputService, clipboardService, notificationService);
					} finally {
						webviewInput.webview.postMessage({ command: 'actionDone' });
					}
				}
				break;
			case 'openReference': {
				const papers = hfdsData.references.filter((r): r is import('../common/model.types.js').IModelPaper => !('separator' in r));
				const paper = papers.find(p => p.title === msg.id);
				if (paper) {
					const url = paper.doi ? `https://doi.org/${paper.doi}` : paper.url;
					if (url) { await openInBrowser(url, commandService); }
				}
				break;
			}
			case 'openNotebook':
				await openNotebookByFile(msg.target, hfdsData.notebooks, openerService, editorService, notebookKernelService, notebookEditorModelResolverService);
				break;
			case 'openWiki':
				await openWikiByFile(msg.target, hfdsData.wikis, openerService, editorService, commandService);
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
					// Inject the HF token as a session env var so it never lands in a saved file.
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
					await openVideoList(hfdsData.packages, quickInputService, commandService);
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
			case 'fetchHfDatasets': {
				const sortMap: Record<string, string> = {
					trending: 'trendingScore', likes: 'likes', downloads: 'downloads',
					created_at: 'createdAt', last_modified: 'lastModified',
				};
				const hfSort = sortMap[msg.sort] ?? 'trendingScore';
				const limit = msg.limit ?? 30;
				const fetchSlice = async (filters: string[]): Promise<IHfApiDataset[]> => {
					let url = `https://huggingface.co/api/datasets?sort=${hfSort}&limit=${limit}&full=true`;
					for (const f of filters) { url += `&filter=${encodeURIComponent(f)}`; }
					const ctx = await requestService.request({ url, callSite: 'hfds.fetchDatasets' }, CancellationToken.None);
					const raw = await asJson<Array<Record<string, unknown>>>(ctx);
					if (!Array.isArray(raw)) { throw new Error('HF API returned unexpected response'); }
					return raw.map(d => ({
						id: String(d['id'] ?? ''),
						downloads: Number(d['downloads'] ?? 0),
						likes: Number(d['likes'] ?? 0),
						lastModified: String(d['lastModified'] ?? ''),
					}));
				};
				const seq = msg.seq;
				try {
					// Cross product of the per-axis selections: OR within an axis, AND across axes.
					const groups = msg.filterGroups.filter(g => g.length > 0);
					let combos: string[][] = [[]];
					for (const g of groups) {
						const next: string[][] = [];
						for (const combo of combos) { for (const f of g) { next.push([...combo, f]); } }
						combos = next;
					}
					const results = await Promise.all(combos.map(c => fetchSlice(c)));
					const seen = new Set<string>();
					const merged = results.flat().filter(d => { if (seen.has(d.id)) { return false; } seen.add(d.id); return true; });
					const datasets = merged.sort((a, b) => {
						if (hfSort === 'likes') { return b.likes - a.likes; }
						if (hfSort === 'downloads') { return b.downloads - a.downloads; }
						if (hfSort === 'createdAt') { return String(b.lastModified).localeCompare(String(a.lastModified)); }
						// trendingScore, lastModified
						return String(b.lastModified).localeCompare(String(a.lastModified));
					});
					webviewInput.webview.postMessage({ command: 'hfDatasets', datasets, seq });
				} catch {
					webviewInput.webview.postMessage({ command: 'hfDatasetsError', seq });
				}
				break;
			}
		}
	}));

	return disposables;
}
