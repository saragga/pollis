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
import { IModelReference, IModelNotebookSection } from '../common/model.types.js';
import { IMdpMetadata } from '../common/mdp.types.js';
import { registerMdpWebviewHandlers } from '../handlers/mdp.handler.js';
import { getMdpHtml } from '../webviews/mdp.template.js';

const MDP_VIEW_TYPE = 'pollis.mdp';
const MDP_TITLE = 'Single-Agent Decision Processes';

const MDP_REFERENCES: IModelReference[] = [
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
		title: 'POMDPs.jl: A Framework for Sequential Decision Making under Uncertainty',
		authors: 'Egorov, Maxim; Sunberg, Zachary N.; Balaban, Edward; Wheeler, Tim A.; Gupta, Jayesh K.; Kochenderfer, Mykel J.',
		year: 2017,
		journal: 'Journal of Machine Learning Research',
		url: 'https://jmlr.org/papers/v18/16-300.html',
		openAccess: true,
	},
	{ separator: true, label: 'Textbooks' },
	{
		title: 'Markov Decision Processes: Discrete Stochastic Dynamic Programming',
		authors: 'Puterman, Martin L.',
		year: 2005,
		journal: 'Wiley (2nd ed.)',
		doi: '10.1002/9780470316887',
		openAccess: false,
	},
	{
		title: 'Decision Making Under Uncertainty: Theory and Application',
		authors: 'Kochenderfer, Mykel J.',
		year: 2015,
		journal: 'MIT Press',
		url: 'https://mitpress.mit.edu/9780262029254/',
		openAccess: false,
	},
	{ separator: true, label: 'Original Papers' },
	{
		title: 'Planning and Acting in Partially Observable Stochastic Domains',
		authors: 'Kaelbling, Leslie Pack; Littman, Michael L.; Cassandra, Anthony R.',
		year: 1998,
		journal: 'Artificial Intelligence',
		doi: '10.1016/S0004-3702(98)00023-X',
		openAccess: false,
	},
	{
		title: 'Point-Based Value Iteration: An Anytime Algorithm for POMDPs',
		authors: 'Pineau, Joelle; Gordon, Geoff; Thrun, Sebastian',
		year: 2003,
		journal: 'IJCAI',
		url: 'https://www.ijcai.org/Proceedings/03/Papers/147.pdf',
		openAccess: true,
	},
	{
		title: 'Markov Decision Processes in Continuous Time',
		authors: 'Puterman, Martin L.',
		year: 1994,
		journal: 'Wiley',
		openAccess: false,
	},
];

export const MDP_NOTEBOOK_SECTIONS: IModelNotebookSection[] = [
	{
		label: '',
		notebooks: [
			{
				name: 'MDP: Inventory Control',
				file: 'mdp/tutorial-01-mdp-inventory.ipynb',
				bundled: true,
				description: 'Inventory control MDP via POMDPs.jl and DiscreteValueIteration.jl: state/action/transition/reward specification, value iteration, and policy extraction',
			},
			{
				name: 'POMDP: Tiger Problem',
				file: 'mdp/tutorial-02-pomdp-tiger.ipynb',
				bundled: true,
				description: 'Classic Tiger POMDP via POMDPs.jl and QMDP.jl: belief state planning, observation model, and policy evaluation under partial observability',
			},
			{
				name: 'POMDP: SARSOP Solver',
				file: 'mdp/tutorial-03-pomdp-sarsop.ipynb',
				bundled: true,
				description: 'Point-based POMDP solution via SARSOP.jl: alpha-vector representation, anytime convergence, and comparison with QMDP approximation',
			},
			{
				name: 'Semi-MDP: Machine Maintenance',
				file: 'mdp/tutorial-04-smdp-maintenance.ipynb',
				bundled: true,
				description: 'Semi-MDP machine maintenance via POMDPs.jl: variable holding times, effective discounting, and comparison with fixed-epoch MDP formulation',
			},
		],
	},
];

const MDP_METADATA: IMdpMetadata = {
	mdp: {
		packages: [
			{ name: 'POMDPs.jl',               github: 'https://github.com/JuliaPOMDP/POMDPs.jl',                       papers: [] },
			{ name: 'DiscreteValueIteration.jl', github: 'https://github.com/JuliaPOMDP/DiscreteValueIteration.jl',       papers: [] },
			{ name: 'QMDP.jl',                  github: 'https://github.com/JuliaPOMDP/QMDP.jl',                         papers: [] },
			{ name: 'MCTS.jl',                  github: 'https://github.com/JuliaPOMDP/MCTS.jl',                         papers: [] },
		],
		notebookSections: MDP_NOTEBOOK_SECTIONS,
		notebooks: MDP_NOTEBOOK_SECTIONS.flatMap(s => s.notebooks),
		wikis: [
			{ name: 'Factsheet',      file: 'mdp/factsheet.md',      bundled: true },
			{ name: 'Overview',       file: 'mdp/overview.md',        bundled: true },
			{ name: 'Assumptions',    file: 'mdp/assumptions.md',     bundled: true },
			{ name: 'Diagnostics',    file: 'mdp/diagnostics.md',     bundled: true },
			{ name: 'Interpretation', file: 'mdp/interpretation.md',  bundled: true },
			{ name: 'Decision Guide', file: 'mdp/decision-guide.md',  bundled: true },
			{ separator: true, label: 'Models' },
			{ name: 'MDP',       file: 'mdp/mdp.md',       bundled: true },
			{ name: 'POMDP',     file: 'mdp/pomdp.md',     bundled: true },
			{ name: 'Semi-MDP',  file: 'mdp/smdp.md',      bundled: true },
		],
		references: MDP_REFERENCES,
	},
};

export function openMdpWebview(
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
			title: MDP_TITLE,
			options: { retainContextWhenHidden: true },
			contentOptions: { allowScripts: true },
			extension: undefined,
		},
		MDP_VIEW_TYPE,
		MDP_TITLE,
		undefined,
		{ group: undefined, preserveFocus: false }
	);

	webviewInput.webview.setHtml(getMdpHtml());

	registerMdpWebviewHandlers(
		webviewInput,
		MDP_METADATA,
		openerService,
		editorService,
		quickInputService,
		commandService,
		clipboardService,
		notificationService,
		initialModel,
	);
}
