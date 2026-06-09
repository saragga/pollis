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
import { IMoptMetadata } from '../common/mopt.types.js';
import { registerMoptWebviewHandlers } from '../handlers/mopt.handler.js';
import { getMoptHtml } from '../webviews/mopt.template.js';

const MOPT_VIEW_TYPE = 'pollis.mopt';
const MOPT_TITLE = 'Optimization on Riemannian Manifolds';

const MOPT_REFERENCES: IModelReference[] = [
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
		title: 'Manopt.jl: Optimization on Manifolds in Julia',
		authors: 'Bergmann, Ronny',
		year: 2022,
		journal: 'Journal of Open Source Software',
		doi: '10.21105/joss.03866',
		openAccess: true,
	},
	{
		title: 'Manifolds.jl: An Extensible Julia Framework for Data Analysis on Manifolds',
		authors: 'Axen, Seth D.; Baran, Mateusz; Bergmann, Ronny; Rzecki, Krzysztof',
		year: 2023,
		journal: 'ACM Transactions on Mathematical Software',
		doi: '10.1145/3618296',
		openAccess: true,
	},
	{ separator: true, label: 'Textbooks' },
	{
		title: 'Optimization Algorithms on Matrix Manifolds',
		authors: 'Absil, Pierre-Antoine; Mahony, Robert; Sepulchre, Rodolphe',
		year: 2008,
		journal: 'Princeton University Press',
		openAccess: false,
	},
	{
		title: 'An Introduction to Optimization on Smooth Manifolds',
		authors: 'Boumal, Nicolas',
		year: 2023,
		journal: 'Cambridge University Press',
		url: 'https://www.nicolasboumal.net/book',
		openAccess: true,
	},
	{ separator: true, label: 'Original Papers' },
	{
		title: 'Trust-Region Methods on Riemannian Manifolds',
		authors: 'Absil, Pierre-Antoine; Baker, Christopher G.; Gallivan, Kyle A.',
		year: 2007,
		journal: 'Foundations of Computational Mathematics',
		doi: '10.1007/s10208-005-0179-9',
		openAccess: false,
	},
	{
		title: 'Riemannian Conjugate Gradient Methods: General Framework and Specific Algorithms with Convergence Analyses',
		authors: 'Sato, Hiroyuki',
		year: 2022,
		journal: 'SIAM Journal on Optimization',
		doi: '10.1137/20M1324713',
		openAccess: false,
	},
	{
		title: 'A Riemannian BFGS Method without Differentiated Retraction for Nonconvex Optimization Problems',
		authors: 'Huang, Wen; Absil, Pierre-Antoine; Gallivan, Kyle A.',
		year: 2018,
		journal: 'SIAM Journal on Optimization',
		doi: '10.1137/17M1127582',
		openAccess: false,
	},
];

export const MOPT_NOTEBOOK_SECTIONS: IModelNotebookSection[] = [
	{
		label: '',
		notebooks: [
			{
				name: 'Gradient Descent',
				file: 'mopt/tutorial-01-gd.ipynb',
				bundled: true,
				description: 'Retraction-based steepest descent along the Riemannian gradient; simple and robust; suited to smooth objectives with moderate curvature',
			},
			{
				name: 'Conjugate Gradient',
				file: 'mopt/tutorial-02-cg.ipynb',
				bundled: true,
				description: 'Polak-Ribiere or Fletcher-Reeves CG with Riemannian vector transport; faster than gradient descent; low per-iteration memory cost',
			},
			{
				name: 'Quasi-Newton',
				file: 'mopt/tutorial-03-qn.ipynb',
				bundled: true,
				description: 'Limited-memory BFGS Hessian approximation with vector transport; superlinear convergence; recommended for medium-scale problems',
			},
			{
				name: 'Trust Regions',
				file: 'mopt/tutorial-04-tr.ipynb',
				bundled: true,
				description: 'Subproblem solved in the tangent space using tCG; second-order convergence; most robust for ill-conditioned and high-curvature problems',
			},
		],
	},
];

const MOPT_METADATA: IMoptMetadata = {
	mopt: {
		packages: [
			{
				name: 'Manopt.jl',
				github: 'https://github.com/JuliaManifolds/Manopt.jl',
				papers: [],
			},
			{
				name: 'Manifolds.jl',
				github: 'https://github.com/JuliaManifolds/Manifolds.jl',
				papers: [],
			},
		],
		notebookSections: MOPT_NOTEBOOK_SECTIONS,
		notebooks: MOPT_NOTEBOOK_SECTIONS.flatMap(s => s.notebooks),
		wikis: [
			{ name: 'Factsheet',      file: 'mopt/factsheet.md',      bundled: true },
			{ name: 'Overview',       file: 'mopt/overview.md',        bundled: true },
			{ name: 'Assumptions',    file: 'mopt/assumptions.md',     bundled: true },
			{ name: 'Diagnostics',    file: 'mopt/diagnostics.md',     bundled: true },
			{ name: 'Interpretation', file: 'mopt/interpretation.md',  bundled: true },
			{ name: 'Decision Guide', file: 'mopt/decision-guide.md',  bundled: true },
			{ separator: true, label: 'Algorithms' },
			{ name: 'Gradient Descent',   file: 'mopt/gd.md', bundled: true },
			{ name: 'Conjugate Gradient', file: 'mopt/cg.md', bundled: true },
			{ name: 'Quasi-Newton',       file: 'mopt/qn.md', bundled: true },
			{ name: 'Trust Regions',      file: 'mopt/tr.md', bundled: true },
		],
		references: MOPT_REFERENCES,
	},
};

export function openMoptWebview(
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
			title: MOPT_TITLE,
			options: { retainContextWhenHidden: true },
			contentOptions: { allowScripts: true },
			extension: undefined,
		},
		MOPT_VIEW_TYPE,
		MOPT_TITLE,
		undefined,
		{ group: undefined, preserveFocus: false }
	);

	webviewInput.webview.setHtml(getMoptHtml());

	registerMoptWebviewHandlers(
		webviewInput,
		MOPT_METADATA,
		openerService,
		editorService,
		quickInputService,
		commandService,
		clipboardService,
		notificationService,
		initialModel,
	);
}
