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
import { IQnMetadata } from '../common/qn.types.js';
import { IModelReference } from '../common/model.types.js';
import { registerQnWebviewHandlers } from '../handlers/qn.handler.js';
import { getQnHtml } from '../webviews/qn.template.js';

const QN_VIEW_TYPE = 'pollis.qn';
const QN_TITLE = 'Quasi-Newton Methods';

const QN_REFERENCES: IModelReference[] = [
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
	{ separator: true, label: 'BFGS (Original Papers)' },
	{
		title: 'The Convergence of a Class of Double-rank Minimization Algorithms',
		authors: 'Broyden, Charles G.',
		year: 1970,
		journal: 'Journal of the Institute of Mathematics and Its Applications',
		doi: '10.1093/imamat/6.1.76',
		openAccess: false,
	},
	{
		title: 'A New Approach to Variable Metric Algorithms',
		authors: 'Fletcher, Roger',
		year: 1970,
		journal: 'Computer Journal',
		doi: '10.1093/comjnl/13.3.317',
		openAccess: false,
	},
	{
		title: 'A Family of Variable Metric Methods Derived by Variational Means',
		authors: 'Goldfarb, Donald',
		year: 1970,
		journal: 'Mathematics of Computation',
		doi: '10.2307/2004514',
		openAccess: false,
	},
	{
		title: 'Conditioning of Quasi-Newton Methods for Function Minimization',
		authors: 'Shanno, David F.',
		year: 1970,
		journal: 'Mathematics of Computation',
		doi: '10.2307/2004873',
		openAccess: false,
	},
	{ separator: true, label: 'L-BFGS (Original Paper)' },
	{
		title: 'On the Limited Memory BFGS Method for Large Scale Optimization',
		authors: 'Liu, Dong C.; Nocedal, Jorge',
		year: 1989,
		journal: 'Mathematical Programming',
		doi: '10.1007/BF01589116',
		openAccess: false,
	},
];

const QN_METADATA: IQnMetadata = {
	qn: {
		packages: [
			{
				name: 'Optim.jl',
				github: 'https://github.com/JuliaNLSolvers/Optim.jl',
				papers: [],
			},
		],
		notebooks: [
			{
				name: 'BFGS',
				file: 'qn/tutorial-01-bfgs.ipynb',
				bundled: true,
				description: 'BFGS with Wolfe line search using BFGS() in Optim.jl',
			},
			{
				name: 'L-BFGS',
				file: 'qn/tutorial-02-lbfgs.ipynb',
				bundled: true,
				description: 'Limited-memory BFGS for large-scale optimization using LBFGS() in Optim.jl',
			},
			{
				name: 'Line Search Options',
				file: 'qn/tutorial-03-linesearch.ipynb',
				bundled: true,
				description: 'Customising line search for quasi-Newton methods: step bounds, Wolfe conditions, and initial step strategies',
			},
			{
				name: 'Benchmarking Quasi-Newton Methods',
				file: 'qn/tutorial-04-benchmark.ipynb',
				bundled: true,
				description: 'Compare BFGS and L-BFGS on standard test functions: Rosenbrock, Himmelblau, and others',
			},
		],
		wikis: [
			{ name: 'Factsheet',             file: 'qn/factsheet.md',             bundled: true },
			{ name: 'Overview',              file: 'qn/overview.md',              bundled: true },
			{ name: 'Assumptions',           file: 'qn/assumptions.md',           bundled: true },
			{ name: 'Diagnostics',           file: 'qn/diagnostics.md',           bundled: true },
			{ name: 'Interpretation',        file: 'qn/interpretation.md',        bundled: true },
			{ name: 'Decision Guide',        file: 'qn/decision-guide.md',        bundled: true },
			{ separator: true, label: 'Algorithm Details' },
			{ name: 'BFGS',                  file: 'qn/bfgs.md',                  bundled: true },
			{ name: 'L-BFGS',               file: 'qn/lbfgs.md',                bundled: true },
		],
		references: QN_REFERENCES,
	},
};

export function openQnWebview(
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
			title: QN_TITLE,
			options: { retainContextWhenHidden: true },
			contentOptions: { allowScripts: true },
			extension: undefined,
		},
		QN_VIEW_TYPE,
		QN_TITLE,
		undefined,
		{ group: undefined, preserveFocus: false }
	);

	webviewInput.webview.setHtml(getQnHtml());

	registerQnWebviewHandlers(
		webviewInput,
		QN_METADATA,
		openerService,
		editorService,
		quickInputService,
		commandService,
		clipboardService,
		notificationService,
		initialModel,
	);
}
