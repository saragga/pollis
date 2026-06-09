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
import { INllsMetadata } from '../common/nlls.types.js';
import { IModelReference, IModelNotebookSection } from '../common/model.types.js';
import { registerNllsWebviewHandlers } from '../handlers/nlls.handler.js';
import { getNllsHtml } from '../webviews/nlls.template.js';

const NLLS_VIEW_TYPE = 'pollis.nlls';
const NLLS_TITLE = 'Nonlinear Least Squares';

const NLLS_REFERENCES: IModelReference[] = [
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
		title: 'Numerical Optimization',
		authors: 'Nocedal, Jorge; Wright, Stephen J.',
		year: 2006,
		journal: 'Springer (2nd ed.)',
		doi: '10.1007/978-0-387-40065-5',
		openAccess: false,
	},
	{ separator: true, label: 'Original Papers' },
	{
		title: 'A Method for the Solution of Certain Non-Linear Problems in Least Squares',
		authors: 'Levenberg, Kenneth',
		year: 1944,
		journal: 'Quarterly of Applied Mathematics',
		doi: '10.1090/qam/10666',
		openAccess: false,
	},
	{
		title: 'An Algorithm for Least-Squares Estimation of Nonlinear Parameters',
		authors: 'Marquardt, Donald W.',
		year: 1963,
		journal: 'SIAM Journal on Applied Mathematics',
		doi: '10.1137/0111030',
		openAccess: false,
	},
	{
		title: 'A New Algorithm for Unconstrained Optimization',
		authors: 'Powell, Michael J. D.',
		year: 1970,
		journal: 'Nonlinear Programming (Academic Press)',
		doi: '10.1016/B978-0-12-597050-1.50009-6',
		openAccess: false,
	},
];

export const NLLS_NOTEBOOK_SECTIONS: IModelNotebookSection[] = [
	{
		label: '',
		notebooks: [
			{
				name: 'NLLS Basics',
				file: 'nlls/tutorial-01-basics.ipynb',
				bundled: true,
				description: 'Nonlinear least squares with LeastSquaresOptim.jl: LevenbergMarquardt and Dogleg algorithms',
			},
			{
				name: 'NLLS Advanced',
				file: 'nlls/tutorial-02-advanced.ipynb',
				bundled: true,
				description: 'Jacobians, sparse problems, and large-scale NLLS with GaussNewton from NonlinearSolve.jl',
			},
			{
				name: 'Nelson-Siegel',
				file: 'nlls/example-nelson-siegel.ipynb',
				bundled: true,
				description: 'Fitting the Nelson-Siegel yield curve model to bond market data',
			},
		],
	},
];

const NLLS_METADATA: INllsMetadata = {
	nlls: {
		packages: [
			{
				name: 'LeastSquaresOptim.jl',
				github: 'https://github.com/matthieugomez/LeastSquaresOptim.jl',
				papers: [],
			},
			{
				name: 'NonlinearSolve.jl',
				github: 'https://github.com/SciML/NonlinearSolve.jl',
				papers: [],
			},
		],
		notebookSections: NLLS_NOTEBOOK_SECTIONS,
		notebooks: NLLS_NOTEBOOK_SECTIONS.flatMap(s => s.notebooks),
		wikis: [
			{ name: 'Factsheet',      file: 'nlls/factsheet.md',      bundled: true },
			{ name: 'Overview',       file: 'nlls/overview.md',        bundled: true },
			{ name: 'Assumptions',    file: 'nlls/assumptions.md',     bundled: true },
			{ name: 'Diagnostics',    file: 'nlls/diagnostics.md',     bundled: true },
			{ name: 'Interpretation', file: 'nlls/interpretation.md',  bundled: true },
			{ name: 'Decision Guide', file: 'nlls/decision-guide.md',  bundled: true },
			{ separator: true, label: 'Algorithm Details' },
			{ name: 'LM Algorithm',       file: 'nlls/lm-algorithm.md',    bundled: true },
			{ name: 'Dogleg Algorithm',   file: 'nlls/dogleg-algorithm.md', bundled: true },
			{ name: 'Gauss-Newton',       file: 'nlls/gauss-newton.md',     bundled: true },
		],
		references: NLLS_REFERENCES,
	},
};

export function openNllsWebview(
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
			title: NLLS_TITLE,
			options: { retainContextWhenHidden: true },
			contentOptions: { allowScripts: true },
			extension: undefined,
		},
		NLLS_VIEW_TYPE,
		NLLS_TITLE,
		undefined,
		{ group: undefined, preserveFocus: false }
	);

	webviewInput.webview.setHtml(getNllsHtml());

	registerNllsWebviewHandlers(
		webviewInput,
		NLLS_METADATA,
		openerService,
		editorService,
		quickInputService,
		commandService,
		clipboardService,
		notificationService,
		initialModel,
	);
}
