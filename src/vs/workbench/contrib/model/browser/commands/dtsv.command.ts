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
import { IDtsvMetadata } from '../common/dtsv.types.js';
import { registerDtsvWebviewHandlers } from '../handlers/dtsv.handler.js';
import { getDtsvHtml } from '../webviews/dtsv.template.js';

const DTSV_VIEW_TYPE = 'pollis.dtsv';
const DTSV_TITLE = 'Discrete-Time Stochastic Volatility Models';

const DTSV_METADATA: IDtsvMetadata = {
	dtsv: {
		packages: [
			{
				name: 'MacroEconometricModels.jl',
				github: 'https://github.com/FriedmanJP/MacroEconometricModels.jl',
				papers: [
					{
						title: 'Stochastic volatility: Likelihood inference and comparison with ARCH models',
						authors: 'Kim, S., Shephard, N., & Chib, S.',
						year: 1998,
						url: 'https://doi.org/10.1111/1467-937X.00050',
						openAccess: false,
					},
					{
						title: 'Financial returns modelled by the product of two stochastic processes — a study of daily sugar prices 1961–79',
						authors: 'Taylor, S. J.',
						year: 1982,
						url: 'https://doi.org/10.1007/978-94-015-7819-6_9',
						openAccess: false,
					},
					{
						title: 'Bayesian analysis of stochastic volatility models',
						authors: 'Jacquier, E., Polson, N. G., & Rossi, P. E.',
						year: 1994,
						url: 'https://doi.org/10.1080/01621459.1994.10476873',
						openAccess: false,
					},
					{
						title: 'Stochastic volatility with leverage: Fast and efficient likelihood inference',
						authors: 'Yu, J.',
						year: 2005,
						url: 'https://doi.org/10.1016/j.jeconom.2004.09.014',
						openAccess: false,
					},
				],
			},
		],
		notebooks: [
			{ name: 'Quick Start',   file: 'dtsv/tutorial-01-quickstart.ipynb', bundled: true, description: 'Fit a basic stochastic volatility model to financial returns' },
			{ name: 'Basic SV',      file: 'dtsv/tutorial-02-basic.ipynb',      bundled: true, description: 'KSC Gibbs sampler: posterior inference for the baseline SV model' },
			{ name: 'Leverage SV',   file: 'dtsv/tutorial-03-leverage.ipynb',   bundled: true, description: 'Leverage SV: correlated return and volatility innovations' },
			{ name: 'Student-t SV',  file: 'dtsv/tutorial-04-student.ipynb',    bundled: true, description: 'Heavy-tailed SV: Student-t observation equation with estimated degrees of freedom' },
			{ name: 'Diagnostics',   file: 'dtsv/tutorial-05-diagnostics.ipynb', bundled: true, description: 'MCMC convergence checks and latent volatility path extraction' },
		],
		wikis: [
			{ name: 'Overview',       file: 'dtsv/overview.md',       bundled: true },
			{ name: 'Factsheet',      file: 'dtsv/factsheet.md',      bundled: true },
			{ name: 'Assumptions',    file: 'dtsv/assumptions.md',    bundled: true },
			{ name: 'Diagnostics',    file: 'dtsv/diagnostics.md',    bundled: true },
			{ name: 'Interpretation', file: 'dtsv/interpretation.md', bundled: true },
			{ name: 'Decision Guide', file: 'dtsv/decision-guide.md', bundled: true },
		],
		tooltips: {
			y:        'A vector of asset returns or log-returns y (T&#215;1). Pass a Julia Vector{Float64} &#8212; typically demeaned before fitting.',
			n_draws:  'Number of MCMC draws retained after burn-in. Minimum 5000 recommended; 10000 is standard for stable posterior estimates.',
			burnin:   'Number of initial MCMC iterations discarded to allow the chain to converge before drawing posterior samples.',
			nu_shape: 'Shape hyperparameter of the Gamma prior on degrees of freedom &#957;. Controls the centre of the prior distribution over tail heaviness.',
			nu_rate:  'Rate hyperparameter of the Gamma prior on degrees of freedom &#957;. A small value (e.g., 0.2) is weakly informative &#8212; allows the data to determine tail weight.',
		},
	},
};

export function openDtsvWebview(
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
			title: DTSV_TITLE,
			options: { retainContextWhenHidden: true },
			contentOptions: { allowScripts: true },
			extension: undefined,
		},
		DTSV_VIEW_TYPE,
		DTSV_TITLE,
		undefined,
		{ group: undefined, preserveFocus: false }
	);

	webviewInput.webview.setHtml(getDtsvHtml());

	registerDtsvWebviewHandlers(
		webviewInput,
		DTSV_METADATA,
		openerService,
		editorService,
		quickInputService,
		commandService,
		clipboardService,
		notificationService,
	);
}
