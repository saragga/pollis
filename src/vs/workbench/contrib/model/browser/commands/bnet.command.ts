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
import { IBnetMetadata } from '../common/bnet.types.js';
import { IModelReference, IModelNotebookSection } from '../common/model.types.js';
import { registerBnetWebviewHandlers } from '../handlers/bnet.handler.js';
import { getBnetHtml } from '../webviews/bnet.template.js';

const BNET_VIEW_TYPE = 'pollis.bnet';
const BNET_TITLE = 'Bayesian Network Inference';

const BNET_REFERENCES: IModelReference[] = [
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
		title: 'BayesNets.jl: Bayesian Networks in Julia',
		authors: 'Wheeler, Tim; Kochenderfer, Mykel J.',
		year: 2020,
		journal: 'GitHub',
		url: 'https://github.com/sisl/BayesNets.jl',
		openAccess: true,
	},
	{ separator: true, label: 'Textbooks' },
	{
		title: 'Probabilistic Graphical Models: Principles and Techniques',
		authors: 'Koller, Daphne; Friedman, Nir',
		year: 2009,
		journal: 'MIT Press',
		url: 'https://mitpress.mit.edu/9780262013192',
		openAccess: false,
	},
	{
		title: 'Probabilistic Reasoning in Intelligent Systems',
		authors: 'Pearl, Judea',
		year: 1988,
		journal: 'Morgan Kaufmann',
		url: 'https://www.sciencedirect.com/book/9780080514895',
		openAccess: false,
	},
	{
		title: 'Causality: Models, Reasoning, and Inference',
		authors: 'Pearl, Judea',
		year: 2009,
		journal: 'Cambridge University Press (2nd ed.)',
		doi: '10.1017/CBO9780511803161',
		openAccess: false,
	},
	{ separator: true, label: 'Original Papers' },
	{
		title: 'A Bayesian Method for the Induction of Probabilistic Networks from Data',
		authors: 'Cooper, Gregory F.; Herskovits, Edward',
		year: 1992,
		journal: 'Machine Learning',
		doi: '10.1007/BF00994110',
		openAccess: false,
	},
	{
		title: 'Optimal Structure Identification with Greedy Search',
		authors: 'Chickering, David Maxwell',
		year: 2002,
		journal: 'Journal of Machine Learning Research',
		url: 'https://www.jmlr.org/papers/v3/chickering02b.html',
		openAccess: true,
	},
	{
		title: 'Causation, Prediction, and Search',
		authors: 'Spirtes, Peter; Glymour, Clark; Scheines, Richard',
		year: 2000,
		journal: 'MIT Press (2nd ed.)',
		url: 'https://mitpress.mit.edu/9780262194402',
		openAccess: true,
	},
];

export const BNET_NOTEBOOK_SECTIONS: IModelNotebookSection[] = [
	{
		label: 'Bayesian Network Inference',
		notebooks: [
			{ name: 'Building a Bayesian Network',  file: 'bnet/tutorial-01-define.ipynb',    bundled: true, description: 'Define nodes, CPDs, and graph structure with BayesNets.jl' },
			{ name: 'Structure Learning',            file: 'bnet/tutorial-02-learn.ipynb',     bundled: true, description: 'Learn Bayesian Network structure from data using K2 and NaiveBayes algorithms' },
			{ name: 'Probabilistic Inference',       file: 'bnet/tutorial-03-infer.ipynb',     bundled: true, description: 'Query posterior probabilities given evidence via exact and approximate inference' },
			{ name: 'Diagnosis and Decision Support', file: 'bnet/tutorial-04-diagnosis.ipynb', bundled: true, description: 'Apply Bayesian Networks to medical diagnosis and fault detection' },
		],
	},
];

const BNET_METADATA: IBnetMetadata = {
	bnet: {
		packages: [
			{
				name: 'BayesNets.jl',
				github: 'https://github.com/sisl/BayesNets.jl',
				papers: [],
			},
		],
		notebookSections: BNET_NOTEBOOK_SECTIONS,
		notebooks: BNET_NOTEBOOK_SECTIONS.flatMap(s => s.notebooks),
		wikis: [
			{ name: 'Factsheet',      file: 'bnet/factsheet.md',      bundled: true },
			{ name: 'Overview',       file: 'bnet/overview.md',        bundled: true },
			{ name: 'Assumptions',    file: 'bnet/assumptions.md',     bundled: true },
			{ name: 'Diagnostics',    file: 'bnet/diagnostics.md',     bundled: true },
			{ name: 'Interpretation', file: 'bnet/interpretation.md',  bundled: true },
			{ name: 'Decision Guide', file: 'bnet/decision-guide.md',  bundled: true },
			{ separator: true, label: 'Methods' },
			{ name: 'Define',              file: 'bnet/define.md',    bundled: true },
			{ name: 'Structure Learning',  file: 'bnet/learn.md',     bundled: true },
			{ name: 'Exact Inference',     file: 'bnet/infer.md',     bundled: true },
			{ name: 'Approx. Inference',   file: 'bnet/sample.md',    bundled: true },
		],
		references: BNET_REFERENCES,
	},
};

export function openBnetWebview(
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
			title: BNET_TITLE,
			options: { retainContextWhenHidden: true },
			contentOptions: { allowScripts: true },
			extension: undefined,
		},
		BNET_VIEW_TYPE,
		BNET_TITLE,
		undefined,
		{ group: undefined, preserveFocus: false }
	);

	webviewInput.webview.setHtml(getBnetHtml());

	registerBnetWebviewHandlers(
		webviewInput,
		BNET_METADATA,
		openerService,
		editorService,
		quickInputService,
		commandService,
		clipboardService,
		notificationService,
		initialModel,
	);
}
