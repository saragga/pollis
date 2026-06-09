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
import { IGraphpplMetadata } from '../common/graphppl.types.js';
import { IModelReference } from '../../../model/browser/common/model.types.js';
import { registerGraphpplWebviewHandlers } from '../handlers/graphppl.handler.js';
import { getGraphpplHtml } from '../webviews/graphppl.template.js';

const GRAPHPPL_VIEW_TYPE = 'pollis.graphppl';
const GRAPHPPL_TITLE = 'Probabilistic Programming with RxInfer.jl';

const GRAPHPPL_REFERENCES: IModelReference[] = [
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
		title: 'RxInfer: A Julia Package for Reactive Real-Time Bayesian Inference',
		authors: 'Bagaev, Dmitry; de Vries, Bert',
		year: 2023,
		journal: 'Journal of Open Source Software',
		doi: '10.21105/joss.05161',
		openAccess: true,
	},
	{ separator: true, label: 'Textbooks' },
	{
		title: 'Pattern Recognition and Machine Learning',
		authors: 'Bishop, Christopher M.',
		year: 2006,
		journal: 'Springer',
		openAccess: false,
	},
	{
		title: 'Probabilistic Graphical Models: Principles and Techniques',
		authors: 'Koller, Daphne; Friedman, Nir',
		year: 2009,
		journal: 'MIT Press',
		openAccess: false,
	},
	{ separator: true, label: 'Original Papers' },
	{
		title: 'Reverend Bayes on Inference Engines: A Distributed Hierarchical Approach',
		authors: 'Pearl, Judea',
		year: 1982,
		journal: 'Proceedings of the National Conference on Artificial Intelligence (AAAI)',
		openAccess: false,
	},
	{
		title: 'Expectation Propagation for Approximate Bayesian Inference',
		authors: 'Minka, Thomas P.',
		year: 2001,
		journal: 'Proceedings of the 17th Conference in Uncertainty in Artificial Intelligence (UAI)',
		url: 'https://dl.acm.org/doi/10.5555/2074022.2074101',
		openAccess: false,
	},
	{
		title: 'A Family of Algorithms for Approximate Bayesian Inference',
		authors: 'Minka, Thomas P.',
		year: 2001,
		journal: 'PhD Thesis, MIT',
		url: 'https://tminka.github.io/papers/ep/minka-thesis.pdf',
		openAccess: true,
	},
];

const GRAPHPPL_METADATA: IGraphpplMetadata = {
	graphppl: {
		packages: [
			{
				name: 'RxInfer.jl',
				github: 'https://github.com/ReactiveBayes/RxInfer.jl',
				papers: [],
				videos: [],
			},
			{
				name: 'GraphPPL.jl',
				github: 'https://github.com/ReactiveBayes/GraphPPL.jl',
				papers: [],
				videos: [],
			},
		],
		notebooks: [
			{ name: 'Belief Propagation',          file: 'graphppl/tutorial-01-bp.ipynb',  bundled: true, description: 'Exact sum-product message passing on a conjugate Gaussian factor graph' },
			{ name: 'Variational Message Passing',  file: 'graphppl/tutorial-02-vmp.ipynb', bundled: true, description: 'Mean-field variational approximation with free energy tracking' },
			{ name: 'Expectation Propagation',      file: 'graphppl/tutorial-03-ep.ipynb',  bundled: true, description: 'EP message passing for non-conjugate factor nodes' },
		],
		wikis: [
			{ name: 'Factsheet',      file: 'graphppl/factsheet.md',      bundled: true },
			{ name: 'Overview',       file: 'graphppl/overview.md',       bundled: true },
			{ name: 'Assumptions',    file: 'graphppl/assumptions.md',    bundled: true },
			{ name: 'Diagnostics',    file: 'graphppl/diagnostics.md',    bundled: true },
			{ name: 'Interpretation', file: 'graphppl/interpretation.md', bundled: true },
			{ name: 'Decision Guide', file: 'graphppl/decision-guide.md', bundled: true },
			{ separator: true, label: 'Algorithms' },
			{ name: 'Belief Propagation',         file: 'graphppl/bp.md',  bundled: true },
			{ name: 'Variational Message Passing', file: 'graphppl/vmp.md', bundled: true },
			{ name: 'Expectation Propagation',    file: 'graphppl/ep.md',  bundled: true },
		],
		references: GRAPHPPL_REFERENCES,
	},
};

export function openGraphpplWebview(
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
			title: GRAPHPPL_TITLE,
			options: { retainContextWhenHidden: true },
			contentOptions: { allowScripts: true },
			extension: undefined,
		},
		GRAPHPPL_VIEW_TYPE,
		GRAPHPPL_TITLE,
		undefined,
		{ group: undefined, preserveFocus: false }
	);

	webviewInput.webview.setHtml(getGraphpplHtml());

	registerGraphpplWebviewHandlers(
		webviewInput,
		GRAPHPPL_METADATA,
		openerService,
		editorService,
		quickInputService,
		commandService,
		clipboardService,
		notificationService,
		initialModel,
	);
}
