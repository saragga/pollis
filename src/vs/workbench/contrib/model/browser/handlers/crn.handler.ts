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
import { ICrnMetadata, CrnWebviewMessage } from '../common/crn.types.js';
import { openWikiList, openWikiByFile, openNotebookList, openNotebookByFile, openPackageItem, openReferenceList, openVideoList, openInBrowser } from './model.handler.js';

export function registerCrnWebviewHandlers(
	webviewInput: ReturnType<IWebviewWorkbenchService['openWebview']>,
	metadata: ICrnMetadata,
	openerService: IOpenerService,
	editorService: IEditorService,
	quickInputService: IQuickInputService,
	commandService: ICommandService,
	clipboardService: IClipboardService,
	notificationService: INotificationService,
	initialModel?: string,
): DisposableStore {
	const disposables = new DisposableStore();
	const crnData = metadata.crn;

	setTimeout(() => {
		const packages = crnData.packages.map(pkg => ({ name: pkg.name, url: pkg.github }));
		const hasReferences = crnData.references.some(r => !('separator' in r));
		webviewInput.webview.postMessage({ command: 'packageLinks', packages });
		webviewInput.webview.postMessage({ command: 'paperLinks', papers: [], hasPapers: hasReferences });
		if (initialModel) {
			webviewInput.webview.postMessage({ command: 'setModel', model: initialModel });
		}
	}, 100);

	disposables.add(webviewInput.webview.onDidDispose(() => disposables.dispose()));

	disposables.add(webviewInput.webview.onMessage(async (e: { message: CrnWebviewMessage }) => {
		const msg = e.message;
		switch (msg.command) {
			case 'openDocs':
				try {
					if (msg.target === 'wiki') {
						await openWikiList(crnData.wikis, quickInputService, openerService, editorService, commandService);
					} else if (msg.target === 'paper') {
						await openReferenceList(crnData.references, quickInputService, commandService, clipboardService, notificationService);
					} else if (msg.target === 'repository') {
						await openPackageItem('repository', crnData.packages, commandService, quickInputService, clipboardService, notificationService);
					}
				} finally {
					webviewInput.webview.postMessage({ command: 'actionDone' });
				}
				break;
			case 'openNotebookList':
				try {
					await openNotebookList(crnData.notebooks, quickInputService, openerService, editorService);
				} finally {
					webviewInput.webview.postMessage({ command: 'actionDone' });
				}
				break;
			case 'openNotebook': await openNotebookByFile(msg.target, crnData.notebooks, openerService, editorService); break;
			case 'openWiki':     await openWikiByFile(msg.target, crnData.wikis, openerService, editorService, commandService); break;
			case 'openUrl':      if (msg.url) { await openInBrowser(msg.url, commandService); } break;
			case 'openVideoList':
				try {
					await openVideoList(crnData.packages, quickInputService, commandService);
				} finally {
					webviewInput.webview.postMessage({ command: 'actionDone' });
				}
				break;
			case 'cancelAction': await quickInputService.cancel(); break;
		}
	}));

	return disposables;
}
