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
import { IHnsMetadata } from '../common/hns.types.js';
import { registerHnsWebviewHandlers } from '../handlers/hns.handler.js';
import { getHnsHtml } from '../webviews/hns.template.js';

const HNS_VIEW_TYPE = 'pollis.hns';
const HNS_TITLE = 'Neighbourhood Search';

const HNS_REFERENCES: IModelReference[] = [
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
		authors: 'Mogensen, Patrick Kofod; Riseth, Asbjørn Nilsen',
		year: 2018,
		journal: 'Journal of Open Source Software',
		doi: '10.21105/joss.00615',
		openAccess: true,
	},
	{ separator: true, label: 'Original Papers' },
	{
		title: 'Global Optimization by Controlled Random Search',
		authors: 'Price, W. L.',
		year: 1983,
		journal: 'Journal of Optimization Theory and Applications',
		doi: '10.1007/BF00934495',
		openAccess: false,
	},
	{
		title: 'Iterated Local Search: Framework and Applications',
		authors: 'Lourenço, Helena R.; Martin, Olivier C.; Stützle, Thomas',
		year: 2003,
		journal: 'Handbook of Metaheuristics',
		doi: '10.1007/0-306-48056-5_11',
		openAccess: false,
	},
	{
		title: 'Using Constraint Programming and Local Search Methods to Solve Vehicle Routing Problems',
		authors: 'Shaw, Paul',
		year: 1998,
		journal: 'International Conference on Principles and Practice of Constraint Programming',
		doi: '10.1007/3-540-49481-2_30',
		openAccess: false,
	},
	{
		title: 'An Adaptive Large Neighborhood Search Heuristic for the Pickup and Delivery Problem with Time Windows',
		authors: 'Ropke, Stefan; Pisinger, David',
		year: 2006,
		journal: 'Transportation Science',
		doi: '10.1287/trsc.1050.0135',
		openAccess: false,
	},
	{
		title: 'Global Optimization by Basin-Hopping and the Lowest Energy Structures of Lennard-Jones Clusters Containing up to 110 Atoms',
		authors: 'Wales, David J.; Doye, Jonathan P. K.',
		year: 1997,
		journal: 'Journal of Physical Chemistry A',
		doi: '10.1021/jp970984n',
		openAccess: false,
	},
	{
		title: 'Optimization by Simulated Annealing',
		authors: 'Kirkpatrick, S.; Gelatt, C. D.; Vecchi, M. P.',
		year: 1983,
		journal: 'Science',
		doi: '10.1126/science.220.4598.671',
		openAccess: false,
	},
];

export const HNS_NOTEBOOK_SECTIONS: IModelNotebookSection[] = [
	{
		label: '',
		notebooks: [
			{
				name: 'CRS',
				file: 'hns/tutorial-01-crs.ipynb',
				bundled: true,
				description: 'Controlled Random Search: population-based gradient-free global optimisation via NLopt',
			},
			{
				name: 'ILS',
				file: 'hns/tutorial-02-ils.ipynb',
				bundled: true,
				description: 'Iterated Local Search: alternate local descent with random perturbations to escape local optima',
			},
			{
				name: 'LNS & ALNS',
				file: 'hns/tutorial-03-lns-alns.ipynb',
				bundled: true,
				description: 'Large Neighbourhood Search and its adaptive variant: destroy/repair cycles over the feasible region',
			},
			{
				name: 'Basin-Hopping & SA',
				file: 'hns/tutorial-04-bh-sa.ipynb',
				bundled: true,
				description: 'Basin-Hopping and Simulated Annealing: perturbation-based acceptance strategies for rugged landscapes',
			},
		],
	},
];

const HNS_METADATA: IHnsMetadata = {
	hns: {
		packages: [
			{
				name: 'NLopt.jl',
				github: 'https://github.com/JuliaOpt/NLopt.jl',
				papers: [],
			},
			{
				name: 'Optim.jl',
				github: 'https://github.com/JuliaNLSolvers/Optim.jl',
				papers: [],
			},
		],
		notebookSections: HNS_NOTEBOOK_SECTIONS,
		notebooks: HNS_NOTEBOOK_SECTIONS.flatMap(s => s.notebooks),
		wikis: [
			{ name: 'Factsheet',      file: 'hns/factsheet.md',      bundled: true },
			{ name: 'Overview',       file: 'hns/overview.md',        bundled: true },
			{ name: 'Assumptions',    file: 'hns/assumptions.md',     bundled: true },
			{ name: 'Diagnostics',    file: 'hns/diagnostics.md',     bundled: true },
			{ name: 'Interpretation', file: 'hns/interpretation.md',  bundled: true },
			{ name: 'Decision Guide', file: 'hns/decision-guide.md',  bundled: true },
			{ separator: true, label: 'Algorithm Details' },
			{ name: 'CRS',  file: 'hns/crs.md',  bundled: true },
			{ name: 'ILS',  file: 'hns/ils.md',  bundled: true },
			{ name: 'LNS',  file: 'hns/lns.md',  bundled: true },
			{ name: 'ALNS', file: 'hns/alns.md', bundled: true },
			{ name: 'Basin-Hopping', file: 'hns/bh.md', bundled: true },
			{ name: 'Simulated Annealing', file: 'hns/sa.md', bundled: true },
		],
		references: HNS_REFERENCES,
	},
};

export function openHnsWebview(
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
			title: HNS_TITLE,
			options: { retainContextWhenHidden: true },
			contentOptions: { allowScripts: true },
			extension: undefined,
		},
		HNS_VIEW_TYPE,
		HNS_TITLE,
		undefined,
		{ group: undefined, preserveFocus: false }
	);

	webviewInput.webview.setHtml(getHnsHtml());

	registerHnsWebviewHandlers(
		webviewInput,
		HNS_METADATA,
		openerService,
		editorService,
		quickInputService,
		commandService,
		clipboardService,
		notificationService,
		initialModel,
	);
}
