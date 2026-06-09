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
import { IEvtDiagMetadata } from '../common/evt-diag.types.js';
import { registerEvtDiagWebviewHandlers } from '../handlers/evt-diag.handler.js';
import { getEvtDiagHtml } from '../webviews/evt-diag.template.js';

const EVT_DIAG_VIEW_TYPE = 'pollis.evtDiag';
const EVT_DIAG_TITLE = 'Extreme Value Diagnostics';

const EVT_DIAG_METADATA: IEvtDiagMetadata = {
	evtDiag: {
		packages: [
			{
				name: 'Extremes.jl',
				github: 'https://github.com/jojal5/Extremes.jl',
				papers: [
					{
						title: 'Extremes.jl: Extreme Value Analysis in Julia',
						authors: 'Jalbert, J., Farmer, M., Gobeil, G., & Roy, P.',
						year: 2024,
						url: 'https://doi.org/10.18637/jss.v109.i06',
						openAccess: true,
					},
					{
						title: 'Statistics of Extremes',
						authors: 'Beirlant, J., Goegebeur, Y., Segers, J., & Teugels, J.',
						year: 2004,
						url: 'https://doi.org/10.1002/0470012382',
						openAccess: false,
					},
				],
			},
		],
		notebooks: [
			{ name: 'Quick Start',          file: 'evt-diag/tutorial-01-quickstart.ipynb', bundled: true, description: 'Overview of EVT diagnostic tools' },
			{ name: 'Threshold Selection',  file: 'evt-diag/tutorial-02-threshold.ipynb',  bundled: true, description: 'Mean excess plot and threshold stability diagnostics' },
			{ name: 'Tail Index Estimation', file: 'evt-diag/tutorial-03-hill.ipynb',       bundled: true, description: 'Hill estimator and tail index diagnostics' },
		],
		wikis: [
			{ name: 'Overview',       file: 'evt-diag/overview.md',       bundled: true },
			{ name: 'Factsheet',      file: 'evt-diag/factsheet.md',      bundled: true },
			{ name: 'Assumptions',    file: 'evt-diag/assumptions.md',    bundled: true },
			{ name: 'Diagnostics',    file: 'evt-diag/diagnostics.md',    bundled: true },
			{ name: 'Interpretation', file: 'evt-diag/interpretation.md', bundled: true },
			{ name: 'Decision Guide', file: 'evt-diag/decision-guide.md', bundled: true },
		],
		tooltips: {
			data:           'Data series for diagnostic analysis. For Mean Excess and Hill Plot use the raw series; for QQ Plot use the series to fit the chosen distribution.',
			'n-thresholds': 'Number of equally-spaced threshold values to evaluate the mean excess function across the data range.',
			'threshold-qq': 'Threshold u used when fitting a Generalized Pareto distribution for the QQ plot. Ignored when GEV is selected.',
			'max-pct':      'Upper percentile for the threshold grid in the Mean Excess plot. E.g., 0.95 evaluates mean excess up to the 95th percentile of the data.',
			'min-obs':      'Minimum number of observations above a threshold required to include it in the Mean Excess plot. Thresholds with fewer observations are excluded to avoid unreliable estimates. Default is 10.',
			'qq-method':    'Estimation method for fitting GEV or GP in the QQ Plot. Maximum Likelihood is the default. Probability-Weighted Moments is faster.',
		},
	},
};

export function openEvtDiagWebview(
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
			title: EVT_DIAG_TITLE,
			options: { retainContextWhenHidden: true },
			contentOptions: { allowScripts: true },
			extension: undefined,
		},
		EVT_DIAG_VIEW_TYPE,
		EVT_DIAG_TITLE,
		undefined,
		{ group: undefined, preserveFocus: false }
	);

	webviewInput.webview.setHtml(getEvtDiagHtml());

	registerEvtDiagWebviewHandlers(
		webviewInput,
		EVT_DIAG_METADATA,
		openerService,
		editorService,
		quickInputService,
		commandService,
		clipboardService,
		notificationService,
	);
}
