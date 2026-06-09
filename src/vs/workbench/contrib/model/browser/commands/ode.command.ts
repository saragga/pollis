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
import { IOdeMetadata } from '../common/ode.types.js';
import { IModelReference, IModelNotebookSection } from '../common/model.types.js';
import { registerOdeWebviewHandlers } from '../handlers/ode.handler.js';
import { getOdeHtml } from '../webviews/ode.template.js';

const ODE_VIEW_TYPE = 'pollis.ode';
const ODE_TITLE = 'ODE Inference Methods';

const ODE_REFERENCES: IModelReference[] = [
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
		title: 'Differential Elimination for Dynamical Models via Projections with Applications to Structural Identifiability',
		authors: 'Dong, Ruiwen; Goodbrake, Christian; Harrington, Heather A.; Pogudin, Gleb',
		year: 2023,
		journal: 'SIAM Journal on Applied Algebra and Geometry',
		doi: '10.1137/22M1469067',
		openAccess: true,
	},
	{
		title: 'PEtab.jl: Advancing the Efficiency and Utility of Dynamic Modelling',
		authors: 'Persson, Sebastian; Frohlich, Fabian; Grein, Stephan; Loman, Torkel; Ognissanti, Damiano; Hasselgren, Viktor; Hasenauer, Jan; Cvijovic, Marija',
		year: 2025,
		journal: 'Bioinformatics',
		doi: '10.1093/bioinformatics/btaf497',
		openAccess: true,
	},
	{
		title: 'ModelingToolkit: A Composable Graph Transformation System for Equation-Based Modeling',
		authors: 'Ma, Yingbo; Gowda, Shashi; Anantharaman, Ranjan; Laughman, Chris; Shah, Viral; Rackauckas, Christopher',
		year: 2021,
		journal: 'arXiv preprint',
		doi: '10.48550/arXiv.2103.05244',
		openAccess: true,
	},
	{ separator: true, label: 'Textbooks' },
	{
		title: 'Nonlinear Regression Analysis and Its Applications',
		authors: 'Bates, Douglas M.; Watts, Donald G.',
		year: 1988,
		journal: 'Wiley',
		doi: '10.1002/9780470316757',
		openAccess: false,
	},
	{
		title: 'Dynamic Modelling and Parameter Estimation in Systems Biology',
		authors: 'Raue, Andreas; Kreutz, Clemens; Maiwald, Thomas; Bachmann, Julie; Schilling, Marcel; Timmer, Jens',
		year: 2009,
		journal: 'Bioinformatics',
		doi: '10.1093/bioinformatics/btp358',
		openAccess: false,
	},
	{ separator: true, label: 'Original Papers' },
	{
		title: 'PEtab: Interoperable Specification of Parameter Estimation Problems in Systems Biology',
		authors: 'Schmiester, Leonard; Schaelte, Yannik; Bergmann, Frank T.; Camba, Tacio; Dudkin, Erika; Egert, Janine; Frhlich, Fabian; Fuhrmann, Lara; Hauber, Adrian L.; Kemmer, Svenja; Lakrisenko, Polina; Loos, Carolin; Merkt, Simon; Muller, Wolfgang; Pathirana, Dilan; Raue, Andreas; Sahle, Sven; Schaber, Jorg; Stapor, Paul; Ulrich, Elba; Villaverde, Alejandro F.; Weindl, Daniel; Wierling, Christoph; Stelling, Joerg; Timmer, Jens; Hasenauer, Jan; Theis, Fabian',
		year: 2021,
		journal: 'PLOS Computational Biology',
		doi: '10.1371/journal.pcbi.1008646',
		openAccess: true,
	},
	{
		title: 'Structural and Practical Identifiability Analysis of Partially Observed Dynamical Models',
		authors: 'Raue, Andreas; Kreutz, Clemens; Maiwald, Thomas; Bachmann, Julie; Schilling, Marcel; Klingmuller, Ursula; Timmer, Jens',
		year: 2009,
		journal: 'Bioinformatics',
		doi: '10.1093/bioinformatics/btp358',
		openAccess: false,
	},
	{
		title: 'A Benchmark Study of Numerical Approaches for Fitting and Estimating Parameters of Biochemical Systems',
		authors: 'Raue, Andreas; Schilling, Marcel; Bachmann, Julie; Matteson, Andrew; Schelker, Max; Kaschek, Daniel; Hug, Sabine; Kreutz, Clemens; Harms, Brian D.; Theis, Fabian J.; Klingmuller, Ursula; Timmer, Jens',
		year: 2013,
		journal: 'PLOS ONE',
		doi: '10.1371/journal.pone.0075114',
		openAccess: true,
	},
];

export const ODE_NOTEBOOK_SECTIONS: IModelNotebookSection[] = [
	{
		label: 'Parameter Estimation',
		notebooks: [
			{ name: 'Basic Estimation',    file: 'ode/tutorial-01-basic-estimation.ipynb', bundled: true, description: 'Set up a PEtab problem and run single-start optimisation' },
			{ name: 'Multi-Start',         file: 'ode/tutorial-02-multistart.ipynb',        bundled: true, description: 'Run multi-start optimisation to find a global optimum' },
		],
	},
	{
		label: 'Uncertainty & Identifiability',
		notebooks: [
			{ name: 'Profile Likelihood',  file: 'ode/tutorial-03-profile-likelihood.ipynb', bundled: true, description: 'Compute profile likelihoods to quantify parameter uncertainty' },
			{ name: 'Identifiability',     file: 'ode/tutorial-04-identifiability.ipynb',     bundled: true, description: 'Assess structural and practical identifiability of parameters' },
		],
	},
];

const ODE_METADATA: IOdeMetadata = {
	ode: {
		packages: [
			{
				name: 'PEtab.jl',
				github: 'https://github.com/sebapersson/PEtab.jl',
				papers: [],
			},
			{
				name: 'StructuralIdentifiability.jl',
				github: 'https://github.com/SciML/StructuralIdentifiability.jl',
				papers: [],
			},
		],
		notebookSections: ODE_NOTEBOOK_SECTIONS,
		notebooks: ODE_NOTEBOOK_SECTIONS.flatMap(s => s.notebooks),
		wikis: [
			{ name: 'Factsheet',      file: 'ode/factsheet.md',      bundled: true },
			{ name: 'Overview',       file: 'ode/overview.md',        bundled: true },
			{ name: 'Assumptions',    file: 'ode/assumptions.md',     bundled: true },
			{ name: 'Diagnostics',    file: 'ode/diagnostics.md',     bundled: true },
			{ name: 'Interpretation', file: 'ode/interpretation.md',  bundled: true },
			{ name: 'Decision Guide', file: 'ode/decision-guide.md',  bundled: true },
			{ separator: true, label: 'Methods' },
			{ name: 'PEtab Format',    file: 'ode/petab-format.md',   bundled: true },
			{ name: 'Profile Likelihood', file: 'ode/profile-likelihood.md', bundled: true },
			{ name: 'Identifiability', file: 'ode/identifiability.md', bundled: true },
		],
		references: ODE_REFERENCES,
	},
};

export function openOdeWebview(
	webviewWorkbenchService: IWebviewWorkbenchService,
	openerService: IOpenerService,
	editorService: IEditorService,
	quickInputService: IQuickInputService,
	commandService: ICommandService,
	clipboardService: IClipboardService,
	notificationService: INotificationService,
): void {
	const webviewInput = webviewWorkbenchService.openWebview(
		{
			title: ODE_TITLE,
			options: { retainContextWhenHidden: true },
			contentOptions: { allowScripts: true },
			extension: undefined,
		},
		ODE_VIEW_TYPE,
		ODE_TITLE,
		undefined,
		{ group: undefined, preserveFocus: false }
	);

	webviewInput.webview.setHtml(getOdeHtml());

	registerOdeWebviewHandlers(
		webviewInput,
		ODE_METADATA,
		openerService,
		editorService,
		quickInputService,
		commandService,
		clipboardService,
		notificationService,
	);
}
