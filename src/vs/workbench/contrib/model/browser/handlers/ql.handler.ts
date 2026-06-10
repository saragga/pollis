/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Antonio Saragga Seabra. All rights reserved.
 *  Proprietary and confidential. Unauthorised copying or distribution is prohibited.
 *--------------------------------------------------------------------------------------------*/

import { DisposableStore } from '../../../../../base/common/lifecycle.js';
import { IOpenerService } from '../../../../../platform/opener/common/opener.js';
import { IEditorService } from '../../../../services/editor/common/editorService.js';
import { IQuickInputService } from '../../../../../platform/quickinput/common/quickInput.js';
import { IClipboardService } from '../../../../../platform/clipboard/common/clipboardService.js';
import { INotificationService } from '../../../../../platform/notification/common/notification.js';
import { ICommandService } from '../../../../../platform/commands/common/commands.js';
import { IWebviewWorkbenchService } from '../../../webviewPanel/browser/webviewWorkbenchService.js';
import { IQlMetadata, QlWebviewMessage } from '../common/ql.types.js';
import { openWikiByFile, openNotebookByFile, openPackageItem, openVideoList, openReferenceList, buildPaperLinks, openInBrowser } from './model.handler.js';

export function registerQLWebviewHandlers(
	webviewInput: ReturnType<IWebviewWorkbenchService['openWebview']>,
	metadata: IQlMetadata,
	openerService: IOpenerService,
	editorService: IEditorService,
	quickInputService: IQuickInputService,
	commandService: ICommandService,
	clipboardService: IClipboardService,
	notificationService: INotificationService,
	initialModel?: string,
): DisposableStore {
	const disposables = new DisposableStore();
	const qlData = metadata.ql;

	setTimeout(() => {
		const packages = qlData.packages.map(pkg => ({ name: pkg.name, url: pkg.github }));
		const papers = buildPaperLinks(qlData.packages);
		const hasReferences = qlData.references.some(r => !('separator' in r));
		const notebookSections = [{
			label: '',
			notebooks: qlData.notebooks.map(n => ({ name: n.name, file: n.bundled ? n.file : '', description: n.description })),
		}];
		const wikiSections: Array<{ label: string; wikis: Array<{ name: string; file: string; description?: string }> }> = [];
		let currentWikiSection: { label: string; wikis: Array<{ name: string; file: string; description?: string }> } = { label: '', wikis: [] };
		for (const w of qlData.wikis) {
			if ('separator' in w) {
				wikiSections.push(currentWikiSection);
				currentWikiSection = { label: w.label ?? '', wikis: [] };
			} else {
				currentWikiSection.wikis.push({ name: w.name, file: w.bundled ? w.file : '', description: w.description });
			}
		}
		if (currentWikiSection.wikis.length > 0) { wikiSections.push(currentWikiSection); }
		webviewInput.webview.postMessage({ command: 'packageLinks', packages });
		webviewInput.webview.postMessage({ command: 'paperLinks', papers, hasPapers: hasReferences });
		webviewInput.webview.postMessage({ command: 'notebookSections', sections: notebookSections });
		webviewInput.webview.postMessage({ command: 'wikiSections', sections: wikiSections });
		if (initialModel) {
			webviewInput.webview.postMessage({ command: 'setModel', model: initialModel });
		}
	}, 100);

	disposables.add(webviewInput.webview.onDidDispose(() => disposables.dispose()));

	disposables.add(webviewInput.webview.onMessage(async (e: { message: QlWebviewMessage }) => {
		const msg = e.message;
		switch (msg.command) {
			case 'openDocs':
				try {
					if (msg.target === 'paper') {
						await openReferenceList(qlData.references, quickInputService, commandService, clipboardService, notificationService);
					} else if (msg.target === 'repository') {
						await openPackageItem('repository', qlData.packages, commandService, quickInputService, clipboardService, notificationService);
					}
				} finally {
					webviewInput.webview.postMessage({ command: 'actionDone' });
				}
				break;
			case 'openNotebook':
				await openNotebookByFile(msg.target, qlData.notebooks, openerService, editorService);
				break;
			case 'openWiki':
				await openWikiByFile(msg.target, qlData.wikis, openerService, editorService, commandService);
				break;
			case 'openUrl':
				if (msg.url) { await openInBrowser(msg.url, commandService); }
				break;
			case 'getPaperLinks':
				webviewInput.webview.postMessage({ command: 'paperLinks', papers: buildPaperLinks(qlData.packages) });
				break;
			case 'openVideoList':
				try {
					await openVideoList(qlData.packages, quickInputService, commandService);
				} finally {
					webviewInput.webview.postMessage({ command: 'actionDone' });
				}
				break;
			case 'cancelAction':
				await quickInputService.cancel();
				break;
		}
	}));

	return disposables;
}
