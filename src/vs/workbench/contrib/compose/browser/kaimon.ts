/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Antonio Saragga Seabra. All rights reserved.
 *  Proprietary and confidential. Unauthorised copying or distribution is prohibited.
 *--------------------------------------------------------------------------------------------*/

import { DisposableStore } from '../../../../base/common/lifecycle.js';
import { ICommandService } from '../../../../platform/commands/common/commands.js';
import { IWebviewWorkbenchService } from '../../webviewPanel/browser/webviewWorkbenchService.js';
import { getKaimonHtml } from './kaimon.template.js';

const KAIMON_VIEW_TYPE = 'pollis.kaimon';
const KAIMON_TITLE = 'Kaimon';

export function openKaimonWebview(
	webviewWorkbenchService: IWebviewWorkbenchService,
	commandService: ICommandService,
): void {
	const webviewInput = webviewWorkbenchService.openWebview(
		{
			title: KAIMON_TITLE,
			options: { retainContextWhenHidden: true },
			contentOptions: { allowScripts: true },
			extension: undefined,
		},
		KAIMON_VIEW_TYPE,
		KAIMON_TITLE,
		undefined,
		{ group: undefined, preserveFocus: false }
	);

	webviewInput.webview.setHtml(getKaimonHtml());

	const disposables = new DisposableStore();
	disposables.add(webviewInput.webview.onDidDispose(() => disposables.dispose()));
	disposables.add(webviewInput.webview.onMessage(async (e: { message: { command: string; url?: string } }) => {
		const msg = e.message;
		if (msg.command === 'openUrl' && msg.url) {
			await commandService.executeCommand('workbench.action.browser.open', msg.url);
		}
	}));
}
