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
import { ICtsvMetadata } from '../common/ctsv.types.js';
import { registerCtsvWebviewHandlers } from '../handlers/ctsv.handler.js';
import { getCtsvHtml } from '../webviews/ctsv.template.js';

const CTSV_VIEW_TYPE = 'pollis.ctsv';
const CTSV_TITLE = 'Continuous-Time Stochastic Volatility';

const CTSV_METADATA: ICtsvMetadata = {
	ctsv: {
		packages: [
			{ name: 'DiffEqFinancial.jl', github: 'https://github.com/SciML/DiffEqFinancial.jl', papers: [] }, // Heston
			{ name: 'QuantLib.jl',        github: 'https://github.com/pazzo83/QuantLib.jl',       papers: [] }, // Bates
		],
		notebooks: [
			{ name: 'Heston Model',               file: 'ctsv/tutorial-01-heston.ipynb',       bundled: true, description: 'Simulating asset paths under the Heston stochastic volatility model' },
			{ name: 'Bates Model',                file: 'ctsv/tutorial-02-bates.ipynb',        bundled: true, description: 'Stochastic volatility with jumps using the Bates model' },
			{ name: 'Implied Volatility Surface', file: 'ctsv/tutorial-03-implied-vol.ipynb',  bundled: true, description: 'Constructing and visualising implied volatility surfaces' },
			{ name: 'Model Calibration',          file: 'ctsv/tutorial-04-calibration.ipynb',  bundled: true, description: 'Calibrating Heston and Bates parameters to market option prices' },
		],
		wikis: [
			{ name: 'Overview',                                     file: 'ctsv/overview.md',                          bundled: true },
			{ name: 'Factsheet',                                    file: 'ctsv/factsheet.md',                         bundled: true },
			{ name: 'Assumptions',                                  file: 'ctsv/assumptions.md',                       bundled: true },
			{ name: 'Diagnostics',                                  file: 'ctsv/diagnostics.md',                       bundled: true },
			{ name: 'Interpretation',                               file: 'ctsv/interpretation.md',                    bundled: true },
			{ name: 'Decision Guide',                               file: 'ctsv/decision-guide.md',                    bundled: true },
			{ name: 'Comparison of Time-Varying Volatility Models', file: 'tvm/Time-VaryingVolatilityModels.md',       bundled: true },
		],
		tooltips: {
			kappa:   'Mean-reversion speed of variance — controls how quickly v_t reverts to θ. Higher κ means faster reversion. Default 2.',
			theta:   'Long-run mean of variance. As t → ∞, E[v_t] → θ. Set θ = σ̄² for the target long-run volatility σ̄. Default 0.04 (≈ 20% vol).',
			xi:      'Vol-of-vol — volatility of the variance process. Higher ξ increases the curvature of the implied volatility smile. Default 0.5.',
			rho:     'Correlation between the asset and variance Brownian motions. Negative ρ captures the leverage effect (volatility rises when price falls). Default −0.7.',
			mu:      'Risk-neutral drift of the asset price. Set to the risk-free rate minus the continuous dividend yield for pricing. Default 0.05.',
			S0:      'Initial asset price. Default 100.',
			v0:      'Initial variance (not volatility). Initial instantaneous volatility is σ₀ = √v₀. Default 0.04 (≈ 20% vol).',
			T:       'Simulation horizon in years. Default 1.',
			lambda:  'Jump intensity — expected number of jumps per year (Poisson arrival rate λ). Default 0.5.',
			muJ:     'Mean log-jump size. The expected relative jump size is μ̄_J = exp(μ_J + δ²_J / 2) − 1. Default −0.1.',
			sigmaJ:  'Standard deviation of log-jump size. Controls the dispersion of individual jump magnitudes. Default 0.2.',
			alpha:   'Initial stochastic volatility in the SABR model. Default 0.4.',
			beta:    'CEV exponent — controls the relationship between forward price and local volatility. β = 0: normal model, β = 1: log-normal. Default 0.5.',
			F0:      'Initial forward price. Default 100.',
		},
	},
};

export function openCtsvWebview(
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
			title: CTSV_TITLE,
			options: { retainContextWhenHidden: true },
			contentOptions: { allowScripts: true },
			extension: undefined,
		},
		CTSV_VIEW_TYPE,
		CTSV_TITLE,
		undefined,
		{ group: undefined, preserveFocus: false }
	);

	webviewInput.webview.setHtml(getCtsvHtml());

	registerCtsvWebviewHandlers(
		webviewInput,
		CTSV_METADATA,
		openerService,
		editorService,
		quickInputService,
		commandService,
		clipboardService,
		notificationService,
		initialModel,
	);
}
