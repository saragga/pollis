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
import { IClfMetadata } from '../common/clf.types.js';
import { registerClfWebviewHandlers } from '../handlers/clf.handler.js';
import { getClfHtml } from '../webviews/clf.template.js';

const CLF_VIEW_TYPE = 'pollis.clf';
const CLF_TITLE = 'Classification Performance';

const CLF_METADATA: IClfMetadata = {
	clf: {
		packages: [
			{
				name: 'MLJ.jl',
				github: 'https://github.com/alan-turing-institute/MLJ.jl',
				papers: [
					{ title: 'MLJ: A Julia Package for Composable Machine Learning', authors: 'Blaom, A.D., Kiraly, F., Lienart, T. et al.', year: 2020, url: 'https://doi.org/10.21105/joss.02704', openAccess: true },
				],
			},
		],
		notebooks: [
			{ name: 'Confusion Matrix and Metrics', file: 'model-workflow/tutorial-01-clf-metrics.ipynb', bundled: true, description: 'Accuracy, precision, recall, F1 and MCC from a confusion matrix with MLJ.jl' },
			{ name: 'ROC Curve and AUC',            file: 'model-workflow/tutorial-02-clf-roc.ipynb',     bundled: true, description: 'ROC curve, AUC and Youden optimal threshold with MLJ.jl' },
		],
		wikis: [
			{ name: 'Overview',           file: 'model-workflow/clf-overview.md',    bundled: true },
			{ name: 'Metric Guide',       file: 'model-workflow/clf-metrics.md',     bundled: true },
			{ name: 'ROC Analysis',       file: 'model-workflow/clf-roc.md',         bundled: true },
			{ name: 'Imbalanced Classes', file: 'model-workflow/clf-imbalanced.md',  bundled: true },
		],
	},
};

export function openClfWebview(
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
			title: CLF_TITLE,
			options: { retainContextWhenHidden: true },
			contentOptions: { allowScripts: true },
			extension: undefined,
		},
		CLF_VIEW_TYPE,
		CLF_TITLE,
		undefined,
		{ group: undefined, preserveFocus: false }
	);

	webviewInput.webview.setHtml(getClfHtml());

	registerClfWebviewHandlers(
		webviewInput,
		CLF_METADATA,
		openerService,
		editorService,
		quickInputService,
		commandService,
		clipboardService,
		notificationService,
		initialModel,
	);
}
