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
import { IModelReference, IModelNotebookSection } from '../common/model.types.js';
import { IBoptMetadata } from '../common/bopt.types.js';
import { registerBoptWebviewHandlers } from '../handlers/bopt.handler.js';
import { getBoptHtml } from '../webviews/bopt.template.js';

const BOPT_VIEW_TYPE = 'pollis.bopt';
const BOPT_TITLE = 'Bayesian Optimisation';

const BOPT_REFERENCES: IModelReference[] = [
	{ separator: true, label: 'Software' },
	{
		title: 'Julia: A Fresh Approach to Numerical Computing',
		authors: 'Bezanson, Jeff; Edelman, Alan; Karpinski, Stefan; Shah, Viral B.',
		year: 2017,
		journal: 'SIAM Review',
		doi: '10.1137/141000671',
		openAccess: false,
	},
	{ separator: true, label: 'Textbooks' },
	{
		title: 'Bayesian Optimization',
		authors: 'Garnett, Roman',
		year: 2023,
		journal: 'Cambridge University Press',
		url: 'https://bayesoptbook.com',
		openAccess: true,
	},
	{
		title: 'Gaussian Processes for Machine Learning',
		authors: 'Rasmussen, Carl Edward; Williams, Christopher K.I.',
		year: 2006,
		journal: 'MIT Press',
		url: 'https://gaussianprocess.org/gpml/',
		openAccess: true,
	},
	{ separator: true, label: 'Original Papers' },
	{
		title: 'Efficient Global Optimization of Expensive Black-Box Functions',
		authors: 'Jones, Donald R.; Schonlau, Matthias; Welch, William J.',
		year: 1998,
		journal: 'Journal of Global Optimization',
		doi: '10.1023/A:1008306431147',
		openAccess: false,
	},
	{
		title: 'Gaussian Process Optimization in the Bandit Setting: No Regret and Experimental Design',
		authors: 'Srinivas, Niranjan; Krause, Andreas; Kakade, Sham M.; Seeger, Matthias W.',
		year: 2010,
		journal: 'International Conference on Machine Learning (ICML)',
		url: 'https://arxiv.org/abs/0912.3995',
		openAccess: true,
	},
	{
		title: 'Practical Bayesian Optimization of Machine Learning Algorithms',
		authors: 'Snoek, Jasper; Larochelle, Hugo; Adams, Ryan P.',
		year: 2012,
		journal: 'Advances in Neural Information Processing Systems (NeurIPS)',
		url: 'https://arxiv.org/abs/1206.2944',
		openAccess: true,
	},
	{
		title: 'Taking the Human Out of the Loop: A Review of Bayesian Optimization',
		authors: 'Shahriari, Bobak; Swersky, Kevin; Wang, Ziyu; Adams, Ryan P.; de Freitas, Nando',
		year: 2016,
		journal: 'Proceedings of the IEEE',
		doi: '10.1109/JPROC.2015.2494218',
		openAccess: false,
	},
];

export const BOPT_NOTEBOOK_SECTIONS: IModelNotebookSection[] = [
	{
		label: '',
		notebooks: [
			{
				name: 'Expected Improvement',
				file: 'bopt/tutorial-01-ei.ipynb',
				bundled: true,
				description: 'Expected improvement: probability-weighted gain over the current best balances exploration and exploitation',
			},
			{
				name: 'Probability of Improvement',
				file: 'bopt/tutorial-02-pi.ipynb',
				bundled: true,
				description: 'Probability of improvement: maximises the chance of any improvement; exploitation-heavy acquisition',
			},
			{
				name: 'Upper Confidence Bound',
				file: 'bopt/tutorial-03-ucb.ipynb',
				bundled: true,
				description: 'Upper confidence bound: drives exploration via GP uncertainty scaled by a tunable beta parameter',
			},
			{
				name: 'Thompson Sampling',
				file: 'bopt/tutorial-04-ts.ipynb',
				bundled: true,
				description: 'Thompson sampling: optimises a random draw from the GP posterior for diverse exploration',
			},
		],
	},
];

const BOPT_METADATA: IBoptMetadata = {
	bopt: {
		packages: [
			{
				name: 'BayesianOptimization.jl',
				github: 'https://github.com/jbrea/BayesianOptimization.jl',
				papers: [],
			},
			{
				name: 'GaussianProcesses.jl',
				github: 'https://github.com/STOR-i/GaussianProcesses.jl',
				papers: [],
			},
		],
		notebookSections: BOPT_NOTEBOOK_SECTIONS,
		notebooks: BOPT_NOTEBOOK_SECTIONS.flatMap(s => s.notebooks),
		wikis: [
			{ name: 'Factsheet',      file: 'bopt/factsheet.md',      bundled: true },
			{ name: 'Overview',       file: 'bopt/overview.md',        bundled: true },
			{ name: 'Assumptions',    file: 'bopt/assumptions.md',     bundled: true },
			{ name: 'Diagnostics',    file: 'bopt/diagnostics.md',     bundled: true },
			{ name: 'Interpretation', file: 'bopt/interpretation.md',  bundled: true },
			{ name: 'Decision Guide', file: 'bopt/decision-guide.md',  bundled: true },
			{ separator: true, label: 'Acquisition Functions' },
			{ name: 'Expected Improvement',    file: 'bopt/ei.md',  bundled: true },
			{ name: 'Probability of Improvement', file: 'bopt/pi.md',  bundled: true },
			{ name: 'Upper Confidence Bound',  file: 'bopt/ucb.md', bundled: true },
			{ name: 'Thompson Sampling',       file: 'bopt/ts.md',  bundled: true },
		],
		references: BOPT_REFERENCES,
	},
};

export function openBoptWebview(
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
			title: BOPT_TITLE,
			options: { retainContextWhenHidden: true },
			contentOptions: { allowScripts: true },
			extension: undefined,
		},
		BOPT_VIEW_TYPE,
		BOPT_TITLE,
		undefined,
		{ group: undefined, preserveFocus: false }
	);

	webviewInput.webview.setHtml(getBoptHtml());

	registerBoptWebviewHandlers(
		webviewInput,
		BOPT_METADATA,
		openerService,
		editorService,
		quickInputService,
		commandService,
		clipboardService,
		notificationService,
		initialModel,
	);
}
