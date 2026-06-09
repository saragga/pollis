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
import { IDsgeMetadata } from '../common/dsge.types.js';
import { registerDsgeWebviewHandlers } from '../handlers/dsge.handler.js';
import { getDsgeHtml } from '../webviews/dsge.template.js';

const DSGE_VIEW_TYPE = 'pollis.dsge';
const DSGE_TITLE = 'Dynamic Stochastic General Equilibrium (DSGE)';

const DSGE_METADATA: IDsgeMetadata = {
	dsge: {
		packages: [
			{
				name: 'MacroModelling.jl',
				github: 'https://github.com/thorek1/MacroModelling.jl',
				papers: [
					{
						title: 'Bayesian Estimation of DSGE Models',
						authors: 'Herbst, E. P., & Schorfheide, F.',
						year: 2015,
						url: 'https://doi.org/10.1515/9781400873082',
						openAccess: false,
					},
					{
						title: 'Solving dynamic general equilibrium models using a second-order approximation to the policy function',
						authors: 'Schmitt-Grohé, S., & Uribe, M.',
						year: 2004,
						url: 'https://doi.org/10.1016/S0165-1889(03)00043-5',
						openAccess: false,
					},
					{
						title: 'Shocks and frictions in US business cycles: A Bayesian DSGE approach',
						authors: 'Smets, F., & Wouters, R.',
						year: 2007,
						url: 'https://doi.org/10.1257/aer.97.3.586',
						openAccess: false,
					},
					{
						title: 'The pruned state-space system for non-linear DSGE models: Theory and empirical applications',
						authors: 'Andreasen, M. M., Fernández-Villaverde, J., & Rubio-Ramírez, J. F.',
						year: 2018,
						url: 'https://doi.org/10.1093/restud/rdx037',
						openAccess: false,
					},
				],
			},
			{
				name: 'Dynare.jl',
				github: 'https://github.com/DynareJulia/Dynare.jl',
				papers: [
					{
						title: 'Dynare: Reference Manual',
						authors: 'Adjemian, S., Bastani, H., Juillard, M., Mihoubi, F., Perendia, G., Ratto, M., & Villemot, S.',
						year: 2011,
						url: 'https://www.dynare.org/wp-repo/dynarewp001.pdf',
						openAccess: true,
					},
					{
						title: 'Perturbation methods for Markov-switching DSGE models',
						authors: 'Foerster, A., Rubio-Ram\u00edrez, J. F., Waggoner, D. F., & Zha, T.',
						year: 2016,
						url: 'https://doi.org/10.3982/QE432',
						openAccess: false,
					},
				],
			},
			{
				name: 'DSGE.jl',
				github: 'https://github.com/FRBNY-DSGE/DSGE.jl',
				papers: [
					{
						title: 'Inflation in the Great Recession and New Keynesian Models',
						authors: 'Del Negro, M., Giannoni, M. P., & Schorfheide, F.',
						year: 2015,
						url: 'https://doi.org/10.1257/mac.20140097',
						openAccess: false,
					},
					{
						title: 'DSGE Model-Based Forecasting',
						authors: 'Del Negro, M., & Schorfheide, F.',
						year: 2013,
						url: 'https://doi.org/10.1016/B978-0-444-53683-9.00002-5',
						openAccess: false,
					},
				],
			},
			{
				name: 'SolveDSGE.jl',
				github: 'https://github.com/RJDennis/SolveDSGE.jl',
				papers: [
					{
						title: 'Using the generalised Schur form to solve a multivariate linear rational expectations model',
						authors: 'Klein, P.',
						year: 2000,
						url: 'https://doi.org/10.1016/S0165-1889(99)00045-7',
						openAccess: false,
					},
					{
						title: 'Solving rational expectations models at first order: what Dynare does',
						authors: 'Villemot, S.',
						year: 2011,
						url: 'https://www.dynare.org/wp-repo/dynarewp002.pdf',
						openAccess: true,
					},
				],
			},
			{
				name: 'StateSpaceEcon.jl',
				github: 'https://github.com/bankofcanada/StateSpaceEcon.jl',
				papers: [
					{
						title: 'ToTEM II: An Updated Version of the Bank of Canada\'s Quarterly Projection Model',
						authors: 'Dorich, J., Johnston, M. K., Mendes, R. R., Murchison, S., & Zhang, Y.',
						year: 2013,
						url: 'https://www.bankofcanada.ca/2013/10/technical-report-100/',
						openAccess: true,
					},
				],
			},
		],
		notebooks: [
			{ name: 'Quick Start',              file: 'dsge/tutorial-01-quickstart.ipynb',    bundled: true, description: 'Define an RBC model and compute impulse responses' },
			{ name: 'Impulse Responses',        file: 'dsge/tutorial-02-irfs.ipynb',          bundled: true, description: 'Compute and plot IRFs using perturbation solutions to various orders' },
			{ name: 'Bayesian Estimation',      file: 'dsge/tutorial-03-estimation.ipynb',    bundled: true, description: 'Estimate a DSGE model on data using NUTS or HMC' },
			{ name: 'Moments & Calibration',    file: 'dsge/tutorial-04-moments.ipynb',       bundled: true, description: 'Match model moments and calibrate against steady state' },
			{ name: 'Higher-Order Solutions',   file: 'dsge/tutorial-05-higher-order.ipynb',  bundled: true, description: 'Pruned 2nd and 3rd order solutions and nonlinear estimation' },
			{ name: 'Variance Decomposition',   file: 'dsge/tutorial-06-variance.ipynb',      bundled: true, description: 'Forecast error variance decomposition and historical decomposition' },
		],
		wikis: [
			{ name: 'Overview',       file: 'dsge/overview.md',       bundled: true },
			{ name: 'Factsheet',      file: 'dsge/factsheet.md',      bundled: true },
			{ name: 'Assumptions',    file: 'dsge/assumptions.md',    bundled: true },
			{ name: 'Diagnostics',    file: 'dsge/diagnostics.md',    bundled: true },
			{ name: 'Interpretation', file: 'dsge/interpretation.md', bundled: true },
			{ name: 'Decision Guide', file: 'dsge/decision-guide.md', bundled: true },
		],
		tooltips: {
			model:   'Name of the MacroModelling.jl model object defined via the @model macro (e.g. RBC, SW07).',
			shock:   'Shock variable name for impulse response computation. Omit the leading colon &#8212; it is added automatically.',
			periods: 'Number of periods for the impulse response function. Typically 20&#8211;60 periods depending on data frequency.',
			data:    'Julia variable name of the data matrix used for estimation (T &#215; n_observables). Columns correspond to observable variables.',
			sampler: 'Gradient-based MCMC sampler: NUTS (No-U-Turn Sampler, recommended) or HMC (Hamiltonian Monte Carlo). Omit parentheses.',
			n_draws: 'Number of posterior draws retained after burn-in. Minimum 500; 1000&#8211;2000 is standard for stable estimates.',
			burnin:  'Number of initial MCMC draws discarded to allow the chain to reach the posterior before collecting samples.',
			order:   'Perturbation order for moment computation: 1 (linear), 2 (quadratic), or 3 (cubic). Higher orders capture nonlinear dynamics.',
		},
	},
};

export function openDsgeWebview(
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
			title: DSGE_TITLE,
			options: { retainContextWhenHidden: true },
			contentOptions: { allowScripts: true },
			extension: undefined,
		},
		DSGE_VIEW_TYPE,
		DSGE_TITLE,
		undefined,
		{ group: undefined, preserveFocus: false }
	);

	webviewInput.webview.setHtml(getDsgeHtml());

	registerDsgeWebviewHandlers(
		webviewInput,
		DSGE_METADATA,
		openerService,
		editorService,
		quickInputService,
		commandService,
		clipboardService,
		notificationService,
	);
}
