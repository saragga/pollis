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
import { ISoMetadata } from '../common/so.types.js';
import { IModelReference } from '../common/model.types.js';
import { registerSoWebviewHandlers } from '../handlers/so.handler.js';
import { getSoHtml } from '../webviews/so.template.js';

const SO_VIEW_TYPE = 'pollis.so';
const SO_TITLE = 'Second Order Methods';

const SO_REFERENCES: IModelReference[] = [
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
	{
		title: 'The NLopt nonlinear-optimization package',
		authors: 'Johnson, Steven G.',
		year: 2007,
		journal: 'NLopt Documentation',
		url: 'https://nlopt.readthedocs.io/en/latest/',
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
		title: 'Trust Region Methods',
		authors: 'Conn, Andrew R.; Gould, Nicholas I. M.; Toint, Philippe L.',
		year: 2000,
		journal: 'SIAM',
		doi: '10.1137/1.9780898719857',
		openAccess: false,
	},
	{ separator: true, label: 'Original Papers' },
	{
		title: 'On the Implementation of an Interior-Point Filter Line-Search Algorithm for Large-Scale Nonlinear Programming',
		authors: 'Waechter, Andreas; Biegler, Lorenz T.',
		year: 2006,
		journal: 'Mathematical Programming',
		doi: '10.1007/s10107-004-0559-y',
		openAccess: false,
	},
	{
		title: 'Computing a Trust Region Step',
		authors: 'More, Jorge J.; Sorensen, Danny C.',
		year: 1983,
		journal: 'SIAM Journal on Scientific and Statistical Computing',
		doi: '10.1137/0904038',
		openAccess: false,
	},
	{
		title: 'A Survey of Truncated-Newton Methods',
		authors: 'Nash, Stephen G.',
		year: 2000,
		journal: 'Journal of Computational and Applied Mathematics',
		doi: '10.1016/S0377-0427(00)00426-X',
		openAccess: false,
	},
];

const SO_METADATA: ISoMetadata = {
	so: {
		packages: [
			{
				name: 'Optim.jl',
				github: 'https://github.com/JuliaNLSolvers/Optim.jl',
				papers: [],
			},
			{
				name: 'NLopt.jl',
				github: 'https://github.com/JuliaOpt/NLopt.jl',
				papers: [],
			},
		],
		notebooks: [
			{
				name: 'Newton Method',
				file: 'so/tutorial-01-newton.ipynb',
				bundled: true,
				description: 'Second-order optimisation using exact Hessian via automatic differentiation with Newton()',
			},
			{
				name: 'Newton Trust Region',
				file: 'so/tutorial-02-newton-trust-region.ipynb',
				bundled: true,
				description: 'Globalised Newton method with trust-region step constraint for robust convergence',
			},
			{
				name: 'Interior-Point Newton (IPNewton)',
				file: 'so/tutorial-03-ipnewton.ipynb',
				bundled: true,
				description: 'Box-constrained optimisation via interior-point Newton using TwiceDifferentiableConstraints',
			},
			{
				name: 'Truncated Newton',
				file: 'so/tutorial-04-truncated-newton.ipynb',
				bundled: true,
				description: 'CG-based approximate Newton step using Hessian-vector products via NLopt.jl LD_TNEWTON',
			},
			{
				name: 'Benchmarking Second-Order Methods',
				file: 'so/tutorial-05-benchmark.ipynb',
				bundled: true,
				description: 'Compare Newton, Newton Trust Region, IPNewton, and Truncated Newton on standard test functions',
			},
		],
		wikis: [
			{ name: 'Factsheet',             file: 'so/factsheet.md',             bundled: true },
			{ name: 'Overview',              file: 'so/overview.md',              bundled: true },
			{ name: 'Assumptions',           file: 'so/assumptions.md',           bundled: true },
			{ name: 'Diagnostics',           file: 'so/diagnostics.md',           bundled: true },
			{ name: 'Interpretation',        file: 'so/interpretation.md',        bundled: true },
			{ name: 'Decision Guide',        file: 'so/decision-guide.md',        bundled: true },
			{ separator: true, label: 'Algorithm Details' },
			{ name: 'Newton',                file: 'so/newton.md',                bundled: true },
			{ name: 'Newton Trust Region',   file: 'so/newton-trust-region.md',   bundled: true },
			{ name: 'IPNewton',              file: 'so/ipnewton.md',              bundled: true },
			{ name: 'Truncated Newton',      file: 'so/truncated-newton.md',      bundled: true },
		],
		references: SO_REFERENCES,
	},
};

export function openSoWebview(
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
			title: SO_TITLE,
			options: { retainContextWhenHidden: true },
			contentOptions: { allowScripts: true },
			extension: undefined,
		},
		SO_VIEW_TYPE,
		SO_TITLE,
		undefined,
		{ group: undefined, preserveFocus: false }
	);

	webviewInput.webview.setHtml(getSoHtml());

	registerSoWebviewHandlers(
		webviewInput,
		SO_METADATA,
		openerService,
		editorService,
		quickInputService,
		commandService,
		clipboardService,
		notificationService,
		initialModel,
	);
}
