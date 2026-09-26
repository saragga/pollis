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
import { ILmMetadata } from '../common/lm.types.js';
import { registerLmWebviewHandlers } from '../handlers/lm.handler.js';
import { getLmHtml } from '../webviews/lm.template.js';

const LM_VIEW_TYPE = 'pollis.lm';
const LM_TITLE = 'Linear Regression';

const LM_METADATA: ILmMetadata = {
	lm: {
		packages: [
			{ name: 'GLM.jl',                github: 'https://github.com/JuliaStats/GLM.jl',                papers: [] },
			{ name: 'CovarianceMatrices.jl',  github: 'https://github.com/gragusa/CovarianceMatrices.jl',  papers: [] },
		],
		notebooks: [
			{ name: 'Basic Tutorial', file: 'lm/tutorial-01-basics.ipynb', bundled: true, description: 'Introduction to linear regression with GLM.jl' },
			{ name: 'WLS Tutorial', file: 'lm/tutorial-02-wls.ipynb', bundled: true, description: 'Weighted least squares and heteroskedasticity' },
			{ name: 'Model Selection', file: 'lm/tutorial-03-model-selection.ipynb', bundled: true, description: 'Variable selection and model comparison' },
		],
		wikis: [
			{ name: 'Overview',        file: 'lm/overview.md',        bundled: true },
			{ name: 'Factsheet',       file: 'lm/factsheet.md',       bundled: true },
			{ name: 'Assumptions',     file: 'lm/assumptions.md',     bundled: true },
			{ name: 'Diagnostics',     file: 'lm/diagnostics.md',     bundled: true },
			{ name: 'Interpretation',  file: 'lm/interpretation.md',  bundled: true },
			{ name: 'Decision Guide',  file: 'lm/decision-guide.md',  bundled: true },
		],
		tooltips: {
			formula: 'Julia formula using the @formula macro. The response variable goes on the left of ~, predictors on the right. Example: y ~ x1 + x2. Use x1*x2 for interaction terms (includes main effects), x1:x2 for the interaction only.',
			data: 'DataFrame containing the variables referenced in the formula. All column names must match the formula symbols.',
			weights: 'Optional weight vector for weighted least squares (WLS). Leave empty for OLS. Must have the same length as the number of rows in the data.',
		},
	},
};

export function openLmWebview(
	webviewWorkbenchService: IWebviewWorkbenchService,
	openerService: IOpenerService,
	editorService: IEditorService,
	quickInputService: IQuickInputService,
	commandService: ICommandService,
	clipboardService: IClipboardService,
	notificationService: INotificationService,
): void {
	const webviewInput = webviewWorkbenchService.openWebview(
		{
			title: LM_TITLE,
			options: { retainContextWhenHidden: true },
			contentOptions: { allowScripts: true },
			extension: undefined,
		},
		LM_VIEW_TYPE,
		LM_TITLE,
		undefined,
		{ group: undefined, preserveFocus: false }
	);

	webviewInput.webview.setHtml(getLmHtml());

	registerLmWebviewHandlers(
		webviewInput,
		LM_METADATA,
		openerService,
		editorService,
		quickInputService,
		commandService,
		clipboardService,
		notificationService,
	);
}
