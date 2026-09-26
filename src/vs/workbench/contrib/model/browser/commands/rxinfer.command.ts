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
import { IRxinferMetadata } from '../common/rxinfer.types.js';
import { IModelReference, IModelNotebookSection } from '../common/model.types.js';
import { registerRxinferWebviewHandlers } from '../handlers/rxinfer.handler.js';
import { getRxinferHtml } from '../webviews/rxinfer.template.js';

const RXINFER_VIEW_TYPE = 'pollis.rxinfer';
const RXINFER_TITLE = 'Fast Variational Bayesian Inference';

const RXINFER_REFERENCES: IModelReference[] = [
	{ separator: true, label: 'Software' },
	{
		title: 'Julia: A Fresh Approach to Numerical Computing',
		authors: 'Bezanson, Jeff; Edelman, Alan; Karpinski, Stefan; Shah, Viral B.',
		year: 2017,
		journal: 'SIAM Review',
		doi: '10.1137/141000671',
		openAccess: false,
	},
	{
		title: 'RxInfer: A Julia package for reactive real-time Bayesian inference',
		authors: 'Bagaev, Dmitry; de Vries, Bert',
		year: 2023,
		journal: 'Journal of Open Source Software',
		doi: '10.21105/joss.05161',
		openAccess: true,
	},
	{
		title: 'ReactiveMP.jl: A Julia package for reactive message passing-based Bayesian inference',
		authors: 'Bagaev, Dmitry; de Vries, Bert',
		year: 2023,
		journal: 'Software Impacts',
		doi: '10.1016/j.simpa.2023.100558',
		openAccess: true,
	},
	{ separator: true, label: 'Textbooks' },
	{
		title: 'Pattern Recognition and Machine Learning',
		authors: 'Bishop, Christopher M.',
		year: 2006,
		journal: 'Springer',
		url: 'https://www.springer.com/book/9780387310732',
		openAccess: false,
	},
	{
		title: 'Probabilistic Graphical Models: Principles and Techniques',
		authors: 'Koller, Daphne; Friedman, Nir',
		year: 2009,
		journal: 'MIT Press',
		url: 'https://mitpress.mit.edu/9780262013192/probabilistic-graphical-models/',
		openAccess: false,
	},
	{ separator: true, label: 'Original Papers' },
	{
		title: 'A Factor Graph Approach to Signal Modeling, System Identification and Filtering',
		authors: 'Loeliger, Hans-Andrea; Dauwels, Justin; Hu, Junli; Korl, Sascha; Ping, Li; Kschischang, Frank R.',
		year: 2007,
		journal: 'Proceedings of the IEEE',
		doi: '10.1109/JPROC.2007.906491',
		openAccess: false,
	},
	{
		title: 'Variational Inference: A Review for Statisticians',
		authors: 'Blei, David M.; Kucukelbir, Alp; McAuliffe, Jon D.',
		year: 2017,
		journal: 'Journal of the American Statistical Association',
		doi: '10.1080/01621459.2017.1285773',
		openAccess: false,
	},
	{
		title: 'Reactive Message Passing for Scalable Bayesian Inference',
		authors: 'Bagaev, Dmitry; de Vries, Bert',
		year: 2023,
		journal: 'Entropy',
		doi: '10.3390/e25040529',
		openAccess: true,
	},
];

export const RXINFER_NOTEBOOK_SECTIONS: IModelNotebookSection[] = [
	{
		label: 'Basic Examples',
		notebooks: [
			{ name: 'Binomial Regression', file: 'rxinfer/basic-01-binomial-regression.ipynb', bundled: true, description: 'Bayesian binomial regression using Expectation Propagation and Polya-Gamma augmentation' },
			{ name: 'Linear Regression (Extended)', file: 'rxinfer/basic-02-linear-regression.ipynb', bundled: true, description: 'Extensive tutorial on Bayesian linear regression including multivariate and hierarchical variants' },
			{ name: 'Multinomial Regression', file: 'rxinfer/basic-03-multinomial-regression.ipynb', bundled: true, description: 'Bayesian multinomial regression for categorical outcomes via EP and Polya-Gamma augmentation' },
			{ name: 'Bayesian Networks: Sprinkler', file: 'rxinfer/basic-04-bayesian-networks-sprinkler.ipynb', bundled: true, description: 'Classic sprinkler Bayesian network: belief propagation and evidence-based inference' },
			{ name: 'Coin Toss (Beta-Bernoulli)', file: 'rxinfer/basic-05-coin-toss-beta-bernoulli.ipynb', bundled: true, description: 'Bayesian inference in a conjugate Beta-Bernoulli model with IID observations' },
			{ name: 'Contextual Bandits', file: 'rxinfer/basic-06-contextual-bandits.ipynb', bundled: true, description: 'RxInfer applied to the contextual bandits exploration-exploitation problem' },
			{ name: 'Feature Functions in Regression', file: 'rxinfer/basic-07-feature-functions-regression.ipynb', bundled: true, description: 'Parametric Bayesian regression with basis functions; based on Probabilistic Numerics (Hennig et al.)' },
			{ name: 'Forgetting Factors', file: 'rxinfer/basic-08-forgetting-factors.ipynb', bundled: true, description: 'Online Bayesian inference with forgetting factors to track non-stationary processes' },
			{ name: 'Hidden Markov Model', file: 'rxinfer/basic-09-hidden-markov-model.ipynb', bundled: true, description: 'Structured variational inference in an HMM with unknown transition and observation matrices' },
			{ name: 'Incomplete Data', file: 'rxinfer/basic-10-incomplete-data.ipynb', bundled: true, description: 'Bayesian inference with missing observations using RxInfer' },
			{ name: 'Kalman Filtering and Smoothing', file: 'rxinfer/basic-11-kalman-filtering-smoothing.ipynb', bundled: true, description: 'Bayesian state estimation in linear, nonlinear, and missing-data state-space models' },
			{ name: 'POMDP Control', file: 'rxinfer/basic-12-pomdp-control.ipynb', bundled: true, description: 'Control in Partially Observable MDPs via reactive message passing and variational inference' },
			{ name: 'Bike Rental Demand', file: 'rxinfer/basic-13-bike-rental-demand.ipynb', bundled: true, description: 'Time-series forecasting with RxInfer using bike rental demand as a real-data example' },
			{ name: 'T-Maze Active Inference', file: 'rxinfer/basic-14-t-maze-active-inference.ipynb', bundled: true, description: 'Active inference on a T-maze task: planning via Expected Free Energy minimisation' },
		],
	},
	{
		label: 'Advanced Examples',
		notebooks: [
			{ name: 'Active Inference: Mountain Car', file: 'rxinfer/advanced-01-active-inference-mountain-car.ipynb', bundled: true, description: 'Active inference for the mountain car control problem using RxInfer' },
			{ name: 'Assessing Skills', file: 'rxinfer/advanced-02-assessing-skills.ipynb', bundled: true, description: 'Exact inference to assess student skills from test results; inspired by Bishop MBML Chapter 2' },
			{ name: 'Bayesian Structured Time Series', file: 'rxinfer/advanced-03-bayesian-structured-time-series.ipynb', bundled: true, description: 'Bayesian structured time series modelling with RxInfer' },
			{ name: 'Chance-Constrained Active Inference', file: 'rxinfer/advanced-04-chance-constrained-active-inference.ipynb', bundled: true, description: 'Reactive message passing for active inference under chance constraints' },
			{ name: 'CVI (Conjugate-Computational VMP)', file: 'rxinfer/advanced-05-cvi.ipynb', bundled: true, description: 'Non-conjugate message passing via local CVI approximation: extensive tutorial' },
			{ name: 'Drone Dynamics', file: 'rxinfer/advanced-06-drone-dynamics.ipynb', bundled: true, description: 'Automated inference to simulate drone dynamics with RxInfer' },
			{ name: 'EFE Minimization', file: 'rxinfer/advanced-07-efe-minimization.ipynb', bundled: true, description: 'Minimising Expected Free Energy inside the RxInfer message-passing framework' },
			{ name: 'GP Regression via SDE', file: 'rxinfer/advanced-08-gp-regression-sde.ipynb', bundled: true, description: 'Gaussian process regression via stochastic differential equations and sequential state-space inference' },
			{ name: 'Infinite Data Stream', file: 'rxinfer/advanced-09-infinite-data-stream.ipynb', bundled: true, description: 'RxInfer running inference over infinite time-series data streams' },
			{ name: 'Neural Networks with Flux.jl', file: 'rxinfer/advanced-10-neural-networks-flux.ipynb', bundled: true, description: 'Integrating neural networks into probabilistic models using RxInfer and Flux.jl' },
			{ name: 'Neural Networks with Lux.jl', file: 'rxinfer/advanced-11-neural-networks-lux.ipynb', bundled: true, description: 'Integrating neural networks into probabilistic models using RxInfer and Lux.jl' },
			{ name: 'Learning Dynamics with VAEs', file: 'rxinfer/advanced-12-learning-dynamics-vae.ipynb', bundled: true, description: 'Learning dynamics in latent space of a variational autoencoder with RxInfer' },
			{ name: 'Multi-agent Trajectory Planning', file: 'rxinfer/advanced-13-multi-agent-trajectory.ipynb', bundled: true, description: 'Planning collision-free multi-agent trajectories with probabilistic inference' },
			{ name: 'Nonlinear Sensor Fusion', file: 'rxinfer/advanced-14-nonlinear-sensor-fusion.ipynb', bundled: true, description: 'Nonlinear object position identification from a sparse set of sensors' },
			{ name: 'Parameter Optimisation with Optim.jl', file: 'rxinfer/advanced-15-parameter-optimisation-optim.ipynb', bundled: true, description: 'Parameter optimisation in probabilistic models using RxInfer and Optim.jl' },
			{ name: 'Robotic Arm Path Planning', file: 'rxinfer/advanced-16-robotic-arm.ipynb', bundled: true, description: 'Probabilistic path planning for a robotic arm via Bayesian inference with RxInfer' },
		],
	},
	{
		label: 'Problem Specific',
		notebooks: [
			{ name: 'Autoregressive Models', file: 'rxinfer/problem-01-autoregressive-models.ipynb', bundled: true, description: 'Bayesian treatment of latent AR and ARMA models (Podusenko et al. 2021)' },
			{ name: 'Gamma Mixture Model', file: 'rxinfer/problem-02-gamma-mixture-model.ipynb', bundled: true, description: 'Gamma mixture model inference via message passing (BIASlab)' },
			{ name: 'Gaussian Mixture', file: 'rxinfer/problem-03-gaussian-mixture.ipynb', bundled: true, description: 'Variational Bayesian inference in univariate and multivariate Gaussian mixtures with mean-field' },
			{ name: 'Hierarchical Gaussian Filter', file: 'rxinfer/problem-04-hierarchical-gaussian-filter.ipynb', bundled: true, description: 'Online VMP inference in a Hierarchical Gaussian Filter (Senoz et al. 2021)' },
			{ name: 'Invertible Neural Networks', file: 'rxinfer/problem-05-invertible-neural-networks.ipynb', bundled: true, description: 'Variational inference with invertible neural networks in factor graphs (van Erp)' },
			{ name: 'Ising Model', file: 'rxinfer/problem-06-ising-model.ipynb', bundled: true, description: 'Temperature estimation over a grid with binary observations using RxInfer' },
			{ name: 'Litter Model', file: 'rxinfer/problem-07-litter-model.ipynb', bundled: true, description: 'Estimating daily litter events from real data with Bayesian inference' },
			{ name: 'ODE Parameter Estimation', file: 'rxinfer/problem-08-ode-parameter-estimation.ipynb', bundled: true, description: 'Solving Lotka-Volterra ODE parameter estimation with RxInfer' },
			{ name: 'Probit Model (EP)', file: 'rxinfer/problem-09-probit-model-ep.ipynb', bundled: true, description: 'Expectation Propagation for state estimation in a linear SSM with discrete observations' },
			{ name: 'RTS vs BIFM Smoothing', file: 'rxinfer/problem-10-rts-vs-bifm-smoothing.ipynb', bundled: true, description: 'Comparing BIFM Kalman smoother with RTS implementation via message passing' },
			{ name: 'Simple Nonlinear Node', file: 'rxinfer/problem-11-simple-nonlinear-node.ipynb', bundled: true, description: 'Custom non-conjugate factor node with nonlinear link function and arbitrary message rules' },
			{ name: 'Structural Dynamics (AKF)', file: 'rxinfer/problem-12-structural-dynamics-akf.ipynb', bundled: true, description: 'State and unknown input estimation for structural dynamics via Augmented Kalman Filter' },
			{ name: 'Universal Mixtures', file: 'rxinfer/problem-13-universal-mixtures.ipynb', bundled: true, description: 'Universal mixture modelling with RxInfer' },
		],
	},
	{
		label: 'Experimental',
		notebooks: [
			{ name: 'Bayesian Trust Learning', file: 'rxinfer/experimental-01-bayesian-trust-learning.ipynb', bundled: true, description: 'Bayesian trust learning for LLM routing with hierarchical Bayesian models' },
			{ name: 'Large Language Models', file: 'rxinfer/experimental-02-large-language-models.ipynb', bundled: true, description: 'LLM integration with RxInfer for probabilistic reasoning' },
			{ name: 'Latent VAR Model', file: 'rxinfer/experimental-03-latent-var-autoregressive.ipynb', bundled: true, description: 'Latent Vector Autoregressive Model with recurrent switching dynamics' },
			{ name: 'Recurrent Switching LDS', file: 'rxinfer/experimental-04-recurrent-switching-lds.ipynb', bundled: true, description: 'Recurrent Switching Linear Dynamical System model' },
		],
	},
];

const RXINFER_METADATA: IRxinferMetadata = {
	rxinfer: {
		packages: [
			{
				name: 'RxInfer.jl',
				github: 'https://github.com/ReactiveBayes/RxInfer.jl',
				papers: [],
				videos: [
					{
						title: 'RxInfer.jl: Reactive Variational Bayesian Inference',
						description: 'JuliaCon 2023 talk introducing RxInfer and reactive message passing',
						url: 'https://www.youtube.com/watch?v=_vVHWzK9NEI',
					},
					{
						title: 'Probabilistic Programming with RxInfer.jl',
						description: 'Tutorial demonstrating factor graph models and VMP inference',
						url: 'https://www.youtube.com/watch?v=qXrvDVm_fnE',
					},
				],
			},
		],
		notebooks: RXINFER_NOTEBOOK_SECTIONS.flatMap(s => s.notebooks),
		notebookSections: RXINFER_NOTEBOOK_SECTIONS,
		wikis: [
			{ name: 'Factsheet', file: 'rxinfer/factsheet.md', bundled: true },
			{ name: 'Overview', file: 'rxinfer/overview.md', bundled: true },
			{ name: 'Assumptions', file: 'rxinfer/assumptions.md', bundled: true },
			{ name: 'Diagnostics', file: 'rxinfer/diagnostics.md', bundled: true },
			{ name: 'Interpretation', file: 'rxinfer/interpretation.md', bundled: true },
			{ name: 'Decision Guide', file: 'rxinfer/decision-guide.md', bundled: true },
			{ separator: true, label: 'Models' },
			{ name: 'Gaussian', file: 'rxinfer/gaussian.md', bundled: true },
			{ name: 'Linear Regression', file: 'rxinfer/linear-regression.md', bundled: true },
			{ name: 'Streaming', file: 'rxinfer/streaming.md', bundled: true },
		],
		references: RXINFER_REFERENCES,
	},
};

export function openRxinferWebview(
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
			title: RXINFER_TITLE,
			options: { retainContextWhenHidden: true },
			contentOptions: { allowScripts: true },
			extension: undefined,
		},
		RXINFER_VIEW_TYPE,
		RXINFER_TITLE,
		undefined,
		{ group: undefined, preserveFocus: false }
	);

	webviewInput.webview.setHtml(getRxinferHtml());

	registerRxinferWebviewHandlers(
		webviewInput,
		RXINFER_METADATA,
		openerService,
		editorService,
		quickInputService,
		commandService,
		clipboardService,
		notificationService,
		initialModel,
	);
}
