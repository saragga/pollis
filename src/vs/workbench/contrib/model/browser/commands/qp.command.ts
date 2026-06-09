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
import { IQpMetadata } from '../common/qp.types.js';
import { IModelReference, IModelNotebookSection } from '../common/model.types.js';
import { registerQpWebviewHandlers } from '../handlers/qp.handler.js';
import { getQpHtml } from '../webviews/qp.template.js';

const QP_VIEW_TYPE = 'pollis.qp';
const QP_TITLE = 'Quadratic Programming';

const QP_REFERENCES: IModelReference[] = [
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
		title: 'JuMP: A Modeling Language for Mathematical Optimization',
		authors: 'Dunning, Iain; Huchette, Joey; Lubin, Miles',
		year: 2017,
		journal: 'SIAM Review',
		doi: '10.1137/15M1020575',
		openAccess: true,
	},
	{
		title: 'OSQP: An Operator Splitting Solver for Quadratic Programs',
		authors: 'Stellato, Bartolomeo; Banjac, Goran; Goulart, Paul; Bemporad, Alberto; Boyd, Stephen',
		year: 2020,
		journal: 'Mathematical Programming Computation',
		doi: '10.1007/s12532-020-00179-2',
		openAccess: true,
	},
	{
		title: 'Clarabel: An Interior-Point Solver for Conic Programs with Quadratic Objectives',
		authors: 'Goulart, Paul J.; Chen, Yuwen',
		year: 2024,
		journal: 'Mathematical Programming Computation',
		url: 'https://arxiv.org/abs/2212.08260',
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
	{
		title: 'Convex Optimization',
		authors: 'Boyd, Stephen; Vandenberghe, Lieven',
		year: 2004,
		journal: 'Cambridge University Press',
		url: 'https://web.stanford.edu/~boyd/cvxbook/',
		openAccess: true,
	},
	{ separator: true, label: 'Original Papers' },
	{
		title: 'Portfolio Selection',
		authors: 'Markowitz, Harry',
		year: 1952,
		journal: 'Journal of Finance',
		doi: '10.2307/2975974',
		openAccess: false,
	},
];

export const QP_NOTEBOOK_SECTIONS: IModelNotebookSection[] = [
	{
		label: 'Quadratic Programming',
		notebooks: [
			{ name: 'Basic QP',                   file: 'qp/tutorial-01-basic-qp.ipynb',                    bundled: true, description: 'Formulate and solve a quadratic programme with JuMP and Clarabel' },
			{ name: 'Portfolio Optimisation',      file: 'qp/tutorial-02-portfolio-optimisation.ipynb',      bundled: true, description: 'Markowitz mean-variance portfolio: efficient frontier and minimum-variance allocation' },
		],
	},
	{
		label: 'Quadratically Constrained QP',
		notebooks: [
			{ name: 'Basic QCQP',                  file: 'qp/tutorial-03-basic-qcqp.ipynb',                  bundled: true, description: 'Formulate and solve a quadratically constrained quadratic programme' },
		],
	},
	{
		label: 'Mixed-Integer QP',
		notebooks: [
			{ name: 'Cardinality Portfolio',       file: 'qp/tutorial-04-cardinality-portfolio.ipynb',       bundled: true, description: 'Cardinality-constrained portfolio: select at most k assets using binary variables' },
		],
	},
];

const QP_METADATA: IQpMetadata = {
	qp: {
		packages: [
			{
				name: 'JuMP.jl',
				github: 'https://github.com/jump-dev/JuMP.jl',
				papers: [],
			},
			{
				name: 'OSQP.jl',
				github: 'https://github.com/oxfordcontrol/OSQP.jl',
				papers: [],
			},
			{
				name: 'Clarabel.jl',
				github: 'https://github.com/oxfordcontrol/Clarabel.jl',
				papers: [],
			},
			{
				name: 'Ipopt.jl',
				github: 'https://github.com/jump-dev/Ipopt.jl',
				papers: [],
			},
			{
				name: 'SCIP.jl',
				github: 'https://github.com/scipopt/SCIP.jl',
				papers: [],
			},
		],
		notebookSections: QP_NOTEBOOK_SECTIONS,
		notebooks: QP_NOTEBOOK_SECTIONS.flatMap(s => s.notebooks),
		wikis: [
			{ name: 'Factsheet',               file: 'qp/factsheet.md',               bundled: true },
			{ name: 'Overview',                file: 'qp/overview.md',                bundled: true },
			{ name: 'Assumptions',             file: 'qp/assumptions.md',             bundled: true },
			{ name: 'Diagnostics',             file: 'qp/diagnostics.md',             bundled: true },
			{ name: 'Interpretation',          file: 'qp/interpretation.md',          bundled: true },
			{ name: 'Decision Guide',          file: 'qp/decision-guide.md',          bundled: true },
			{ separator: true, label: 'Methods' },
			{ name: 'QP',                      file: 'qp/qp.md',                      bundled: true },
			{ name: 'QCQP',                    file: 'qp/qcqp.md',                    bundled: true },
			{ name: 'MIQP',                    file: 'qp/miqp.md',                    bundled: true },
			{ separator: true, label: 'Applications' },
			{ name: 'Portfolio Optimisation',  file: 'qp/portfolio-optimisation.md',  bundled: true },
		],
		references: QP_REFERENCES,
	},
};

export function openQpWebview(
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
			title: QP_TITLE,
			options: { retainContextWhenHidden: true },
			contentOptions: { allowScripts: true },
			extension: undefined,
		},
		QP_VIEW_TYPE,
		QP_TITLE,
		undefined,
		{ group: undefined, preserveFocus: false }
	);

	webviewInput.webview.setHtml(getQpHtml());

	registerQpWebviewHandlers(
		webviewInput,
		QP_METADATA,
		openerService,
		editorService,
		quickInputService,
		commandService,
		clipboardService,
		notificationService,
		initialModel,
	);
}
