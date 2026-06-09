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
import { ICoptMetadata } from '../common/copt.types.js';
import { IModelReference, IModelNotebookSection } from '../common/model.types.js';
import { registerCoptWebviewHandlers } from '../handlers/copt.handler.js';
import { getCoptHtml } from '../webviews/copt.template.js';

const COPT_VIEW_TYPE = 'pollis.copt';
const COPT_TITLE = 'Constrained Optimisation';

const COPT_REFERENCES: IModelReference[] = [
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
		title: 'NLopt: A free/open-source library for nonlinear optimization',
		authors: 'Johnson, Steven G.',
		year: 2007,
		journal: 'GitHub',
		openAccess: true,
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
		title: 'FrankWolfe.jl: A High-Performance and Flexible Toolbox for Frank-Wolfe Algorithms and Conditional Gradients',
		authors: 'Besan&#231;on, Mathieu; Carderera, Alejandro; Pokutta, Sebastian',
		year: 2022,
		journal: 'INFORMS Journal on Computing',
		doi: '10.1287/ijoc.2022.1191',
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
		openAccess: true,
	},
	{
		title: 'Practical Methods of Optimization',
		authors: 'Fletcher, Roger',
		year: 2000,
		journal: 'Wiley (2nd ed.)',
		doi: '10.1002/9781118723203',
		openAccess: false,
	},
	{ separator: true, label: 'Original Papers' },
	{
		title: 'A Software Package for Sequential Quadratic Programming',
		authors: 'Kraft, Dieter',
		year: 1988,
		journal: 'DFVLR Technical Report FB 88-28',
		openAccess: false,
	},
	{
		title: 'The Method of Moving Asymptotes &#8212; A New Method for Structural Optimization',
		authors: 'Svanberg, Krister',
		year: 1987,
		journal: 'International Journal for Numerical Methods in Engineering',
		doi: '10.1002/nme.1620240207',
		openAccess: false,
	},
	{
		title: 'On the Implementation of an Interior-Point Filter Line-Search Algorithm for Large-Scale Nonlinear Programming',
		authors: 'W&#228;chter, Andreas; Biegler, Lorenz T.',
		year: 2006,
		journal: 'Mathematical Programming',
		doi: '10.1007/s10107-004-0559-y',
		openAccess: false,
	},
	{
		title: 'An Algorithm for Quadratic Programming',
		authors: 'Frank, Marguerite; Wolfe, Philip',
		year: 1956,
		journal: 'Naval Research Logistics Quarterly',
		doi: '10.1002/nav.3800030109',
		openAccess: false,
	},
	{
		title: 'The Gradient Projection Method for Nonlinear Programming. Part I. Linear Constraints',
		authors: 'Rosen, J. B.',
		year: 1960,
		journal: 'Journal of the Society for Industrial and Applied Mathematics',
		doi: '10.1137/0108011',
		openAccess: false,
	},
];

export const COPT_NOTEBOOK_SECTIONS: IModelNotebookSection[] = [
	{
		label: '',
		notebooks: [
			{
				name: 'SLSQP',
				file: 'copt/tutorial-01-slsqp.ipynb',
				bundled: true,
				description: 'Sequential Least Squares Programming with NLopt.jl: inequality and equality constraints',
			},
			{
				name: 'MMA',
				file: 'copt/tutorial-02-mma.ipynb',
				bundled: true,
				description: 'Method of Moving Asymptotes: convex separable approximations for structural design',
			},
			{
				name: 'Interior Point',
				file: 'copt/tutorial-03-interior-point.ipynb',
				bundled: true,
				description: 'Barrier methods via Ipopt.jl and JuMP: large-scale nonlinear programming',
			},
			{
				name: 'Frank-Wolfe',
				file: 'copt/tutorial-04-frank-wolfe.ipynb',
				bundled: true,
				description: 'Conditional gradient method for constrained optimisation with FrankWolfe.jl',
			},
			{
				name: 'Gradient Projection',
				file: 'copt/tutorial-05-gradient-projection.ipynb',
				bundled: true,
				description: 'Projected gradient descent for box-constrained problems',
			},
		],
	},
];

const COPT_METADATA: ICoptMetadata = {
	copt: {
		packages: [
			{
				name: 'NLopt.jl',
				github: 'https://github.com/JuliaOpt/NLopt.jl',
				papers: [],
			},
			{
				name: 'JuMP.jl',
				github: 'https://github.com/jump-dev/JuMP.jl',
				papers: [],
			},
			{
				name: 'Ipopt.jl',
				github: 'https://github.com/jump-dev/Ipopt.jl',
				papers: [],
			},
			{
				name: 'FrankWolfe.jl',
				github: 'https://github.com/ZIB-IOL/FrankWolfe.jl',
				papers: [],
			},
			{
				name: 'Optim.jl',
				github: 'https://github.com/JuliaNLSolvers/Optim.jl',
				papers: [],
			},
		],
		notebookSections: COPT_NOTEBOOK_SECTIONS,
		notebooks: COPT_NOTEBOOK_SECTIONS.flatMap(s => s.notebooks),
		wikis: [
			{ name: 'Factsheet',      file: 'copt/factsheet.md',      bundled: true },
			{ name: 'Overview',       file: 'copt/overview.md',        bundled: true },
			{ name: 'Assumptions',    file: 'copt/assumptions.md',     bundled: true },
			{ name: 'Diagnostics',    file: 'copt/diagnostics.md',     bundled: true },
			{ name: 'Interpretation', file: 'copt/interpretation.md',  bundled: true },
			{ name: 'Decision Guide', file: 'copt/decision-guide.md',  bundled: true },
			{ separator: true, label: 'Algorithm Details' },
			{ name: 'SLSQP',               file: 'copt/slsqp.md',               bundled: true },
			{ name: 'MMA',                 file: 'copt/mma.md',                 bundled: true },
			{ name: 'Interior Point',      file: 'copt/interior-point.md',      bundled: true },
			{ name: 'Frank-Wolfe',         file: 'copt/frank-wolfe.md',         bundled: true },
			{ name: 'Gradient Projection', file: 'copt/gradient-projection.md', bundled: true },
		],
		references: COPT_REFERENCES,
	},
};

export function openCoptWebview(
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
			title: COPT_TITLE,
			options: { retainContextWhenHidden: true },
			contentOptions: { allowScripts: true },
			extension: undefined,
		},
		COPT_VIEW_TYPE,
		COPT_TITLE,
		undefined,
		{ group: undefined, preserveFocus: false }
	);

	webviewInput.webview.setHtml(getCoptHtml());

	registerCoptWebviewHandlers(
		webviewInput,
		COPT_METADATA,
		openerService,
		editorService,
		quickInputService,
		commandService,
		clipboardService,
		notificationService,
		initialModel,
	);
}
