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
import { ILpMetadata } from '../common/lp.types.js';
import { IModelReference, IModelNotebookSection } from '../common/model.types.js';
import { registerLpWebviewHandlers } from '../handlers/lp.handler.js';
import { getLpHtml } from '../webviews/lp.template.js';

const LP_VIEW_TYPE = 'pollis.lp';
const LP_TITLE = 'Linear Programming';

const LP_REFERENCES: IModelReference[] = [
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
		title: 'HiGHS: High Performance Software for Linear Optimization',
		authors: 'Huangfu, Qi; Hall, J. A. Julian',
		year: 2018,
		journal: 'Mathematical Programming Computation',
		doi: '10.1007/s12532-017-0130-5',
		openAccess: false,
	},
	{ separator: true, label: 'Textbooks' },
	{
		title: 'Linear and Nonlinear Programming',
		authors: 'Luenberger, David G.; Ye, Yinyu',
		year: 2016,
		journal: 'Springer (4th ed.)',
		doi: '10.1007/978-3-319-18842-3',
		openAccess: false,
	},
	{
		title: 'Introduction to Linear Optimization',
		authors: 'Bertsimas, Dimitris; Tsitsiklis, John N.',
		year: 1997,
		journal: 'Athena Scientific',
		url: 'https://www.athenasc.com/linoptbook.html',
		openAccess: false,
	},
	{ separator: true, label: 'Original Papers' },
	{
		title: 'Maximization of a Linear Function of Variables Subject to Linear Inequalities',
		authors: 'Dantzig, George B.',
		year: 1951,
		journal: 'Activity Analysis of Production and Allocation (Koopmans ed.)',
		url: 'https://www.rand.org/pubs/research_memoranda/RM1723.html',
		openAccess: false,
	},
	{
		title: 'An Automatic Method for Solving Discrete Programming Problems',
		authors: 'Land, Ailsa H.; Doig, Alison G.',
		year: 1960,
		journal: 'Econometrica',
		doi: '10.2307/1910129',
		openAccess: false,
	},
];

export const LP_NOTEBOOK_SECTIONS: IModelNotebookSection[] = [
	{
		label: 'Linear Programming',
		notebooks: [
			{ name: 'Basic LP',            file: 'lp/tutorial-01-basic-lp.ipynb',           bundled: true, description: 'Formulate and solve a linear programme with JuMP and HiGHS' },
			{ name: 'Sensitivity Analysis', file: 'lp/tutorial-02-sensitivity-analysis.ipynb', bundled: true, description: 'Compute shadow prices and right-hand side ranges at the optimum' },
		],
	},
	{
		label: 'Mixed-Integer Linear Programming',
		notebooks: [
			{ name: 'Basic MILP',          file: 'lp/tutorial-03-basic-milp.ipynb',          bundled: true, description: 'Formulate and solve a mixed-integer linear programme with branch-and-bound' },
		],
	},
];

const LP_METADATA: ILpMetadata = {
	lp: {
		packages: [
			{
				name: 'JuMP.jl',
				github: 'https://github.com/jump-dev/JuMP.jl',
				papers: [],
			},
			{
				name: 'HiGHS.jl',
				github: 'https://github.com/jump-dev/HiGHS.jl',
				papers: [],
			},
			{
				name: 'Clp.jl',
				github: 'https://github.com/jump-dev/Clp.jl',
				papers: [],
			},
			{
				name: 'GLPK.jl',
				github: 'https://github.com/jump-dev/GLPK.jl',
				papers: [],
			},
		],
		notebookSections: LP_NOTEBOOK_SECTIONS,
		notebooks: LP_NOTEBOOK_SECTIONS.flatMap(s => s.notebooks),
		wikis: [
			{ name: 'Factsheet',      file: 'lp/factsheet.md',      bundled: true },
			{ name: 'Overview',       file: 'lp/overview.md',        bundled: true },
			{ name: 'Assumptions',    file: 'lp/assumptions.md',     bundled: true },
			{ name: 'Diagnostics',    file: 'lp/diagnostics.md',     bundled: true },
			{ name: 'Interpretation', file: 'lp/interpretation.md',  bundled: true },
			{ name: 'Decision Guide', file: 'lp/decision-guide.md',  bundled: true },
			{ separator: true, label: 'Methods' },
			{ name: 'LP',             file: 'lp/lp.md',              bundled: true },
			{ name: 'MILP',           file: 'lp/milp.md',            bundled: true },
			{ name: 'Duality',        file: 'lp/duality.md',         bundled: true },
		],
		references: LP_REFERENCES,
	},
};

export function openLpWebview(
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
			title: LP_TITLE,
			options: { retainContextWhenHidden: true },
			contentOptions: { allowScripts: true },
			extension: undefined,
		},
		LP_VIEW_TYPE,
		LP_TITLE,
		undefined,
		{ group: undefined, preserveFocus: false }
	);

	webviewInput.webview.setHtml(getLpHtml());

	registerLpWebviewHandlers(
		webviewInput,
		LP_METADATA,
		openerService,
		editorService,
		quickInputService,
		commandService,
		clipboardService,
		notificationService,
		initialModel,
	);
}
