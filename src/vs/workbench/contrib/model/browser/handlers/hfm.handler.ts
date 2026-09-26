/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { DisposableStore } from '../../../../../base/common/lifecycle.js';
import { IOpenerService } from '../../../../../platform/opener/common/opener.js';
import { IEditorService } from '../../../../services/editor/common/editorService.js';
import { IQuickInputService } from '../../../../../platform/quickinput/common/quickInput.js';
import { IClipboardService } from '../../../../../platform/clipboard/common/clipboardService.js';
import { INotificationService } from '../../../../../platform/notification/common/notification.js';
import { ICommandService } from '../../../../../platform/commands/common/commands.js';
import { IWebviewWorkbenchService } from '../../../webviewPanel/browser/webviewWorkbenchService.js';
import { INotebookEditorModelResolverService } from '../../../notebook/common/notebookEditorModelResolverService.js';
import { INotebookKernelService } from '../../../notebook/common/notebookKernelService.js';
import { Event } from '../../../../../base/common/event.js';
import { IUntitledTextResourceEditorInput } from '../../../../common/editor.js';
import { CellEditType, CellKind } from '../../../notebook/common/notebookCommon.js';
import { ILanguageService } from '../../../../../editor/common/languages/language.js';
import { IThemeService } from '../../../../../platform/theme/common/themeService.js';
import { tokenizeToString } from '../../../../../editor/common/languages/textToHtmlTokenizer.js';
import { TokenizationRegistry } from '../../../../../editor/common/languages.js';
import { generateTokensCSSForColorMap } from '../../../../../editor/common/languages/supports/tokenization.js';
import { IHfmMetadata, HfmWebviewMessage, IHfApiModel } from '../common/hfm.types.js';
import { IRequestService, asJson } from '../../../../../platform/request/common/request.js';
import { CancellationToken } from '../../../../../base/common/cancellation.js';

import { IFileService } from '../../../../../platform/files/common/files.js';
import { IPathService } from '../../../../services/path/common/pathService.js';
import { IWorkspaceContextService } from '../../../../../platform/workspace/common/workspace.js';
import { ISecretStorageService } from '../../../../../platform/secrets/common/secrets.js';
import { IWebviewService } from '../../../webview/browser/webview.js';
import { openWikiByFile, openNotebookByFile, openPackageItem, openVideoList, openInBrowser, autoSelectJuliaKernel, createPackageStatusWiring, createApiKeyWiring, sendToJuliaRepl } from './model.handler.js';
import { CREDENTIALS } from '../common/credentials.js';
import { hasKey } from '../../../../../base/common/types.js';

const HFM_API_KEY = { label: 'Hugging Face', noun: 'token', fields: [{ ...CREDENTIALS.huggingFace, prompt: 'Hugging Face access token' }] };

export function registerHfmWebviewHandlers(
	webviewInput: ReturnType<IWebviewWorkbenchService['openWebview']>,
	metadata: IHfmMetadata,
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
	initialModel?: string,
): DisposableStore {
	const disposables = new DisposableStore();
	const hfmData = metadata.hfm;
	const pkgStatus = createPackageStatusWiring(webviewInput.webview, disposables, hfmData.packages.map(p => p.name), fileService, pathService, commandService, notificationService, workspaceContextService);
	const apiKey = createApiKeyWiring(webviewInput.webview, HFM_API_KEY, secretStorageService, quickInputService, webviewService);

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

	setTimeout(() => {
		const packages = hfmData.packages.map(pkg => ({ name: pkg.name, url: pkg.github }));
		const hasReferences = hfmData.references.some(r => !hasKey(r, { separator: true }));
		const notebookSections = hfmData.notebookSections.map(s => ({
			label: s.label,
			notebooks: s.notebooks.map(n => ({ name: n.name, file: n.bundled ? n.file : '', description: n.description })),
		}));
		const wikiSections: Array<{ label: string; wikis: Array<{ name: string; file: string; description?: string }> }> = [];
		let currentWikiSection: { label: string; wikis: Array<{ name: string; file: string; description?: string }> } = { label: '', wikis: [] };
		for (const w of hfmData.wikis) {
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
		if (hfmData.conceptMap) {
			webviewInput.webview.postMessage({ command: 'conceptMap', map: hfmData.conceptMap });
		}
		if (initialModel) {
			webviewInput.webview.postMessage({ command: 'setModel', model: initialModel });
		}
		void pkgStatus.postStatus();
		void apiKey.postStatus();
	}, 100);

	disposables.add(webviewInput.webview.onDidDispose(() => disposables.dispose()));

	disposables.add(webviewInput.webview.onMessage(async (e: { message: HfmWebviewMessage }) => {
		const msg = e.message;
		switch (msg.command) {
			case 'openDocs':
				if (msg.target === 'paper') {
					const papers = hfmData.references.filter((r): r is import('../common/model.types.js').IModelPaper => !hasKey(r, { separator: true }));
					webviewInput.webview.postMessage({ command: 'showReferences', references: papers });
				} else if (msg.target === 'repository') {
					try {
						await openPackageItem('repository', hfmData.packages, commandService, quickInputService, clipboardService, notificationService);
					} finally {
						webviewInput.webview.postMessage({ command: 'actionDone' });
					}
				}
				break;
			case 'openReference': {
				const papers = hfmData.references.filter((r): r is import('../common/model.types.js').IModelPaper => !hasKey(r, { separator: true }));
				const paper = papers.find(p => p.title === msg.id);
				if (paper) {
					const url = paper.doi ? `https://doi.org/${paper.doi}` : paper.url;
					if (url) { await openInBrowser(url, commandService); }
				}
				break;
			}
			case 'openNotebook':
				await openNotebookByFile(msg.target, hfmData.notebooks, openerService, editorService, notebookKernelService, notebookEditorModelResolverService);
				break;
			case 'openWiki':
				await openWikiByFile(msg.target, hfmData.wikis, openerService, editorService, commandService);
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
				await pkgStatus.nudgeIfMissing(msg.target);
				break;
			}
			case 'openUrl':
				if (msg.url) { await openInBrowser(msg.url, commandService); }
				break;
			case 'openVideoList':
				try {
					await openVideoList(hfmData.packages, quickInputService, commandService);
				} finally {
					webviewInput.webview.postMessage({ command: 'actionDone' });
				}
				break;
			case 'colorize':
				await postColorized(msg.code, msg.target ?? 'main');
				break;
			case 'installPackages':
				await pkgStatus.handleInstall();
				break;
			case 'cancelAction':
				await quickInputService.cancel();
				break;
			case 'setApiKey':
				await apiKey.handleSet();
				break;
			case 'clearApiKey':
				await apiKey.handleClear();
				break;
			case 'fetchHfModels': {
				const sortMap: Record<string, string> = {
					trending: 'trendingScore', likes: 'likes', downloads: 'downloads',
					created_at: 'createdAt', last_modified: 'lastModified',
				};
				const hfSort = sortMap[msg.sort] ?? 'trendingScore';
				const limit = msg.limit ?? 30;
				const authors: string[] = msg.authors ?? [];
				const filters: string[] = msg.filters ?? [];
				const fetchSlice = async (tag: string | null, author: string | null, filter: string | null): Promise<IHfApiModel[]> => {
					let url = `https://huggingface.co/api/models?sort=${hfSort}&limit=${limit}&full=true`;
					if (tag) { url += `&pipeline_tag=${tag}`; }
					if (author) { url += `&author=${author}`; }
					if (filter) { url += `&filter=${encodeURIComponent(filter)}`; }
					const ctx = await requestService.request({ url, callSite: 'hfm.fetchModels' }, CancellationToken.None);
					const raw = await asJson<Array<Record<string, unknown>>>(ctx);
					if (!Array.isArray(raw)) { throw new Error('HF API returned unexpected response'); }
					return raw.map(m => ({
						id: String(m['id'] ?? ''),
						pipeline_tag: String(m['pipeline_tag'] ?? ''),
						downloads: Number(m['downloads'] ?? 0),
						likes: Number(m['likes'] ?? 0),
						lastModified: String(m['lastModified'] ?? ''),
						createdAt: String(m['createdAt'] ?? ''),
					}));
				};
				const seq = msg.seq;
				try {
					const tags = msg.tags.length > 0 ? msg.tags : [null];
					const authorList = authors.length > 0 ? authors : [null];
					const filterList = filters.length > 0 ? filters : [null];
					// cross product of tags × authors × frameworks, then deduplicate: selections are
					// OR-ed within each axis (separate requests, merged) and AND-ed across the axes.
					const combos: Array<[string | null, string | null, string | null]> = [];
					for (const t of tags) { for (const a of authorList) { for (const f of filterList) { combos.push([t, a, f]); } } }
					const results = await Promise.all(combos.map(([t, a, f]) => fetchSlice(t, a, f)));
					const seen = new Set<string>();
					const merged = results.flat().filter(m => { if (seen.has(m.id)) { return false; } seen.add(m.id); return true; });
					const models = merged.sort((a, b) => {
						if (hfSort === 'likes') { return b.likes - a.likes; }
						if (hfSort === 'downloads') { return b.downloads - a.downloads; }
						if (hfSort === 'createdAt') { return String(b.createdAt).localeCompare(String(a.createdAt)); }
						// trendingScore, lastModified
						return String(b.lastModified).localeCompare(String(a.lastModified));
					});
					webviewInput.webview.postMessage({ command: 'hfModels', models, seq });
				} catch {
					webviewInput.webview.postMessage({ command: 'hfModelsError', seq });
				}
				break;
			}
		}
	}));

	return disposables;
}
