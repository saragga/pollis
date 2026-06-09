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
import { ISbiMetadata } from '../common/sbi.types.js';
import { registerSbiWebviewHandlers } from '../handlers/sbi.handler.js';
import { getSbiHtml } from '../webviews/sbi.template.js';

const SBI_VIEW_TYPE = 'pollis.sbi';
const SBI_TITLE = 'Simulation-Based Inference';

const SBI_METADATA: ISbiMetadata = {
	sbi: {
		packages: [
			{
				name: 'NeuralEstimators.jl',
				github: 'https://github.com/msainsburydale/NeuralEstimators.jl',
				papers: [
					{ title: 'Neural Bayes Estimators for Irregular Spatial Data Using Graph Neural Networks', authors: 'Sainsbury-Dale, M., Zammit-Mangion, A. & Huser, R.', year: 2024, url: 'https://doi.org/10.1080/10618600.2024.2338323', openAccess: true },
					{ title: 'Likelihood-Free Parameter Estimation with Neural Bayes Estimators', authors: 'Sainsbury-Dale, M., Zammit-Mangion, A. & Huser, R.', year: 2024, url: 'https://doi.org/10.1080/00031305.2023.2249522', openAccess: true },
				],
			},
		],
		notebooks: [
			{ name: 'Quick Start', file: 'sbi/tutorial-01-quickstart.ipynb', bundled: true, description: 'Train a neural Bayes estimator from scratch &#8212; prior, simulator, network, training loop' },
			{ name: 'Uncertainty Quantification', file: 'sbi/tutorial-02-uncertainty.ipynb', bundled: true, description: 'Bootstrap and conformal prediction intervals for neural estimators' },
			{ name: 'Spatial Data', file: 'sbi/tutorial-03-spatial.ipynb', bundled: true, description: 'Graph neural network estimators for irregular spatial observations' },
			{ name: 'Model Assessment', file: 'sbi/tutorial-04-assessment.ipynb', bundled: true, description: 'Bias, RMSE, and coverage diagnostics via simulation study' },
		],
		wikis: [
			{ name: 'Overview',         file: 'sbi/overview.md',         bundled: true },
			{ name: 'Factsheet',        file: 'sbi/factsheet.md',        bundled: true },
			{ name: 'Assumptions',      file: 'sbi/assumptions.md',      bundled: true },
			{ name: 'Diagnostics',      file: 'sbi/diagnostics.md',      bundled: true },
			{ name: 'Interpretation',   file: 'sbi/interpretation.md',   bundled: true },
			{ name: 'Decision Guide',   file: 'sbi/decision-guide.md',   bundled: true },
		],
		tooltips: {
			data:         'Observed data passed to the trained estimator. Can be a matrix, vector, or graph depending on the architecture. Must match the format produced by the simulator used during training.',
			parameters:   'Number of parameters &#952; to estimate. Determines the output dimension of the neural network.',
			simulations:  'Number of simulated data sets m per parameter draw during training. Higher values reduce Monte Carlo variance but increase memory usage.',
			epochs:       'Number of full passes through the simulated training set. Typical range: 100&#8211;500.',
			estimator:    'Type of neural estimator.\nPointEstimator &#8212; returns a point estimate (e.g. posterior mean or MAP)\nIntervalEstimator &#8212; returns lower and upper credible interval bounds\nQuantileEstimator &#8212; returns arbitrary quantiles of the posterior',
		},
	},
};

export function openSbiWebview(
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
			title: SBI_TITLE,
			options: { retainContextWhenHidden: true },
			contentOptions: { allowScripts: true },
			extension: undefined,
		},
		SBI_VIEW_TYPE,
		SBI_TITLE,
		undefined,
		{ group: undefined, preserveFocus: false }
	);

	webviewInput.webview.setHtml(getSbiHtml());

	registerSbiWebviewHandlers(
		webviewInput,
		SBI_METADATA,
		openerService,
		editorService,
		quickInputService,
		commandService,
		clipboardService,
		notificationService,
	);
}
