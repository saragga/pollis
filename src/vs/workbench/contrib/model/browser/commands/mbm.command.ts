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
import { IMbmMetadata } from '../common/mbm.types.js';
import { IModelReference, IModelNotebookSection } from '../common/model.types.js';
import { registerMbmWebviewHandlers } from '../handlers/mbm.handler.js';
import { getMbmHtml } from '../webviews/mbm.template.js';

const MBM_VIEW_TYPE = 'pollis.mbm';
const MBM_TITLE = 'Model-Based Methods';

const MBM_REFERENCES: IModelReference[] = [
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
		title: 'The NLopt Nonlinear-Optimisation Package',
		authors: 'Johnson, Steven G.',
		year: 2007,
		journal: 'GitHub',
		openAccess: true,
	},
	{
		title: 'PRIMA: Reference Implementations for Powell\'s Methods with Modernization and Amelioration',
		authors: 'Zhang, Zaikun',
		year: 2023,
		journal: 'GitHub',
		openAccess: true,
	},
	{ separator: true, label: 'Textbooks' },
	{
		title: 'Introduction to Derivative-Free Optimization',
		authors: 'Conn, Andrew R.; Scheinberg, Katya; Vicente, Lu&#237;s N.',
		year: 2009,
		journal: 'SIAM',
		doi: '10.1137/1.9780898718768',
		openAccess: false,
	},
	{
		title: 'Numerical Optimization',
		authors: 'Nocedal, Jorge; Wright, Stephen J.',
		year: 2006,
		journal: 'Springer',
		doi: '10.1007/978-0-387-40065-5',
		openAccess: false,
	},
	{ separator: true, label: 'Original Papers' },
	{
		title: 'A Direct Search Optimisation Method That Models the Objective and Constraint Functions by Linear Interpolation',
		authors: 'Powell, Michael J.D.',
		year: 1994,
		journal: 'Advances in Optimization and Numerical Analysis',
		doi: '10.1007/978-94-015-8330-5_4',
		openAccess: false,
	},
	{
		title: 'The BOBYQA Algorithm for Bound Constrained Optimisation Without Derivatives',
		authors: 'Powell, Michael J.D.',
		year: 2009,
		journal: 'Report DAMTP 2009/NA06, University of Cambridge',
		openAccess: true,
	},
	{
		title: 'The NEWUOA Software for Unconstrained Optimisation Without Derivatives',
		authors: 'Powell, Michael J.D.',
		year: 2006,
		journal: 'Large-Scale Nonlinear Optimization, Springer',
		doi: '10.1007/0-387-30065-1_16',
		openAccess: false,
	},
	{
		title: 'UOBYQA: Unconstrained Optimisation by Quadratic Approximation',
		authors: 'Powell, Michael J.D.',
		year: 2002,
		journal: 'Mathematical Programming',
		doi: '10.1007/s101070100290',
		openAccess: false,
	},
	{
		title: 'On Fast Trust Region Methods for Quadratic Models with Linear Constraints',
		authors: 'Powell, Michael J.D.',
		year: 2015,
		journal: 'Mathematical Programming Computation',
		doi: '10.1007/s12532-015-0084-4',
		openAccess: false,
	},
	{
		title: 'Algorithms for Minimization without Derivatives',
		authors: 'Brent, Richard P.',
		year: 1973,
		journal: 'Prentice-Hall',
		openAccess: false,
	},
	{
		title: 'Functional Stability Analysis of Numerical Algorithms',
		authors: 'Rowan, Tom H.',
		year: 1990,
		journal: 'PhD Thesis, University of Texas at Austin',
		openAccess: false,
	},
];

export const MBM_NOTEBOOK_SECTIONS: IModelNotebookSection[] = [
	{
		label: '',
		notebooks: [
			{
				name: 'COBYLA',
				file: 'mbm/tutorial-01-cobyla.ipynb',
				bundled: true,
				description: 'Constrained optimisation by linear approximation with nonlinear inequality constraints',
			},
			{
				name: 'BOBYQA',
				file: 'mbm/tutorial-02-bobyqa.ipynb',
				bundled: true,
				description: 'Bound-constrained optimisation by quadratic approximation without derivatives',
			},
			{
				name: 'NEWUOA',
				file: 'mbm/tutorial-03-newuoa.ipynb',
				bundled: true,
				description: 'Unconstrained optimisation via new quadratic interpolation model updates',
			},
			{
				name: 'UOBYQA',
				file: 'mbm/tutorial-04-uobyqa.ipynb',
				bundled: true,
				description: 'Unconstrained optimisation by quadratic approximation: full quadratic models',
			},
			{
				name: 'LINCOA',
				file: 'mbm/tutorial-05-lincoa.ipynb',
				bundled: true,
				description: 'Linearly constrained optimisation by quadratic approximation',
			},
			{
				name: 'PRAXIS',
				file: 'mbm/tutorial-06-praxis.ipynb',
				bundled: true,
				description: 'Principal axis method: Brent\'s derivative-free minimisation along conjugate directions',
			},
			{
				name: 'Sbplx',
				file: 'mbm/tutorial-07-sbplx.ipynb',
				bundled: true,
				description: 'Subplex method: Nelder-Mead on adaptive subspaces for high-dimensional problems',
			},
		],
	},
];

const MBM_METADATA: IMbmMetadata = {
	mbm: {
		packages: [
			{
				name: 'NLopt.jl',
				github: 'https://github.com/JuliaOpt/NLopt.jl',
				papers: [],
			},
			{
				name: 'PRIMA.jl',
				github: 'https://github.com/libprima/PRIMA.jl',
				papers: [],
			},
		],
		notebookSections: MBM_NOTEBOOK_SECTIONS,
		notebooks: MBM_NOTEBOOK_SECTIONS.flatMap(s => s.notebooks),
		wikis: [
			{ name: 'Factsheet',      file: 'mbm/factsheet.md',      bundled: true },
			{ name: 'Overview',       file: 'mbm/overview.md',        bundled: true },
			{ name: 'Assumptions',    file: 'mbm/assumptions.md',     bundled: true },
			{ name: 'Diagnostics',    file: 'mbm/diagnostics.md',     bundled: true },
			{ name: 'Interpretation', file: 'mbm/interpretation.md',  bundled: true },
			{ name: 'Decision Guide', file: 'mbm/decision-guide.md',  bundled: true },
			{ separator: true, label: 'Algorithm Details' },
			{ name: 'COBYLA',   file: 'mbm/cobyla.md',   bundled: true },
			{ name: 'BOBYQA',   file: 'mbm/bobyqa.md',   bundled: true },
			{ name: 'NEWUOA',   file: 'mbm/newuoa.md',   bundled: true },
			{ name: 'UOBYQA',   file: 'mbm/uobyqa.md',   bundled: true },
			{ name: 'LINCOA',   file: 'mbm/lincoa.md',   bundled: true },
			{ name: 'PRAXIS',   file: 'mbm/praxis.md',   bundled: true },
			{ name: 'Sbplx',    file: 'mbm/sbplx.md',    bundled: true },
		],
		references: MBM_REFERENCES,
	},
};

export function openMbmWebview(
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
			title: MBM_TITLE,
			options: { retainContextWhenHidden: true },
			contentOptions: { allowScripts: true },
			extension: undefined,
		},
		MBM_VIEW_TYPE,
		MBM_TITLE,
		undefined,
		{ group: undefined, preserveFocus: false }
	);

	webviewInput.webview.setHtml(getMbmHtml());

	registerMbmWebviewHandlers(
		webviewInput,
		MBM_METADATA,
		openerService,
		editorService,
		quickInputService,
		commandService,
		clipboardService,
		notificationService,
		initialModel,
	);
}
