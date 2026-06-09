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
import { IFomMetadata } from '../common/fom.types.js';
import { IModelReference, IModelNotebookSection } from '../common/model.types.js';
import { registerFomWebviewHandlers } from '../handlers/fom.handler.js';
import { getFomHtml } from '../webviews/fom.template.js';

const FOM_VIEW_TYPE = 'pollis.fom';
const FOM_TITLE = 'First-Order Methods';

const FOM_REFERENCES: IModelReference[] = [
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
		title: 'Optim: A mathematical optimization package for Julia',
		authors: 'Mogensen, Patrick Kofod; Riseth, Asbjorn Nilsen',
		year: 2018,
		journal: 'Journal of Open Source Software',
		doi: '10.21105/joss.00615',
		openAccess: true,
	},
	{ separator: true, label: 'Textbooks' },
	{
		title: 'Numerical Optimization',
		authors: 'Nocedal, Jorge; Wright, Stephen J.',
		year: 2006,
		journal: 'Springer (2nd ed.)',
		doi: '10.1007/978-0-387-40065-5',
		openAccess: false,
	},
	{ separator: true, label: 'Original Papers' },
	{
		title: 'Function minimisation by conjugate gradients',
		authors: 'Fletcher, R.; Reeves, C. M.',
		year: 1964,
		journal: 'The Computer Journal',
		doi: '10.1093/comjnl/7.2.149',
		openAccess: false,
	},
	{
		title: 'Adam: A Method for Stochastic Optimization',
		authors: 'Kingma, Diederik P.; Ba, Jimmy Lei',
		year: 2015,
		journal: 'International Conference on Learning Representations',
		doi: '10.48550/arXiv.1412.6980',
		openAccess: true,
	},
	{
		title: 'Some methods of speeding up the convergence of iteration methods',
		authors: 'Polyak, Boris T.',
		year: 1964,
		journal: 'USSR Computational Mathematics and Mathematical Physics',
		doi: '10.1016/0041-5553(64)90137-5',
		openAccess: false,
	},
	{
		title: 'A method of solving a convex programming problem with convergence rate O(1/k^2)',
		authors: 'Nesterov, Yurii',
		year: 1983,
		journal: 'Soviet Mathematics Doklady',
		openAccess: false,
	},
	{
		title: 'Lecture 6.5 - RMSProp: Divide the gradient by a running average of its recent magnitude',
		authors: 'Hinton, Geoffrey',
		year: 2012,
		journal: 'COURSERA: Neural Networks for Machine Learning (unpublished)',
		url: 'https://www.cs.toronto.edu/~tijmen/csc321/slides/lecture_slides_lec6.pdf',
		openAccess: true,
	},
	{
		title: 'Decoupled Weight Decay Regularization',
		authors: 'Loshchilov, Ilya; Hutter, Frank',
		year: 2019,
		journal: 'International Conference on Learning Representations',
		doi: '10.48550/arXiv.1711.05101',
		openAccess: true,
	},
];

export const FOM_NOTEBOOK_SECTIONS: IModelNotebookSection[] = [
	{
		label: '',
		notebooks: [
			{
				name: 'SGD',
				file: 'fom/tutorial-01-sgd.ipynb',
				bundled: true,
				description: 'Stochastic gradient descent with Optimisers.jl: setup, training loop, and learning rate scheduling',
			},
			{
				name: 'Adam and AdaMax',
				file: 'fom/tutorial-02-adam-adamax.ipynb',
				bundled: true,
				description: 'Adam and AdaMax optimizers with adaptive moment estimates using Optimisers.jl',
			},
			{
				name: 'AdaGrad',
				file: 'fom/tutorial-03-adagrad.ipynb',
				bundled: true,
				description: 'AdaGrad for sparse features: accumulated squared gradient scaling with Optimisers.jl',
			},
		],
	},
	{
		label: 'Momentum and Adaptive',
		notebooks: [
			{
				name: 'Momentum and Nesterov',
				file: 'fom/tutorial-04-momentum-nesterov.ipynb',
				bundled: true,
				description: 'Momentum SGD and Nesterov look-ahead gradient via Optimization.jl + OptimizationOptimisers.jl',
			},
			{
				name: 'RMSProp and AdamW',
				file: 'fom/tutorial-05-rmsprop-adamw.ipynb',
				bundled: true,
				description: 'RMSProp and AdamW with decoupled weight decay via Optimization.jl + OptimizationOptimisers.jl',
			},
			{
				name: 'Benchmarking All Methods',
				file: 'fom/tutorial-06-benchmark.ipynb',
				bundled: true,
				description: 'Compare all 8 first-order methods on benchmark objectives',
			},
		],
	},
];

const FOM_METADATA: IFomMetadata = {
	fom: {
		packages: [
			{
				name: 'Optimisers.jl',
				github: 'https://github.com/FluxML/Optimisers.jl',
				papers: [],
			},
			{
				name: 'Optimization.jl',
				github: 'https://github.com/SciML/Optimization.jl',
				papers: [],
			},
		],
		notebookSections: FOM_NOTEBOOK_SECTIONS,
		notebooks: FOM_NOTEBOOK_SECTIONS.flatMap(s => s.notebooks),
		wikis: [
			{ name: 'Factsheet',      file: 'fom/factsheet.md',      bundled: true },
			{ name: 'Overview',       file: 'fom/overview.md',        bundled: true },
			{ name: 'Assumptions',    file: 'fom/assumptions.md',     bundled: true },
			{ name: 'Diagnostics',    file: 'fom/diagnostics.md',     bundled: true },
			{ name: 'Interpretation', file: 'fom/interpretation.md',  bundled: true },
			{ name: 'Decision Guide', file: 'fom/decision-guide.md',  bundled: true },
			{ separator: true, label: 'Algorithm Details' },
			{ name: 'SGD',      file: 'fom/sgd.md',      bundled: true },
			{ name: 'Adam',     file: 'fom/adam.md',     bundled: true },
			{ name: 'AdaMax',   file: 'fom/adamax.md',   bundled: true },
			{ name: 'AdaGrad',  file: 'fom/adagrad.md',  bundled: true },
			{ name: 'Momentum', file: 'fom/momentum.md', bundled: true },
			{ name: 'Nesterov', file: 'fom/nesterov.md', bundled: true },
			{ name: 'RMSProp',  file: 'fom/rmsprop.md',  bundled: true },
			{ name: 'AdamW',    file: 'fom/adamw.md',    bundled: true },
		],
		references: FOM_REFERENCES,
	},
};

export function openFomWebview(
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
			title: FOM_TITLE,
			options: { retainContextWhenHidden: true },
			contentOptions: { allowScripts: true },
			extension: undefined,
		},
		FOM_VIEW_TYPE,
		FOM_TITLE,
		undefined,
		{ group: undefined, preserveFocus: false }
	);

	webviewInput.webview.setHtml(getFomHtml());

	registerFomWebviewHandlers(
		webviewInput,
		FOM_METADATA,
		openerService,
		editorService,
		quickInputService,
		commandService,
		clipboardService,
		notificationService,
		initialModel,
	);
}
