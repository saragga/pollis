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
import { IPplMetadata } from '../common/ppl.types.js';
import { IModelReference, IModelNotebookSection } from '../common/model.types.js';
import { registerPplWebviewHandlers } from '../handlers/ppl.handler.js';
import { getPplHtml } from '../webviews/ppl.template.js';

const PPL_VIEW_TYPE = 'pollis.ppl';
const PPL_TITLE = 'Sampling-Based Bayesian Inference';

const PPL_REFERENCES: IModelReference[] = [
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
		title: 'Turing: A Language for Flexible Probabilistic Inference',
		authors: 'Ge, Hong; Xu, Kai; Ghahramani, Zoubin',
		year: 2018,
		journal: 'AISTATS',
		url: 'http://proceedings.mlr.press/v84/ge18b.html',
		openAccess: true,
	},
	{ separator: true, label: 'Textbooks' },
	{
		title: 'Bayesian Data Analysis',
		authors: 'Gelman, Andrew; Carlin, John B.; Stern, Hal S.; Dunson, David B.; Vehtari, Aki; Rubin, Donald B.',
		year: 2013,
		journal: 'CRC Press (3rd ed.)',
		url: 'http://www.stat.columbia.edu/~gelman/book/',
		openAccess: false,
	},
	{
		title: 'Statistical Rethinking: A Bayesian Course with Examples in R and Stan',
		authors: 'McElreath, Richard',
		year: 2020,
		journal: 'CRC Press (2nd ed.)',
		url: 'https://xcelab.net/rm/statistical-rethinking/',
		openAccess: false,
	},
	{ separator: true, label: 'Original Papers' },
	{
		title: 'The No-U-Turn Sampler: Adaptively Setting Path Lengths in Hamiltonian Monte Carlo',
		authors: 'Hoffman, Matthew D.; Gelman, Andrew',
		year: 2014,
		journal: 'Journal of Machine Learning Research',
		url: 'https://jmlr.org/papers/v15/hoffman14a.html',
		openAccess: true,
	},
	{
		title: 'Hybrid Monte Carlo',
		authors: 'Duane, Simon; Kennedy, Anthony D.; Pendleton, Brian J.; Roweth, Duncan',
		year: 1987,
		journal: 'Physics Letters B',
		doi: '10.1016/0370-2693(87)91197-X',
		openAccess: false,
	},
	{
		title: 'Equation of State Calculations by Fast Computing Machines',
		authors: 'Metropolis, Nicholas; Rosenbluth, Arianna W.; Rosenbluth, Marshall N.; Teller, Augusta H.; Teller, Edward',
		year: 1953,
		journal: 'Journal of Chemical Physics',
		doi: '10.1063/1.1699114',
		openAccess: false,
	},
];

export const PPL_NOTEBOOK_SECTIONS: IModelNotebookSection[] = [
	{
		label: 'Getting Started',
		notebooks: [
			{ name: 'Coin Flipping', file: 'turing/turing-coin-flipping.ipynb', bundled: true, description: 'Hello-world Bayesian inference: estimate coin bias with a Beta-Bernoulli model and NUTS' },
		],
	},
	{
		label: 'Regression',
		notebooks: [
			{ name: 'Linear Regression',       file: 'turing/turing-linear-regression.ipynb',      bundled: true, description: 'Bayesian linear regression: posterior inference on intercept and slope with credible intervals' },
			{ name: 'Logistic Regression',      file: 'turing/turing-logistic-regression.ipynb',    bundled: true, description: 'Bayesian logistic regression for binary outcomes with NUTS sampling' },
			{ name: 'Poisson Regression',       file: 'turing/turing-poisson-regression.ipynb',     bundled: true, description: 'Bayesian Poisson regression for count data with log-link and weakly informative priors' },
			{ name: 'Multinomial Regression',   file: 'turing/turing-multinomial-regression.ipynb', bundled: true, description: 'Multinomial logistic regression for multi-class outcomes with softmax link' },
		],
	},
	{
		label: 'Latent Variable Models',
		notebooks: [
			{ name: 'Gaussian Mixtures',   file: 'turing/turing-gaussian-mixtures.ipynb',  bundled: true, description: 'Bayesian Gaussian mixture model with Dirichlet prior on mixing weights' },
			{ name: 'Infinite Mixtures',   file: 'turing/turing-infinite-mixtures.ipynb',  bundled: true, description: 'Dirichlet process mixture model: non-parametric Bayesian clustering' },
			{ name: 'Probabilistic PCA',   file: 'turing/turing-probabilistic-pca.ipynb',  bundled: true, description: 'Probabilistic PCA: Bayesian dimensionality reduction with latent Gaussian factors' },
		],
	},
	{
		label: 'Sequential Models',
		notebooks: [
			{ name: 'Hidden Markov Models',    file: 'turing/turing-hmm.ipynb',         bundled: true, description: 'Bayesian HMM: forward-backward inference and posterior decoding of hidden states' },
			{ name: 'Time-Series Analysis',    file: 'turing/turing-time-series.ipynb', bundled: true, description: 'Bayesian AR models with posterior inference on autoregressive coefficients' },
		],
	},
	{
		label: 'Gaussian Processes',
		notebooks: [
			{ name: 'GP Introduction',  file: 'turing/turing-gaussian-processes.ipynb', bundled: true, description: 'Gaussian process regression with Turing: posterior mean and credible bands' },
			{ name: 'GP Latent Variable Models', file: 'turing/turing-gplvm.ipynb',    bundled: true, description: 'Gaussian process latent variable model for non-linear dimensionality reduction' },
		],
	},
	{
		label: 'Advanced',
		notebooks: [
			{ name: 'Bayesian Neural Networks',      file: 'turing/turing-neural-networks.ipynb',       bundled: true, description: 'BNNs via NUTS: posterior over network weights for uncertainty-aware predictions' },
			{ name: 'Bayesian Differential Equations', file: 'turing/turing-differential-equations.ipynb', bundled: true, description: 'Bayesian ODE parameter estimation: combine SciML solvers with Turing posteriors' },
			{ name: 'Variational Inference',         file: 'turing/turing-variational-inference.ipynb',  bundled: true, description: 'ADVI with Turing: fast approximate posteriors using automatic differentiation' },
		],
	},
];

const PPL_METADATA: IPplMetadata = {
	ppl: {
		packages: [
			{
				name: 'Turing.jl',
				github: 'https://github.com/TuringLang/Turing.jl',
				papers: [],
			},
		],
		notebookSections: PPL_NOTEBOOK_SECTIONS,
		notebooks: PPL_NOTEBOOK_SECTIONS.flatMap(s => s.notebooks),
		wikis: [
			{ name: 'Factsheet',      file: 'ppl/factsheet.md',      bundled: true },
			{ name: 'Overview',       file: 'ppl/overview.md',        bundled: true },
			{ name: 'Assumptions',    file: 'ppl/assumptions.md',     bundled: true },
			{ name: 'Diagnostics',    file: 'ppl/diagnostics.md',     bundled: true },
			{ name: 'Interpretation', file: 'ppl/interpretation.md',  bundled: true },
			{ name: 'Decision Guide', file: 'ppl/decision-guide.md',  bundled: true },
		],
		references: PPL_REFERENCES,
	},
};

export function openPplWebview(
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
			title: PPL_TITLE,
			options: { retainContextWhenHidden: true },
			contentOptions: { allowScripts: true },
			extension: undefined,
		},
		PPL_VIEW_TYPE,
		PPL_TITLE,
		undefined,
		{ group: undefined, preserveFocus: false }
	);

	webviewInput.webview.setHtml(getPplHtml());

	registerPplWebviewHandlers(
		webviewInput,
		PPL_METADATA,
		openerService,
		editorService,
		quickInputService,
		commandService,
		clipboardService,
		notificationService,
	);
}
