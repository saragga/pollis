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
import { IMmnMetadata } from '../common/mmn.types.js';
import { registerMmnWebviewHandlers } from '../handlers/mmn.handler.js';
import { getMmnHtml } from '../webviews/mmn.template.js';

const MMN_VIEW_TYPE = 'pollis.mmn';
const MMN_TITLE = 'Market Microstructure Noise';

const MMN_METADATA: IMmnMetadata = {
	mmn: {
		packages: [
			{
				name: 'MicrostructureNoise.jl',
				github: 'https://github.com/mschauer/MicrostructureNoise.jl',
				papers: [
					{
						title: 'Nonparametric Bayesian volatility estimation',
						authors: 'Gugushvili, S., van der Meulen, F., Schauer, M., & Spreij, P.',
						year: 2019,
						url: 'https://arxiv.org/abs/1801.09956',
						openAccess: true,
					},
					{
						title: 'Fast and scalable non-parametric Bayesian inference for Poisson point processes',
						authors: 'Gugushvili, S., van der Meulen, F., Schauer, M., & Spreij, P.',
						year: 2023,
						url: 'https://doi.org/10.48550/arXiv.1804.03616',
						openAccess: true,
					},
				],
			},
		],
		notebooks: [
			{ name: 'Quick Start',          file: 'mmn/tutorial-01-quickstart.ipynb',    bundled: true, description: 'Bayesian nonparametric volatility estimation from noisy high-frequency observations' },
			{ name: 'Prior Specification',  file: 'mmn/tutorial-02-prior.ipynb',         bundled: true, description: 'Configure the Prior struct: bin count, InvGamma hyperparameters, and smoothing prior' },
			{ name: 'MCMC Sampling',        file: 'mmn/tutorial-03-mcmc.ipynb',          bundled: true, description: 'Run the Gibbs sampler with FFBS and inspect acceptance rates and mixing' },
			{ name: 'Posterior Volatility', file: 'mmn/tutorial-04-posterior.ipynb',     bundled: true, description: 'Extract posterior mean and credible bands from MCMC output via posterior_volatility' },
		],
		wikis: [
			{ name: 'Overview',        file: 'mmn/overview.md',        bundled: true },
			{ name: 'Factsheet',       file: 'mmn/factsheet.md',       bundled: true },
			{ name: 'Assumptions',     file: 'mmn/assumptions.md',     bundled: true },
			{ name: 'Diagnostics',     file: 'mmn/diagnostics.md',     bundled: true },
			{ name: 'Interpretation',  file: 'mmn/interpretation.md',  bundled: true },
			{ name: 'Decision Guide',  file: 'mmn/decision-guide.md',  bundled: true },
		],
		tooltips: {
			N:          'Number of bins for the piecewise-constant volatility path. Higher values capture finer structure but increase computation time.',
			alpha1:     'Shape parameter α₁ of the InvGamma prior on the first volatility bin. Controls the prior mean of the initial variance level.',
			beta1:      'Rate parameter β₁ of the InvGamma prior on the first volatility bin. Larger values concentrate the prior around lower volatility.',
			alphaEta:   'Shape parameter αη of the InvGamma prior on the microstructure noise variance η².',
			betaEta:    'Rate parameter βη of the InvGamma prior on the noise variance η². Together with αη sets the noise prior mean β/(α−1).',
			PiAlpha:    'Smoothing prior distribution Πα on the log-ratio of consecutive volatility bins. LogNormal(μ, σ) is the default. Controls path smoothness.',
			mu0:        'Prior mean μ₀ of the initial state X(0). Typically set near the first observed price.',
			C0:         'Prior variance C₀ of the initial state X(0). Controls initial uncertainty. Set large for a diffuse prior.',
			iterations: 'Number of MCMC iterations. Includes both burn-in and posterior draws. Typical range: 5000–50000.',
			alpha0:     'Initial volatility vector α₀ passed to MCMC. Length must equal N. Often initialised to a constant.',
			sigmaAlpha: 'Proposal standard deviation σα for the random-walk Metropolis step on log-volatility bins.',
			burnin:     'Number of initial MCMC draws to discard as burn-in when computing posterior_volatility.',
			qu:         'Credible interval quantile for the posterior volatility bands, e.g. 0.9 gives 90% bands.',
		},
	},
};

export function openMmnWebview(
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
			title: MMN_TITLE,
			options: { retainContextWhenHidden: true },
			contentOptions: { allowScripts: true },
			extension: undefined,
		},
		MMN_VIEW_TYPE,
		MMN_TITLE,
		undefined,
		{ group: undefined, preserveFocus: false }
	);

	webviewInput.webview.setHtml(getMmnHtml());

	registerMmnWebviewHandlers(
		webviewInput,
		MMN_METADATA,
		openerService,
		editorService,
		quickInputService,
		commandService,
		clipboardService,
		notificationService,
	);
}
