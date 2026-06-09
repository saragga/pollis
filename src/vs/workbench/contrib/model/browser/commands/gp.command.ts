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
import { IGpMetadata } from '../common/gp.types.js';
import { registerGpWebviewHandlers } from '../handlers/gp.handler.js';
import { getGpHtml } from '../webviews/gp.template.js';

const GP_VIEW_TYPE = 'pollis.gp';
const GP_TITLE = 'Generalized Pareto Distribution';

const GP_METADATA: IGpMetadata = {
	gp: {
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
						title: 'Statistical Inference Using Extreme Order Statistics',
						authors: 'Pickands, J.',
						year: 1975,
						url: 'https://doi.org/10.1214/aos/1176343003',
						openAccess: false,
					},
				],
			},
		],
		notebooks: [
			{ name: 'Quick Start',           file: 'gp/tutorial-01-quickstart.ipynb',  bundled: true, description: 'Fit a GP distribution to threshold exceedances' },
			{ name: 'Threshold Selection',   file: 'gp/tutorial-02-threshold.ipynb',   bundled: true, description: 'Mean excess plot and threshold stability methods' },
			{ name: 'Exceedance Modelling',  file: 'gp/tutorial-03-exceedances.ipynb', bundled: true, description: 'Model excess losses above a threshold with the GP distribution' },
		],
		wikis: [
			{ name: 'Overview',       file: 'gp/overview.md',       bundled: true },
			{ name: 'Factsheet',      file: 'gp/factsheet.md',      bundled: true },
			{ name: 'Assumptions',    file: 'gp/assumptions.md',    bundled: true },
			{ name: 'Diagnostics',    file: 'gp/diagnostics.md',    bundled: true },
			{ name: 'Interpretation', file: 'gp/interpretation.md', bundled: true },
			{ name: 'Decision Guide', file: 'gp/decision-guide.md', bundled: true },
		],
		tooltips: {
			data:              'Full data series from which exceedances above the threshold will be extracted.',
			threshold:         'Threshold u for fitting. Observations exceeding u are used to fit the GP distribution. Choose using the mean excess plot.',
			method:            'Estimation method. Maximum Likelihood is the default. Probability-Weighted Moments is faster. Bayesian Estimation yields posterior distributions for the parameters.',
			'threshold-param': 'Location parameter &#956; (threshold) for the GP distribution. Sets the lower bound of support.',
			sigma:             'Scale parameter &#963; &gt; 0. Controls the spread of exceedances above the threshold.',
			xi:                'Shape parameter &#958;. &#958; &gt; 0: heavy tail; &#958; = 0: exponential; &#958; &lt; 0: bounded support above threshold.',
			x:                 'Point at which to evaluate the pdf and cdf (must be above the threshold &#956;).',
			p:                 'Probability level for the quantile. E.g., 0.99 gives the 99th percentile; 0.999 gives the 99.9th percentile.',
			n:                 'Number of random samples to generate.',
		},
	},
};

export function openGpWebview(
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
			title: GP_TITLE,
			options: { retainContextWhenHidden: true },
			contentOptions: { allowScripts: true },
			extension: undefined,
		},
		GP_VIEW_TYPE,
		GP_TITLE,
		undefined,
		{ group: undefined, preserveFocus: false }
	);

	webviewInput.webview.setHtml(getGpHtml());

	registerGpWebviewHandlers(
		webviewInput,
		GP_METADATA,
		openerService,
		editorService,
		quickInputService,
		commandService,
		clipboardService,
		notificationService,
	);
}
