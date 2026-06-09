/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Antonio Saragga Seabra. All rights reserved.
 *  Proprietary and confidential. Unauthorised copying or distribution is prohibited.
 *--------------------------------------------------------------------------------------------*/

import { IOpenerService } from '../../../../../platform/opener/common/opener.js';
import { IEditorService } from '../../../../services/editor/common/editorService.js';
import { IClipboardService } from '../../../../../platform/clipboard/common/clipboardService.js';
import { INotificationService } from '../../../../../platform/notification/common/notification.js';
import { ICommandService } from '../../../../../platform/commands/common/commands.js';
import { IQuickInputService } from '../../../../../platform/quickinput/common/quickInput.js';
import { IWebviewWorkbenchService } from '../../../webviewPanel/browser/webviewWorkbenchService.js';
import { IUpMetadata } from '../common/up.types.js';
import { registerUpWebviewHandlers } from '../handlers/up.handler.js';
import { getUpHtml } from '../webviews/up.template.js';

const UP_VIEW_TYPE = 'pollis.up';
const UP_TITLE = 'Uncertainty Propagation';

const UP_METADATA: IUpMetadata = {
	up: {
		packages: [
			{ name: 'MonteCarloMeasurements.jl', github: 'https://github.com/baggepinnen/MonteCarloMeasurements.jl', papers: [] },
			{ name: 'Distributions.jl', github: 'https://github.com/JuliaStats/Distributions.jl', papers: [] },
		],
		notebooks: [
			{ name: 'Uncertainty Propagation Basics', file: 'up/tutorial-01-basics.ipynb', bundled: true, description: 'Introduction to uncertain particles and basic arithmetic propagation' },
			{ name: 'Nonlinear Propagation', file: 'up/tutorial-02-nonlinear.ipynb', bundled: true, description: 'Propagating uncertainty through nonlinear functions and composite expressions' },
			{ name: 'Confidence Intervals', file: 'up/tutorial-03-confidence-intervals.ipynb', bundled: true, description: 'Computing credible intervals and percentile statistics from particles' },
			{ name: 'Sensitivity Analysis', file: 'up/tutorial-04-sensitivity.ipynb', bundled: true, description: 'Identifying which uncertain inputs contribute most to output variance' },
			{ name: 'Correlated Inputs', file: 'up/tutorial-05-correlated-inputs.ipynb', bundled: true, description: 'Propagating uncertainty when input variables are statistically correlated using copulas and multivariate distributions' },
		],
		wikis: [
			{ name: 'Overview',        file: 'up/overview.md',        bundled: true },
			{ name: 'Factsheet',       file: 'up/factsheet.md',       bundled: true },
			{ name: 'Assumptions',     file: 'up/assumptions.md',     bundled: true },
			{ name: 'Diagnostics',     file: 'up/diagnostics.md',     bundled: true },
			{ name: 'Interpretation',  file: 'up/interpretation.md',  bundled: true },
			{ name: 'Decision Guide',  file: 'up/decision-guide.md',  bundled: true },
		],
	},
};

export function openUpWebview(
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
			title: UP_TITLE,
			options: { retainContextWhenHidden: true },
			contentOptions: { allowScripts: true },
			extension: undefined,
		},
		UP_VIEW_TYPE,
		UP_TITLE,
		undefined,
		{ group: undefined, preserveFocus: false }
	);

	webviewInput.webview.setHtml(getUpHtml());

	registerUpWebviewHandlers(
		webviewInput,
		UP_METADATA,
		openerService,
		editorService,
		quickInputService,
		commandService,
		clipboardService,
		notificationService,
	);
}
