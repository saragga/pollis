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
import { ISgoMetadata } from '../common/sgo.types.js';
import { IModelReference, IModelNotebookSection } from '../common/model.types.js';
import { registerSgoWebviewHandlers } from '../handlers/sgo.handler.js';
import { getSgoHtml } from '../webviews/sgo.template.js';

const SGO_VIEW_TYPE = 'pollis.sgo';
const SGO_TITLE = 'Stochastic Global Methods';

const SGO_REFERENCES: IModelReference[] = [
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
		title: 'Optim: A Mathematical Optimization Package for Julia',
		authors: 'Mogensen, Patrick K.; Riseth, Asbjorn N.',
		year: 2018,
		journal: 'Journal of Open Source Software',
		doi: '10.21105/joss.00615',
		openAccess: true,
	},
	{ separator: true, label: 'Textbooks' },
	{
		title: 'Introduction to Global Optimization',
		authors: 'Neumaier, Arnold',
		year: 2004,
		journal: 'Cambridge University Press',
		doi: '10.1017/CBO9780511569029',
		openAccess: false,
	},
	{
		title: 'Deterministic Global Optimization',
		authors: 'Floudas, Christodoulos A.',
		year: 2000,
		journal: 'Springer',
		doi: '10.1007/978-1-4757-4949-6',
		openAccess: false,
	},
	{ separator: true, label: 'Original Papers' },
	{
		title: 'Global Optimization by Controlled Random Search',
		authors: 'Price, W. L.',
		year: 1983,
		journal: 'Journal of Optimization Theory and Applications',
		doi: '10.1007/BF00933504',
		openAccess: false,
	},
	{
		title: 'Stochastic Global Optimization Methods Part I: Clustering Methods',
		authors: 'Rinnooy Kan, A. H. G.; Timmer, G. T.',
		year: 1987,
		journal: 'Mathematical Programming',
		doi: '10.1007/BF02592071',
		openAccess: false,
	},
	{
		title: 'A Global Search Method for Optimizing Nonlinear Systems',
		authors: 'Stuckman, B. E.',
		year: 1988,
		journal: 'IEEE Transactions on Systems, Man, and Cybernetics',
		doi: '10.1109/21.87070',
		openAccess: false,
	},
	{
		title: 'Optimization by Simulated Annealing',
		authors: 'Kirkpatrick, Scott; Gelatt, C. D.; Vecchi, M. P.',
		year: 1983,
		journal: 'Science',
		doi: '10.1126/science.220.4598.671',
		openAccess: false,
	},
	{
		title: 'Global Optimization of Statistical Functions with Simulated Annealing',
		authors: 'Goffe, William L.; Ferrier, Gary D.; Rogers, John',
		year: 1994,
		journal: 'Journal of Econometrics',
		doi: '10.1016/0304-4076(94)90038-8',
		openAccess: false,
	},
	{
		title: 'Global Optimization by Basin-Hopping and the Lowest Energy Structures of Lennard-Jones Clusters Containing up to 110 Atoms',
		authors: 'Wales, David J.; Doye, Jonathan P. K.',
		year: 1997,
		journal: 'Journal of Physical Chemistry A',
		doi: '10.1021/jp9803344',
		openAccess: false,
	},
	{
		title: 'Global Search Based on Efficient Diagonal Partitions and a Set of Lipschitz Constants',
		authors: 'Sergeyev, Yaroslav D.; Kvasov, Dmitri E.',
		year: 2006,
		journal: 'SIAM Journal on Optimization',
		doi: '10.1137/040621132',
		openAccess: false,
	},
];

export const SGO_NOTEBOOK_SECTIONS: IModelNotebookSection[] = [
	{
		label: '',
		notebooks: [
			{
				name: 'CRS & MLSL',
				file: 'sgo/tutorial-01-crs-mlsl.ipynb',
				bundled: true,
				description: 'Controlled Random Search and MLSL with NLopt.jl: setup, bounds, and convergence',
			},
			{
				name: 'StoGO',
				file: 'sgo/tutorial-02-stogo.ipynb',
				bundled: true,
				description: 'Stochastic branch-and-bound (StoGO and StoGO-R) with NLopt.jl',
			},
			{
				name: 'Simulated Annealing',
				file: 'sgo/tutorial-03-sa.ipynb',
				bundled: true,
				description: 'Bounded simulated annealing (SAMIN) with Optim.jl: temperature schedule and bounds',
			},
			{
				name: 'AGS',
				file: 'sgo/tutorial-04-ags.ipynb',
				bundled: true,
				description: 'Adaptive global search (AGS) with NLopt.jl: Lipschitz-model-based global optimisation',
			},
			{
				name: 'Basin-Hopping',
				file: 'sgo/tutorial-05-bh.ipynb',
				bundled: true,
				description: 'Basin-hopping with Basinhopping.jl: random perturbation + local descent with Metropolis acceptance',
			},
		],
	},
];

const SGO_METADATA: ISgoMetadata = {
	sgo: {
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
			{
				name: 'Basinhopping.jl',
				github: 'https://github.com/gamatos/Basinhopping.jl',
				papers: [],
			},
		],
		notebookSections: SGO_NOTEBOOK_SECTIONS,
		notebooks: SGO_NOTEBOOK_SECTIONS.flatMap(s => s.notebooks),
		wikis: [
			{ name: 'Factsheet',      file: 'sgo/factsheet.md',      bundled: true },
			{ name: 'Overview',       file: 'sgo/overview.md',        bundled: true },
			{ name: 'Assumptions',    file: 'sgo/assumptions.md',     bundled: true },
			{ name: 'Diagnostics',    file: 'sgo/diagnostics.md',     bundled: true },
			{ name: 'Interpretation', file: 'sgo/interpretation.md',  bundled: true },
			{ name: 'Decision Guide', file: 'sgo/decision-guide.md',  bundled: true },
			{ separator: true, label: 'Algorithm Details' },
			{ name: 'CRS',                file: 'sgo/crs.md',    bundled: true },
			{ name: 'MLSL',               file: 'sgo/mlsl.md',   bundled: true },
			{ name: 'StoGO & StoGO-R',    file: 'sgo/stogo.md',  bundled: true },
			{ name: 'Simulated Annealing', file: 'sgo/sa.md',     bundled: true },
			{ name: 'AGS',                file: 'sgo/ags.md',    bundled: true },
			{ name: 'Basin-Hopping',      file: 'sgo/bh.md',     bundled: true },
		],
		references: SGO_REFERENCES,
	},
};

export function openSgoWebview(
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
			title: SGO_TITLE,
			options: { retainContextWhenHidden: true },
			contentOptions: { allowScripts: true },
			extension: undefined,
		},
		SGO_VIEW_TYPE,
		SGO_TITLE,
		undefined,
		{ group: undefined, preserveFocus: false }
	);

	webviewInput.webview.setHtml(getSgoHtml());

	registerSgoWebviewHandlers(
		webviewInput,
		SGO_METADATA,
		openerService,
		editorService,
		quickInputService,
		commandService,
		clipboardService,
		notificationService,
		initialModel,
	);
}
