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
import { IRoptMetadata } from '../common/ropt.types.js';
import { registerRoptWebviewHandlers } from '../handlers/ropt.handler.js';
import { getRoptHtml } from '../webviews/ropt.template.js';

const ROPT_VIEW_TYPE = 'pollis.ropt';
const ROPT_TITLE = 'Uncertainty-Set Robust Optimisation';

const ROPT_REFERENCES: IModelReference[] = [
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
		title: 'HiGHS: Serial and Parallel Solution of Linear Programming',
		authors: 'Huangfu, Qi; Hall, J.A.J.',
		year: 2018,
		journal: 'Mathematical Programming Computation',
		doi: '10.1007/s12532-017-0130-5',
		openAccess: true,
	},
	{
		title: 'Clarabel: An Interior-Point Solver for Conic Programs with Quadratic Objectives',
		authors: 'Goulart, Paul J.; Chen, Yuwen',
		year: 2024,
		journal: 'arXiv',
		doi: '10.48550/arXiv.2405.14674',
		openAccess: true,
	},
	{ separator: true, label: 'Textbooks' },
	{
		title: 'Robust Optimization',
		authors: 'Ben-Tal, Aharon; El Ghaoui, Laurent; Nemirovski, Arkadi',
		year: 2009,
		journal: 'Princeton University Press',
		doi: '10.1515/9781400831050',
		openAccess: false,
	},
	{
		title: 'Introduction to Linear Optimization',
		authors: 'Bertsimas, Dimitris; Tsitsiklis, John N.',
		year: 1997,
		journal: 'Athena Scientific',
		openAccess: false,
	},
	{ separator: true, label: 'Original Papers' },
	{
		title: 'Convex Programming with Set-Inclusive Constraints and Applications to Inexact Linear Programming',
		authors: 'Soyster, Allen L.',
		year: 1973,
		journal: 'Operations Research',
		doi: '10.1287/opre.21.5.1154',
		openAccess: false,
	},
	{
		title: 'Robust Convex Optimization',
		authors: 'Ben-Tal, Aharon; Nemirovski, Arkadi',
		year: 1998,
		journal: 'Mathematics of Operations Research',
		doi: '10.1287/moor.23.4.769',
		openAccess: false,
	},
	{
		title: 'The Price of Robustness',
		authors: 'Bertsimas, Dimitris; Sim, Melvyn',
		year: 2004,
		journal: 'Operations Research',
		doi: '10.1287/opre.1030.0065',
		openAccess: false,
	},
	{
		title: 'Robust Discrete Optimization and Network Flows',
		authors: 'Bertsimas, Dimitris; Sim, Melvyn',
		year: 2003,
		journal: 'Mathematical Programming',
		doi: '10.1007/s10107-003-0396-4',
		openAccess: false,
	},
];

export const ROPT_NOTEBOOK_SECTIONS: IModelNotebookSection[] = [
	{
		label: '',
		notebooks: [
			{
				name: 'Box Uncertainty',
				file: 'ropt/tutorial-01-box.ipynb',
				bundled: true,
				description: 'LP robust counterpart for box uncertainty: component-wise bounds reformulated as LP with auxiliary variables via JuMP and HiGHS',
			},
			{
				name: 'Ellipsoidal Uncertainty',
				file: 'ropt/tutorial-02-ellipsoidal.ipynb',
				bundled: true,
				description: 'SOCP robust counterpart for ellipsoidal uncertainty: norm-bounded perturbations reformulated as second-order cone constraints via Clarabel',
			},
			{
				name: 'Budgeted Uncertainty',
				file: 'ropt/tutorial-03-budgeted.ipynb',
				bundled: true,
				description: 'LP robust counterpart for Bertsimas-Sim budgeted uncertainty: at most k parameters deviate; conservatism controlled by the budget parameter',
			},
			{
				name: 'Polyhedral Uncertainty',
				file: 'ropt/tutorial-04-polyhedral.ipynb',
				bundled: true,
				description: 'LP robust counterpart for polyhedral uncertainty via LP duality; most general linear uncertainty set description',
			},
		],
	},
];

const ROPT_METADATA: IRoptMetadata = {
	ropt: {
		packages: [
			{ name: 'JuMP.jl',     github: 'https://github.com/jump-dev/JuMP.jl',            papers: [] },
			{ name: 'HiGHS.jl',    github: 'https://github.com/jump-dev/HiGHS.jl',           papers: [] },
			{ name: 'Clarabel.jl', github: 'https://github.com/oxfordcontrol/Clarabel.jl',   papers: [] },
		],
		notebookSections: ROPT_NOTEBOOK_SECTIONS,
		notebooks: ROPT_NOTEBOOK_SECTIONS.flatMap(s => s.notebooks),
		wikis: [
			{ name: 'Factsheet',      file: 'ropt/factsheet.md',      bundled: true },
			{ name: 'Overview',       file: 'ropt/overview.md',        bundled: true },
			{ name: 'Assumptions',    file: 'ropt/assumptions.md',     bundled: true },
			{ name: 'Diagnostics',    file: 'ropt/diagnostics.md',     bundled: true },
			{ name: 'Interpretation', file: 'ropt/interpretation.md',  bundled: true },
			{ name: 'Decision Guide', file: 'ropt/decision-guide.md',  bundled: true },
			{ separator: true, label: 'Uncertainty Sets' },
			{ name: 'Box Uncertainty',        file: 'ropt/box.md',        bundled: true },
			{ name: 'Ellipsoidal Uncertainty', file: 'ropt/ellipsoidal.md', bundled: true },
			{ name: 'Budgeted Uncertainty',    file: 'ropt/budgeted.md',   bundled: true },
			{ name: 'Polyhedral Uncertainty',  file: 'ropt/polyhedral.md', bundled: true },
		],
		references: ROPT_REFERENCES,
	},
};

export function openRoptWebview(
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
			title: ROPT_TITLE,
			options: { retainContextWhenHidden: true },
			contentOptions: { allowScripts: true },
			extension: undefined,
		},
		ROPT_VIEW_TYPE,
		ROPT_TITLE,
		undefined,
		{ group: undefined, preserveFocus: false }
	);

	webviewInput.webview.setHtml(getRoptHtml());

	registerRoptWebviewHandlers(
		webviewInput,
		ROPT_METADATA,
		openerService,
		editorService,
		quickInputService,
		commandService,
		clipboardService,
		notificationService,
		initialModel,
	);
}
