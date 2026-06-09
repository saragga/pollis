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
import { IOptimMetadata } from '../common/optim.types.js';
import { IModelReference } from '../common/model.types.js';
import { registerOptimWebviewHandlers } from '../handlers/optim.handler.js';
import { getOptimHtml } from '../webviews/optim.template.js';

const OPTIM_VIEW_TYPE = 'pollis.optim';
const OPTIM_TITLE = 'Local Optimisation';

const OPTIM_REFERENCES: IModelReference[] = [
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
		title: 'A Simplex Method for Function Minimization',
		authors: 'Nelder, John A.; Mead, Roger',
		year: 1965,
		journal: 'The Computer Journal',
		doi: '10.1093/comjnl/7.4.308',
		openAccess: false,
	},
	{
		title: 'The Convergence of a Class of Double-Rank Minimization Algorithms',
		authors: 'Fletcher, Roger',
		year: 1970,
		journal: 'IMA Journal of Applied Mathematics',
		doi: '10.1093/imamat/6.1.76',
		openAccess: false,
	},
	{
		title: 'On the Implementation of an Interior-Point Filter Line-Search Algorithm for Large-Scale Nonlinear Programming',
		authors: 'Waechter, Andreas; Biegler, Lorenz T.',
		year: 2006,
		journal: 'Mathematical Programming',
		doi: '10.1007/s10107-004-0559-y',
		openAccess: false,
	},
];

const OPTIM_METADATA: IOptimMetadata = {
	optim: {
		packages: [
			{
				name: 'Optim.jl',
				github: 'https://github.com/JuliaNLSolvers/Optim.jl',
				papers: [
					{
						title: 'Optim: A mathematical optimization package for Julia',
						authors: 'Mogensen, Patrick Kofod; Riseth, Asbjorn Nilsen',
						year: 2018,
						journal: 'Journal of Open Source Software',
						doi: '10.21105/joss.00615',
						openAccess: true,
					},
				],
			},
		],
		notebooks: [
			{
				name: 'Local Optimisation',
				file: 'optim/tutorial-01-optim.ipynb',
				bundled: true,
				description: 'Gradient-free, gradient-based, and Hessian-based local optimisation using Optim.jl',
			},
			{
				name: 'Constrained Optimisation (IPNewton)',
				file: 'optim/tutorial-02-ipnewton.ipynb',
				bundled: true,
				description: 'Interior-point Newton method for box-constrained problems with TwiceDifferentiableConstraints',
			},
		],
		wikis: [
			{ name: 'Factsheet',          file: 'optim/factsheet.md',          bundled: true },
			{ name: 'Overview',           file: 'optim/overview.md',           bundled: true },
			{ name: 'Assumptions',        file: 'optim/assumptions.md',        bundled: true },
			{ name: 'Diagnostics',        file: 'optim/diagnostics.md',        bundled: true },
			{ name: 'Interpretation',     file: 'optim/interpretation.md',     bundled: true },
			{ name: 'Decision Guide',     file: 'optim/decision-guide.md',     bundled: true },
			{ separator: true, label: 'Algorithm Classes' },
			{ name: 'Gradient Free',      file: 'optim/gradient-free.md',      bundled: true },
			{ name: 'Gradient Required',  file: 'optim/gradient-required.md',  bundled: true },
			{ name: 'Hessian Required',   file: 'optim/hessian-required.md',   bundled: true },
		],
		references: OPTIM_REFERENCES,
	},
};

export function openOptimWebview(
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
			title: OPTIM_TITLE,
			options: { retainContextWhenHidden: true },
			contentOptions: { allowScripts: true },
			extension: undefined,
		},
		OPTIM_VIEW_TYPE,
		OPTIM_TITLE,
		undefined,
		{ group: undefined, preserveFocus: false }
	);

	webviewInput.webview.setHtml(getOptimHtml());

	registerOptimWebviewHandlers(
		webviewInput,
		OPTIM_METADATA,
		openerService,
		editorService,
		quickInputService,
		commandService,
		clipboardService,
		notificationService,
		initialModel,
	);
}
