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
import { IEvtDiagMetadata, EvtDiagWebviewMessage } from '../common/evt-diag.types.js';
import { openWikiList, openNotebookList, openNotebookByFile, openWikiByFile, openPackageItem, buildPaperLinks, openInBrowser } from './model.handler.js';

export function registerEvtDiagWebviewHandlers(
	webviewInput: ReturnType<IWebviewWorkbenchService['openWebview']>,
	metadata: IEvtDiagMetadata,
	openerService: IOpenerService,
	editorService: IEditorService,
	quickInputService: IQuickInputService,
	commandService: ICommandService,
	clipboardService: IClipboardService,
	notificationService: INotificationService,
): DisposableStore {
	const disposables = new DisposableStore();
	const evtDiagData = metadata.evtDiag;

	setTimeout(() => {
		const packages = evtDiagData.packages.map(pkg => ({ name: pkg.name, url: pkg.github }));
		const papers = buildPaperLinks(evtDiagData.packages);
		webviewInput.webview.postMessage({ command: 'packageLinks', packages });
		webviewInput.webview.postMessage({ command: 'paperLinks', papers, hasPapers: papers.length > 0 });
		if (evtDiagData.tooltips) {
			webviewInput.webview.postMessage({ command: 'tooltips', tooltips: evtDiagData.tooltips });
		}
	}, 100);

	disposables.add(webviewInput.webview.onDidDispose(() => disposables.dispose()));

	disposables.add(webviewInput.webview.onMessage(async (e: { message: EvtDiagWebviewMessage }) => {
		const msg = e.message;
		switch (msg.command) {
			case 'openDocs':
				try {
					if (msg.target === 'wiki') {
						await openWikiList(evtDiagData.wikis, quickInputService, openerService, editorService, commandService);
					} else if (msg.target === 'paper' || msg.target === 'repository') {
						await openPackageItem(msg.target, evtDiagData.packages, commandService, quickInputService, clipboardService, notificationService);
					}
				} finally {
					webviewInput.webview.postMessage({ command: 'actionDone' });
				}
				break;
			case 'openNotebookList':
				try {
					await openNotebookList(evtDiagData.notebooks, quickInputService, openerService, editorService);
				} finally {
					webviewInput.webview.postMessage({ command: 'actionDone' });
				}
				break;
			case 'openNotebook':
				await openNotebookByFile(msg.target, evtDiagData.notebooks, openerService, editorService);
				break;
			case 'openWiki':
				await openWikiByFile(msg.target, evtDiagData.wikis, openerService, editorService, commandService);
				break;
			case 'openUrl':
				if (msg.url) { await openInBrowser(msg.url, commandService); }
				break;
			case 'getPaperLinks':
				webviewInput.webview.postMessage({ command: 'paperLinks', papers: buildPaperLinks(evtDiagData.packages) });
				break;
			case 'cancelAction':
				await quickInputService.cancel();
				break;
		}
	}));

	return disposables;
}
