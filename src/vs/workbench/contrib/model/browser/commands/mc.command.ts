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
import { IMcMetadata } from '../common/mc.types.js';
import { registerMcWebviewHandlers } from '../handlers/mc.handler.js';
import { getMcHtml } from '../webviews/mc.template.js';

const MC_VIEW_TYPE = 'pollis.mc';
const MC_TITLE = 'Model Calibration';

const MC_METADATA: IMcMetadata = {
	mc: {
		packages: [
			{
				name: 'GLM.jl',
				github: 'https://github.com/JuliaStats/GLM.jl',
				papers: [],
			},
			{
				name: 'CalibrationErrors.jl',
				github: 'https://github.com/devmotion/CalibrationErrors.jl',
				papers: [
					{ title: 'Calibration tests beyond classification', authors: 'Widmann, D., Lindsten, F. & Zachariah, D.', year: 2022, url: 'https://arxiv.org/abs/2210.00983', openAccess: true },
				],
			},
		],
		notebooks: [
			{ name: 'Platt Scaling',         file: 'model-workflow/tutorial-01-platt-scaling.ipynb',    bundled: true, description: 'Logistic regression recalibration of raw classifier scores with GLM.jl' },
			{ name: 'Isotonic Regression',   file: 'model-workflow/tutorial-02-isotonic.ipynb',         bundled: true, description: 'Non-parametric monotone calibration via the Pool Adjacent Violators algorithm' },
			{ name: 'Temperature Scaling',   file: 'model-workflow/tutorial-03-temperature.ipynb',      bundled: true, description: 'Single-parameter logit rescaling for neural network confidence calibration' },
			{ name: 'Reliability Diagrams',  file: 'model-workflow/tutorial-04-reliability-diagrams.ipynb', bundled: true, description: 'Visualising and measuring calibration quality with CalibrationErrors.jl' },
		],
		wikis: [
			{ name: 'Overview',              file: 'model-workflow/mc-overview.md',      bundled: true },
			{ name: 'Platt Scaling',         file: 'model-workflow/mc-platt.md',         bundled: true },
			{ name: 'Isotonic Regression',   file: 'model-workflow/mc-isotonic.md',      bundled: true },
			{ name: 'Temperature Scaling',   file: 'model-workflow/mc-temperature.md',   bundled: true },
			{ name: 'ECE and Brier Score',   file: 'model-workflow/mc-metrics.md',       bundled: true },
		],
	},
};

export function openMcWebview(
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
			title: MC_TITLE,
			options: { retainContextWhenHidden: true },
			contentOptions: { allowScripts: true },
			extension: undefined,
		},
		MC_VIEW_TYPE,
		MC_TITLE,
		undefined,
		{ group: undefined, preserveFocus: false }
	);

	webviewInput.webview.setHtml(getMcHtml());

	registerMcWebviewHandlers(
		webviewInput,
		MC_METADATA,
		openerService,
		editorService,
		quickInputService,
		commandService,
		clipboardService,
		notificationService,
		initialModel,
	);
}
