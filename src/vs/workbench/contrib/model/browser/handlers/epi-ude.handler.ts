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
import { IEpiUdeMetadata, EpiUdeWebviewMessage } from '../common/epi-ude.types.js';
import { openNotebookList, openNotebookByFile, openPackageItem, openInBrowser } from './model.handler.js';

export function registerEpiUdeWebviewHandlers(
	webviewInput: ReturnType<IWebviewWorkbenchService['openWebview']>,
	metadata: IEpiUdeMetadata,
	openerService: IOpenerService,
	editorService: IEditorService,
	quickInputService: IQuickInputService,
	commandService: ICommandService,
	clipboardService: IClipboardService,
	notificationService: INotificationService,
): DisposableStore {
	const disposables = new DisposableStore();
	const epiUdeData = metadata.epiUde;

	setTimeout(() => {
		const packages = epiUdeData.packages.map(pkg => ({ name: pkg.name, url: pkg.github }));
		webviewInput.webview.postMessage({ command: 'packageLinks', packages });
	}, 100);

	disposables.add(webviewInput.webview.onDidDispose(() => disposables.dispose()));

	disposables.add(webviewInput.webview.onMessage(async (e: { message: EpiUdeWebviewMessage }) => {
		const msg = e.message;
		switch (msg.command) {
			case 'openNotebookList':
				try {
					await openNotebookList(epiUdeData.notebooks, quickInputService, openerService, editorService);
				} finally {
					webviewInput.webview.postMessage({ command: 'actionDone' });
				}
				break;
			case 'openNotebook': await openNotebookByFile(msg.target, epiUdeData.notebooks, openerService, editorService); break;
			case 'openDocs':
				try {
					if (msg.target === 'paper') {
						await openPackageItem('repository', epiUdeData.packages, commandService, quickInputService, clipboardService, notificationService);
					} else if (msg.target === 'repository') {
						await openPackageItem('repository', epiUdeData.packages, commandService, quickInputService, clipboardService, notificationService);
					}
				} finally {
					webviewInput.webview.postMessage({ command: 'actionDone' });
				}
				break;
			case 'openUrl': if (msg.url) { await openInBrowser(msg.url, commandService); } break;
			case 'cancelAction': await quickInputService.cancel(); break;
		}
	}));

	return disposables;
}
