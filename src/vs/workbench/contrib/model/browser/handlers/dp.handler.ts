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
import { IDpMetadata, DpWebviewMessage } from '../common/dp.types.js';
import { openWikiByFile, openNotebookByFile, openPackageItem, openReferenceList, openVideoList, openInBrowser } from './model.handler.js';

export function registerDpWebviewHandlers(
	webviewInput: ReturnType<IWebviewWorkbenchService['openWebview']>,
	metadata: IDpMetadata,
	openerService: IOpenerService,
	editorService: IEditorService,
	quickInputService: IQuickInputService,
	commandService: ICommandService,
	clipboardService: IClipboardService,
	notificationService: INotificationService,
	initialModel?: string,
): DisposableStore {
	const disposables = new DisposableStore();
	const dpData = metadata.dp;

	setTimeout(() => {
		const packages = dpData.packages.map(pkg => ({ name: pkg.name, url: pkg.github }));
		const hasReferences = dpData.references.some(r => !('separator' in r));
		const notebookSections = dpData.notebookSections.map(s => ({
			label: s.label,
			notebooks: s.notebooks.map(n => ({ name: n.name, file: n.bundled ? n.file : '', description: n.description })),
		}));
		const wikiSections: Array<{ label: string; wikis: Array<{ name: string; file: string }> }> = [];
		let currentWikiSection: { label: string; wikis: Array<{ name: string; file: string }> } = { label: '', wikis: [] };
		for (const w of dpData.wikis) {
			if ('separator' in w) {
				wikiSections.push(currentWikiSection);
				currentWikiSection = { label: w.label ?? '', wikis: [] };
			} else {
				currentWikiSection.wikis.push({ name: w.name, file: w.bundled ? w.file : '' });
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
	}, 100);

	disposables.add(webviewInput.webview.onDidDispose(() => disposables.dispose()));

	disposables.add(webviewInput.webview.onMessage(async (e: { message: DpWebviewMessage }) => {
		const msg = e.message;
		switch (msg.command) {
			case 'openDocs':
				try {
					if (msg.target === 'paper') {
						await openReferenceList(dpData.references, quickInputService, commandService, clipboardService, notificationService);
					} else if (msg.target === 'repository') {
						await openPackageItem('repository', dpData.packages, commandService, quickInputService, clipboardService, notificationService);
					}
				} finally {
					webviewInput.webview.postMessage({ command: 'actionDone' });
				}
				break;
			case 'openNotebook':
				await openNotebookByFile(msg.target, dpData.notebooks, openerService, editorService);
				break;
			case 'openWiki':
				await openWikiByFile(msg.target, dpData.wikis, openerService, editorService, commandService);
				break;
			case 'openUrl':
				if (msg.url) { await openInBrowser(msg.url, commandService); }
				break;
			case 'openVideoList':
				try {
					await openVideoList(dpData.packages, quickInputService, commandService);
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
