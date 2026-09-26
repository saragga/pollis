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
import { IBfmbMetadata } from '../common/bfmb.types.js';
import { registerBfmbWebviewHandlers } from '../handlers/bfmb.handler.js';
import { getBfmbHtml } from '../webviews/bfmb.template.js';

const BFMB_VIEW_TYPE = 'pollis.bfmb';
const BFMB_TITLE = 'Fama-MacBeth Regression';

const BFMB_METADATA: IBfmbMetadata = {
	bfmb: {
		packages: [
			{
				name: 'BayesianFactorZoo.jl',
				github: 'https://github.com/BayesianFactorZoo/BayesianFactorZoo.jl',
				papers: [
					{ title: 'Bayesian Solutions for the Factor Zoo: We Just Ran Two Quadrillion Models', authors: 'Bryzgalova, Huang & Julliard', year: 2023, journal: 'Journal of Finance', doi: '10.1111/jofi.13197', openAccess: false },
				],
			},
			{
				name: 'FamaFrench.jl',
				github: 'https://github.com/JuliaFinance/FamaFrench.jl',
				papers: [
					{ title: 'Risk, Return, and Equilibrium: Empirical Tests', authors: 'Fama & MacBeth', year: 1973, journal: 'Journal of Political Economy', doi: '10.1086/260061', openAccess: false },
				],
			},
		],
		notebooks: [
			{ name: 'BayesianFM Basics',          file: 'bfmb/tutorial-01-basics.ipynb',       bundled: true, description: 'Introduction to Bayesian Fama-MacBeth regression with BayesianFM()' },
			{ name: 'Prior Sensitivity',           file: 'bfmb/tutorial-02-priors.ipynb',       bundled: true, description: 'Effect of psi0 and d on posterior risk price estimates' },
			{ name: 'Model Comparison',            file: 'bfmb/tutorial-03-model-comparison.ipynb', bundled: true, description: 'Bayesian factor selection and model comparison across candidate factors' },
			{ name: 'Factor Zoo Application',      file: 'bfmb/tutorial-04-factor-zoo.ipynb',   bundled: true, description: 'Running two-quadrillion-model Bayesian factor selection on real data' },
			{ name: 'Classical FM Basics',         file: 'bfmb/tutorial-05-classical.ipynb',   bundled: true, description: 'Classical two-pass Fama-MacBeth regression with FamaFrench.jl' },
			{ name: 'Newey-West Standard Errors',  file: 'bfmb/tutorial-06-newey-west.ipynb',  bundled: true, description: 'HAC-robust inference for cross-sectional risk price estimates' },
		],
		wikis: [
			{ name: 'Overview',        file: 'bfmb/overview.md',        bundled: true },
			{ name: 'Factsheet',       file: 'bfmb/factsheet.md',       bundled: true },
			{ name: 'Assumptions',     file: 'bfmb/assumptions.md',     bundled: true },
			{ name: 'Diagnostics',     file: 'bfmb/diagnostics.md',     bundled: true },
			{ name: 'Interpretation',  file: 'bfmb/interpretation.md',  bundled: true },
			{ name: 'Decision Guide',  file: 'bfmb/decision-guide.md',  bundled: true },
		],
		tooltips: {
			f:          'T×K matrix of factor excess returns. Rows are time periods, columns are factors. Use monthly excess returns (in percent) for standard asset pricing.',
			R:          'T×N matrix of test asset excess returns. Rows are time periods, columns are portfolios (e.g. 25 Fama-French size/value portfolios).',
			psi0:       'Prior scale on risk prices λ. Larger values give a more diffuse (less informative) prior. Default 5.0 is calibrated for monthly excess returns in percent.',
			d:          'Prior weight on pricing errors (α). 0 = exact factor pricing imposed; 1 = diffuse prior on intercepts (default). Intermediate values shrink pricing errors toward zero.',
			intercept:  'true to allow non-zero pricing errors in the cross-sectional regression; false to impose that factors explain all expected returns exactly.',
			sim_length: 'Number of MCMC posterior draws retained after burnin. Increase to 50 000 or more for publication-quality inference.',
			burnin:     'Number of initial MCMC draws to discard as warmup. Should be at least 10–20 % of sim_length.',
			lags:       'Newey-West lags for HAC-consistent standard errors. Controls autocorrelation correction in cross-sectional risk price inference. Typical rule: floor(T^(1/3)); use 5 for monthly data.',
		},
	},
};

export function openBfmbWebview(
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
			title: BFMB_TITLE,
			options: { retainContextWhenHidden: true },
			contentOptions: { allowScripts: true },
			extension: undefined,
		},
		BFMB_VIEW_TYPE,
		BFMB_TITLE,
		undefined,
		{ group: undefined, preserveFocus: false }
	);

	webviewInput.webview.setHtml(getBfmbHtml());

	registerBfmbWebviewHandlers(
		webviewInput,
		BFMB_METADATA,
		openerService,
		editorService,
		quickInputService,
		commandService,
		clipboardService,
		notificationService,
	);
}
