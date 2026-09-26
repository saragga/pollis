/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IOpenerService } from '../../../../../platform/opener/common/opener.js';
import { IEditorService } from '../../../../services/editor/common/editorService.js';
import { IClipboardService } from '../../../../../platform/clipboard/common/clipboardService.js';
import { INotificationService } from '../../../../../platform/notification/common/notification.js';
import { ICommandService } from '../../../../../platform/commands/common/commands.js';
import { IQuickInputService } from '../../../../../platform/quickinput/common/quickInput.js';
import { IWebviewWorkbenchService } from '../../../webviewPanel/browser/webviewWorkbenchService.js';
import { ILmharMetadata } from '../common/lmhar.types.js';
import { registerLmharWebviewHandlers } from '../handlers/lmhar.handler.js';
import { getLmharHtml } from '../webviews/lmhar.template.js';

const LMHAR_VIEW_TYPE = 'pollis.lmhar';
const LMHAR_TITLE = 'Linear Models with Heteroskedasticity + AR(1)';

const LMHAR_METADATA: ILmharMetadata = {
	lmhar: {
		packages: [
			{
				name: 'HARE.jl',
				github: 'https://github.com/Trumpingtons/HARE.jl',
				papers: [],
			},
		],
		notebooks: [
			{ name: 'Sequential (Two-Step)',  file: 'lm-hjar/tutorial-01-seq-twostep.ipynb',  bundled: true, description: 'Sequential two-step: correct AR(1) via Prais-Winsten, then correct heteroskedasticity via Harvey FGLS' },
			{ name: 'Sequential (Iterated)', file: 'lm-hjar/tutorial-02-seq-iterated.ipynb', bundled: true, description: 'Iterated sequential: alternate between AR(1) and heteroskedasticity corrections until convergence' },
			{ name: 'Joint (Two-Step)',       file: 'lm-hjar/tutorial-03-joint-twostep.ipynb', bundled: true, description: 'Joint two-step: simultaneous MLE for beta, rho, and variance parameters' },
			{ name: 'Joint (Iterated)',       file: 'lm-hjar/tutorial-04-joint-iterated.ipynb', bundled: true, description: 'Iterated joint MLE: iterates the joint estimation until full convergence' },
		],
		wikis: [
			{ name: 'Overview',           file: 'lm-hjar/overview.md',    bundled: true },
			{ name: 'Factsheet',          file: 'lm-hjar/factsheet.md',   bundled: true },
			{ name: 'Assumptions',        file: 'lm-hjar/assumptions.md', bundled: true },
			{ name: 'Sequential Method',  file: 'lm-hjar/sequential.md',  bundled: true },
			{ name: 'Joint Method',       file: 'lm-hjar/joint.md',       bundled: true },
			{ name: 'Diagnostics',        file: 'lm-hjar/diagnostics.md', bundled: true },
		],
	},
};

export function openLmharWebview(
	webviewWorkbenchService: IWebviewWorkbenchService,
	openerService: IOpenerService,
	editorService: IEditorService,
	quickInputService: IQuickInputService,
	commandService: ICommandService,
	clipboardService: IClipboardService,
	notificationService: INotificationService,
	initialModel?: string,
): void {
	const webviewInput = webviewWorkbenchService.openWebview(
		{
			title: LMHAR_TITLE,
			options: { retainContextWhenHidden: true },
			contentOptions: { allowScripts: true },
			extension: undefined,
		},
		LMHAR_VIEW_TYPE,
		LMHAR_TITLE,
		undefined,
		{ group: undefined, preserveFocus: false }
	);

	webviewInput.webview.setHtml(getLmharHtml());

	registerLmharWebviewHandlers(
		webviewInput,
		LMHAR_METADATA,
		openerService,
		editorService,
		quickInputService,
		commandService,
		clipboardService,
		notificationService,
		initialModel,
	);
}
