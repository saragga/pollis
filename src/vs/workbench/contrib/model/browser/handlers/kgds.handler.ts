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
import { IKgdsMetadata, KgdsWebviewMessage, IKgApiDataset } from '../common/kgds.types.js';
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
import { openWikiByFile, openNotebookByFile, openPackageItem, openVideoList, openInBrowser, autoSelectJuliaKernel, createPackageStatusWiring, createApiKeyWiring, sendToJuliaRepl } from './model.handler.js';
import { CREDENTIALS } from '../common/credentials.js';
import { hasKey } from '../../../../../base/common/types.js';

// Kaggle uses a personal API token (username + key). The same credentials are shared with the
// Kaggle Models webview, so reuse its Secret Storage keys and the env vars the Kaggle CLI/lib
// read (KAGGLE_USERNAME / KAGGLE_KEY).
const KGDS_API_KEY = {
	label: 'Kaggle',
	noun: 'credentials',
	fields: [
		{ ...CREDENTIALS.kaggleUsername, prompt: 'Kaggle username', password: false },
		{ ...CREDENTIALS.kaggleKey, prompt: 'Kaggle API key' },
	],
};

export function registerKgdsWebviewHandlers(
	webviewInput: ReturnType<IWebviewWorkbenchService['openWebview']>,
	metadata: IKgdsMetadata,
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
	const kgdsData = metadata.kgds;
	const pkgStatus = createPackageStatusWiring(webviewInput.webview, disposables, kgdsData.packages.map(p => p.name), fileService, pathService, commandService, notificationService, workspaceContextService);
	const apiKey = createApiKeyWiring(webviewInput.webview, KGDS_API_KEY, secretStorageService, quickInputService, webviewService);

	setTimeout(() => {
		const packages = kgdsData.packages.map(pkg => ({ name: pkg.name, url: pkg.github }));
		const hasReferences = kgdsData.references.some(r => !hasKey(r, { separator: true }));
		const notebookSections = kgdsData.notebookSections.map(s => ({
			label: s.label,
			notebooks: s.notebooks.map(n => ({ name: n.name, file: n.bundled ? n.file : '', description: n.description })),
		}));
		const wikiSections: Array<{ label: string; wikis: Array<{ name: string; file: string; description?: string }> }> = [];
		let currentWikiSection: { label: string; wikis: Array<{ name: string; file: string; description?: string }> } = { label: '', wikis: [] };
		for (const w of kgdsData.wikis) {
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
		if (kgdsData.conceptMap) {
			webviewInput.webview.postMessage({ command: 'conceptMap', map: kgdsData.conceptMap });
		}
		void pkgStatus.postStatus();
		void apiKey.postStatus();
	}, 0);

	disposables.add(webviewInput.webview.onDidDispose(() => disposables.dispose()));
	disposables.add(webviewInput.webview.onMessage(async (e: { message: KgdsWebviewMessage }) => {
		const msg = e.message;
		switch (msg.command) {
			case 'openDocs':
				if (msg.target === 'paper') {
					const papers = kgdsData.references.filter((r): r is import('../common/model.types.js').IModelPaper => !hasKey(r, { separator: true }));
					webviewInput.webview.postMessage({ command: 'showReferences', references: papers });
				} else if (msg.target === 'repository') {
					try {
						await openPackageItem('repository', kgdsData.packages, commandService, quickInputService, clipboardService, notificationService);
					} finally {
						webviewInput.webview.postMessage({ command: 'actionDone' });
					}
				}
				break;
			case 'openReference': {
				const papers = kgdsData.references.filter((r): r is import('../common/model.types.js').IModelPaper => !hasKey(r, { separator: true }));
				const paper = papers.find(p => p.title === msg.id);
				if (paper) {
					const url = paper.doi ? `https://doi.org/${paper.doi}` : paper.url;
					if (url) { await openInBrowser(url, commandService); }
				}
				break;
			}
			case 'openNotebook':
				await openNotebookByFile(msg.target, kgdsData.notebooks, openerService, editorService, notebookKernelService, notebookEditorModelResolverService);
				break;
			case 'openWiki':
				await openWikiByFile(msg.target, kgdsData.wikis, openerService, editorService, commandService);
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
					// Inject the Kaggle credentials as session env vars so they never land in a saved file.
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
			case 'openVideoList':
				try {
					await openVideoList(kgdsData.packages, quickInputService, commandService);
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
			case 'fetchKgdsDatasets': {
				const sortMap: Record<string, string> = {
					hottest: 'hottest', votes: 'votes', updated: 'updated', published: 'published',
				};
				const sortBy = sortMap[msg.sort] ?? 'hottest';
				const limit = msg.limit ?? 30;
				// The dataset catalogue (datasets/list) is public — no auth header needed for browsing.
				// Kaggle has no task/subject filter params, so a combo's chip values (Task + Domain
				// search terms) are joined into one full-text `search` query.
				const fetchSlice = async (tokens: string[]): Promise<IKgApiDataset[]> => {
					let url = `https://www.kaggle.com/api/v1/datasets/list?sortBy=${sortBy}&pageSize=${limit}`;
					const search = tokens.join(' ').trim();
					if (search) { url += `&search=${encodeURIComponent(search)}`; }
					const ctx = await requestService.request({ url, callSite: 'kgds.fetchDatasets' }, CancellationToken.None);
					const raw = await asJson<unknown>(ctx);
					const list = Array.isArray(raw) ? raw : ((raw as { datasets?: unknown[] })?.datasets ?? []);
					return (list as Array<Record<string, unknown>>).map(d => ({
						id: String(d['ref'] ?? ''),
						downloads: Number(d['downloadCount'] ?? 0),
						votes: Number(d['voteCount'] ?? 0),
						lastModified: String(d['lastUpdated'] ?? ''),
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
					const merged = results.flat().filter(d => { if (!d.id || seen.has(d.id)) { return false; } seen.add(d.id); return true; });
					const datasets = merged.sort((a, b) => {
						if (msg.sort === 'votes') { return b.votes - a.votes; }
						if (msg.sort === 'updated' || msg.sort === 'published') { return String(b.lastModified).localeCompare(String(a.lastModified)); }
						return 0;  // hottest: keep the API order
					});
					webviewInput.webview.postMessage({ command: 'kgdsDatasets', datasets, seq });
				} catch {
					webviewInput.webview.postMessage({ command: 'kgdsDatasetsError', seq });
				}
				break;
			}
		}
	}));

	return disposables;
}
