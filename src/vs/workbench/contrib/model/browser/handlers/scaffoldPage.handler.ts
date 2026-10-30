/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { DisposableStore } from '../../../../../base/common/lifecycle.js';
import { ICommandService } from '../../../../../platform/commands/common/commands.js';
import { IFileService } from '../../../../../platform/files/common/files.js';
import { INotificationService } from '../../../../../platform/notification/common/notification.js';
import { IOpenerService } from '../../../../../platform/opener/common/opener.js';
import { IStorageService } from '../../../../../platform/storage/common/storage.js';
import { IEditorService } from '../../../../services/editor/common/editorService.js';
import { IPathService } from '../../../../services/path/common/pathService.js';
import { getVoiceLanguage, getVoiceWriteIn, setVoiceLanguage, setVoiceWriteIn } from '../../../compose/browser/composerVoice.js';
import { ASK_POLLIS_COMMAND_ID, IAskPollisFromPanel } from '../../../compose/common/askPollis.js';
import { INotebookEditorModelResolverService } from '../../../notebook/common/notebookEditorModelResolverService.js';
import { INotebookKernelService } from '../../../notebook/common/notebookKernelService.js';
import { IWebviewWorkbenchService } from '../../../webviewPanel/browser/webviewWorkbenchService.js';
import { IScaffoldPanelData } from '../common/model.types.js';
import { createCustomCopyWiring, createReferenceWiring, createVideoWiring, openInBrowser, openNotebookByFile, openWikiByFile } from './model.handler.js';
import { postLearnMoreData } from './scaffold.handler.js';

/** Messages a page in the Time Arrow style sends that are not handled by the shared wirings of model.handler.ts. */
type ScaffoldPageMessage =
	| { command: 'openNotebook'; target: string }
	| { command: 'openWiki'; target: string }
	| { command: 'openUrl'; url: string }
	| { command: 'askPollis'; question: string }
	| { command: 'voiceLanguage'; value: string }
	| { command: 'voiceWriteIn'; value: string };

/**
 * What a page in the Time Arrow style of the scaffold has of a panel's handler: its Ask Pollis, Powered by and Learn
 * More. The page's own messages stay with the page. The store is disposed with the webview.
 */
export function registerScaffoldPageHandlers(
	webviewInput: ReturnType<IWebviewWorkbenchService['openWebview']>,
	panelId: string,
	panelTitle: string,
	data: IScaffoldPanelData,
	openerService: IOpenerService,
	editorService: IEditorService,
	commandService: ICommandService,
	notificationService: INotificationService,
	notebookEditorModelResolverService: INotebookEditorModelResolverService,
	notebookKernelService: INotebookKernelService,
	fileService: IFileService,
	pathService: IPathService,
	storageService: IStorageService,
): DisposableStore {
	const disposables = new DisposableStore();
	createCustomCopyWiring(webviewInput.webview, disposables, data.wikis, data.notebooks, fileService, pathService, editorService, commandService, notificationService);
	createReferenceWiring(webviewInput.webview, disposables, panelId, data.references, fileService, pathService, commandService, notificationService);
	createVideoWiring(webviewInput.webview, disposables, panelId, data.packages, fileService, pathService, commandService, notificationService);

	setTimeout(() => {
		postLearnMoreData(webviewInput.webview, data);
		// The languages spoken and written of Ask Pollis beside the title, which the HTML is made without
		webviewInput.webview.postMessage({ command: 'voiceLanguage', value: getVoiceLanguage(storageService) });
		webviewInput.webview.postMessage({ command: 'voiceWriteIn', value: getVoiceWriteIn(storageService) });
	}, 0);

	disposables.add(webviewInput.webview.onDidDispose(() => disposables.dispose()));
	disposables.add(webviewInput.webview.onMessage(async (e: { message: ScaffoldPageMessage }) => {
		const msg = e.message;
		switch (msg.command) {
			case 'openNotebook':
				await openNotebookByFile(msg.target, data.notebooks, openerService, editorService, notebookKernelService, notebookEditorModelResolverService);
				break;
			case 'openWiki':
				await openWikiByFile(msg.target, data.wikis, openerService, editorService, commandService);
				break;
			case 'openUrl':
				if (msg.url) { await openInBrowser(msg.url, commandService); }
				break;
			case 'askPollis':
				// Answered in Ask Pollis beside the page, from its wikis and its packages' vignettes first
				if (msg.question.trim()) {
					await commandService.executeCommand(ASK_POLLIS_COMMAND_ID, {
						question: msg.question.trim(),
						panel: { title: panelTitle, packages: data.packages.map(pkg => pkg.name) },
					} satisfies IAskPollisFromPanel);
				}
				break;
			case 'voiceLanguage':
				setVoiceLanguage(storageService, msg.value);
				break;
			case 'voiceWriteIn':
				setVoiceWriteIn(storageService, msg.value);
				break;
		}
	}));
	return disposables;
}
