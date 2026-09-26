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
import { ILanguageService } from '../../../../../editor/common/languages/language.js';
import { IThemeService } from '../../../../../platform/theme/common/themeService.js';
import { tokenizeToString } from '../../../../../editor/common/languages/textToHtmlTokenizer.js';
import { TokenizationRegistry } from '../../../../../editor/common/languages.js';
import { generateTokensCSSForColorMap } from '../../../../../editor/common/languages/supports/tokenization.js';
import { IKgmMetadata, KgmWebviewMessage, IKgmApiModel } from '../common/kgm.types.js';
import { IRequestService, asJson } from '../../../../../platform/request/common/request.js';
import { CancellationToken } from '../../../../../base/common/cancellation.js';

import { IFileService } from '../../../../../platform/files/common/files.js';
import { IPathService } from '../../../../services/path/common/pathService.js';
import { IWorkspaceContextService } from '../../../../../platform/workspace/common/workspace.js';
import { ISecretStorageService } from '../../../../../platform/secrets/common/secrets.js';
import { IWebviewService } from '../../../webview/browser/webview.js';
import { openWikiByFile, openNotebookByFile, openPackageItem, openVideoList, openInBrowser, autoSelectJuliaKernel, createPackageStatusWiring, createExampleCodeWiring, createApiKeyWiring, sendToJuliaRepl } from './model.handler.js';
import { CREDENTIALS } from '../common/credentials.js';

const KGM_API_KEY = {
	label: 'Kaggle',
	noun: 'credentials',
	fields: [
		{ ...CREDENTIALS.kaggleUsername, prompt: 'Kaggle username', password: false },
		{ ...CREDENTIALS.kaggleKey, prompt: 'Kaggle API key' },
	],
};
import { Event } from '../../../../../base/common/event.js';
import { IUntitledTextResourceEditorInput } from '../../../../common/editor.js';
import { CellEditType, CellKind } from '../../../notebook/common/notebookCommon.js';
import { hasKey } from '../../../../../base/common/types.js';

export function registerKgmWebviewHandlers(
	webviewInput: ReturnType<IWebviewWorkbenchService['openWebview']>,
	metadata: IKgmMetadata,
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
	const kgmData = metadata.kgm;
	const pkgStatus = createPackageStatusWiring(webviewInput.webview, disposables, kgmData.packages.map(p => p.name), fileService, pathService, commandService, notificationService, workspaceContextService);
	createExampleCodeWiring(webviewInput.webview, disposables, 'kgm', fileService, pathService, notificationService);
	const apiKey = createApiKeyWiring(webviewInput.webview, KGM_API_KEY, secretStorageService, quickInputService, webviewService);

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
		const packages = kgmData.packages.map(pkg => ({ name: pkg.name, url: pkg.github }));
		const hasReferences = kgmData.references.some(r => !hasKey(r, { separator: true }));
		const notebookSections = kgmData.notebookSections.map(s => ({
			label: s.label,
			notebooks: s.notebooks.map(n => ({ name: n.name, file: n.bundled ? n.file : '', description: n.description })),
		}));
		const wikiSections: Array<{ label: string; wikis: Array<{ name: string; file: string; description?: string }> }> = [];
		let currentWikiSection: { label: string; wikis: Array<{ name: string; file: string; description?: string }> } = { label: '', wikis: [] };
		for (const w of kgmData.wikis) {
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
		if (kgmData.conceptMap) {
			webviewInput.webview.postMessage({ command: 'conceptMap', map: kgmData.conceptMap });
		}
		if (initialModel) {
			webviewInput.webview.postMessage({ command: 'setModel', model: initialModel });
		}
		void pkgStatus.postStatus();
		void apiKey.postStatus();
	}, 100);

	disposables.add(webviewInput.webview.onDidDispose(() => disposables.dispose()));

	disposables.add(webviewInput.webview.onMessage(async (e: { message: KgmWebviewMessage }) => {
		const msg = e.message;
		switch (msg.command) {
			case 'openDocs':
				if (msg.target === 'paper') {
					const papers = kgmData.references.filter((r): r is import('../common/model.types.js').IModelPaper => !hasKey(r, { separator: true }));
					webviewInput.webview.postMessage({ command: 'showReferences', references: papers });
				} else if (msg.target === 'repository') {
					try {
						await openPackageItem('repository', kgmData.packages, commandService, quickInputService, clipboardService, notificationService);
					} finally {
						webviewInput.webview.postMessage({ command: 'actionDone' });
					}
				}
				break;
			case 'openReference': {
				const papers = kgmData.references.filter((r): r is import('../common/model.types.js').IModelPaper => !hasKey(r, { separator: true }));
				const paper = papers.find(p => p.title === msg.id);
				if (paper) {
					const url = paper.doi ? `https://doi.org/${paper.doi}` : paper.url;
					if (url) { await openInBrowser(url, commandService); }
				}
				break;
			}
			case 'openNotebook':
				await openNotebookByFile(msg.target, kgmData.notebooks, openerService, editorService, notebookKernelService, notebookEditorModelResolverService);
				break;
			case 'openWiki':
				await openWikiByFile(msg.target, kgmData.wikis, openerService, editorService, commandService);
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
					await openVideoList(kgmData.packages, quickInputService, commandService);
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
			case 'fetchKgmModels': {
				const sortMap: Record<string, string> = {
					hotness: 'hotness', voteCount: 'voteCount',
					createTime: 'createTime', updateTime: 'updateTime',
				};
				const sortBy = sortMap[msg.sortBy] ?? 'hotness';
				const pageSize = msg.pageSize ?? 30;
				const frameworks: string[] = msg.frameworks ?? [];
				const authors: string[] = msg.authors ?? [];
				const search: string = msg.search ?? '';
				const seq = msg.seq;
				try {
					// framework= param returns 400 unauthenticated; fetch a larger page and post-filter instead
					const fetchPageSize = frameworks.length > 0 ? Math.min(pageSize * 4, 100) : pageSize;
					const fetchSlice = async (author: string | null): Promise<IKgmApiModel[]> => {
						// author filter: use search=slug/ then post-filter by ref prefix (ownerSlug param returns 400 unauthenticated)
						const effectiveSearch = author ? `${author}/` : search;
						let url = `https://www.kaggle.com/api/v1/models/list?sortBy=${sortBy}&pageSize=${fetchPageSize}`;
						if (effectiveSearch) { url += `&search=${encodeURIComponent(effectiveSearch)}`; }
						const ctx = await requestService.request({ url, callSite: 'kgm.fetchModels' }, CancellationToken.None);
						const raw = await asJson<{ models?: Array<Record<string, unknown>> }>(ctx);
						const list = raw?.models;
						if (!Array.isArray(list)) { throw new Error('Kaggle API returned unexpected response'); }
						const mapped = list.map(m => {
							const instances = Array.isArray(m['instances']) ? m['instances'] as Array<Record<string, unknown>> : [];
							const allFrameworks = instances.map(inst => String(inst['framework'] ?? '')).filter(Boolean);
							const fw = allFrameworks[0] ?? '';
							const ref = String(m['ref'] ?? '');
							return {
								ref,
								title: String(m['title'] ?? ''),
								author: String(m['author'] ?? ''),
								framework: fw,
								allFrameworks,
								voteCount: Number(m['voteCount'] ?? 0),
								updateTime: String(m['updateTime'] ?? ''),
								url: String(m['url'] ?? `https://www.kaggle.com/models/${ref}`),
							};
						});
						// exact owner match to avoid false positives from full-text search
						return author ? mapped.filter(m => m.ref.startsWith(author + '/')) : mapped;
					};
					const authorList = authors.length > 0 ? authors : [null];
					const results = await Promise.all(authorList.map(a => fetchSlice(a)));
					const seen = new Set<string>();
					const merged = results.flat().filter(m => {
						if (seen.has(m.ref)) { return false; }
						seen.add(m.ref);
						// client-side framework filter (framework= param returns 400 unauthenticated)
						if (frameworks.length > 0 && !frameworks.some(f => m.allFrameworks.includes(f))) { return false; }
						return true;
					});
					const models = merged.sort((a, b) => {
						if (sortBy === 'voteCount') { return b.voteCount - a.voteCount; }
						if (sortBy === 'createTime' || sortBy === 'updateTime') { return String(b.updateTime).localeCompare(String(a.updateTime)); }
						return 0;
					});
					webviewInput.webview.postMessage({ command: 'kgmModels', models, seq });
				} catch {
					webviewInput.webview.postMessage({ command: 'kgmModelsError', seq });
				}
				break;
			}
		}
	}));

	return disposables;
}