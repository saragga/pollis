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
import { IMadpMetadata } from '../common/madp.types.js';
import { registerMadpWebviewHandlers } from '../handlers/madp.handler.js';
import { getMadpHtml } from '../webviews/madp.template.js';

const MADP_VIEW_TYPE = 'pollis.madp';
const MADP_TITLE = 'Multi-Agent Decision Processes';

const MADP_REFERENCES: IModelReference[] = [
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
	{
		title: 'GameTheory.jl: Normal-Form Game Solvers in Julia',
		authors: 'QuantEcon Development Team',
		year: 2023,
		journal: 'GitHub',
		url: 'https://github.com/QuantEcon/GameTheory.jl',
		openAccess: true,
	},
	{ separator: true, label: 'Textbooks' },
	{
		title: 'A Concise Introduction to Decentralized POMDPs',
		authors: 'Oliehoek, Frans A.; Amato, Christopher',
		year: 2016,
		journal: 'Springer',
		doi: '10.1007/978-3-319-28929-8',
		openAccess: false,
	},
	{
		title: 'Multiagent Systems: Algorithmic, Game-Theoretic, and Logical Foundations',
		authors: 'Shoham, Yoav; Leyton-Brown, Kevin',
		year: 2009,
		journal: 'Cambridge University Press',
		url: 'https://www.masfoundations.org',
		openAccess: true,
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
		title: 'Stochastic Games',
		authors: 'Shapley, Lloyd S.',
		year: 1953,
		journal: 'Proceedings of the National Academy of Sciences',
		doi: '10.1073/pnas.39.10.1095',
		openAccess: true,
	},
	{
		title: 'The Complexity of Decentralized Control of Markov Decision Processes',
		authors: 'Bernstein, Daniel S.; Givan, Robert; Immerman, Neil; Zilberstein, Shlomo',
		year: 2002,
		journal: 'Mathematics of Operations Research',
		doi: '10.1287/moor.27.4.819.297',
		openAccess: false,
	},
	{
		title: 'Optimal and Approximate Q-value Functions for Decentralized POMDPs',
		authors: 'Oliehoek, Frans A.; Spaan, Matthijs T.J.; Vlassis, Nikos',
		year: 2008,
		journal: 'Journal of Artificial Intelligence Research',
		doi: '10.1613/jair.2432',
		openAccess: true,
	},
];

export const MADP_NOTEBOOK_SECTIONS: IModelNotebookSection[] = [
	{
		label: '',
		notebooks: [
			{
				name: 'Dec-POMDP: Broadcast Problem',
				file: 'madp/tutorial-01-decpomdp-broadcast.ipynb',
				bundled: true,
				description: 'Two-agent cooperative broadcast Dec-POMDP: joint policy representation, finite-horizon backward induction, and value comparison with centralised POMDP upper bound',
			},
			{
				name: 'Dec-POMDP: JESP Algorithm',
				file: 'madp/tutorial-02-decpomdp-jesp.ipynb',
				bundled: true,
				description: 'Joint Equilibrium-based Search for Policies (JESP): alternating agent optimisation, convergence behaviour, and local optima analysis',
			},
			{
				name: 'Stochastic Game: Zero-Sum',
				file: 'madp/tutorial-03-sg-zerosum.ipynb',
				bundled: true,
				description: 'Zero-sum two-player stochastic game via minimax value iteration using GameTheory.jl: stage-game LP, Nash equilibrium, and convergence to stationary strategies',
			},
			{
				name: 'Stochastic Game: General-Sum',
				file: 'madp/tutorial-04-sg-generalsum.ipynb',
				bundled: true,
				description: 'General-sum two-player stochastic game: Nash Q-value iteration, correlated equilibria, and comparison of equilibrium concepts',
			},
		],
	},
];

const MADP_METADATA: IMadpMetadata = {
	madp: {
		packages: [
			{ name: 'POMDPs.jl',      github: 'https://github.com/JuliaPOMDP/POMDPs.jl',       papers: [] },
			{ name: 'GameTheory.jl',  github: 'https://github.com/QuantEcon/GameTheory.jl',     papers: [] },
		],
		notebookSections: MADP_NOTEBOOK_SECTIONS,
		notebooks: MADP_NOTEBOOK_SECTIONS.flatMap(s => s.notebooks),
		wikis: [
			{ name: 'Factsheet',      file: 'madp/factsheet.md',      bundled: true },
			{ name: 'Overview',       file: 'madp/overview.md',        bundled: true },
			{ name: 'Assumptions',    file: 'madp/assumptions.md',     bundled: true },
			{ name: 'Diagnostics',    file: 'madp/diagnostics.md',     bundled: true },
			{ name: 'Interpretation', file: 'madp/interpretation.md',  bundled: true },
			{ name: 'Decision Guide', file: 'madp/decision-guide.md',  bundled: true },
			{ separator: true, label: 'Models' },
			{ name: 'Dec-POMDPs',       file: 'madp/decpomdp.md',       bundled: true },
			{ name: 'Stochastic Games', file: 'madp/stochastic-games.md', bundled: true },
		],
		references: MADP_REFERENCES,
	},
};

export function openMadpWebview(
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
			title: MADP_TITLE,
			options: { retainContextWhenHidden: true },
			contentOptions: { allowScripts: true },
			extension: undefined,
		},
		MADP_VIEW_TYPE,
		MADP_TITLE,
		undefined,
		{ group: undefined, preserveFocus: false }
	);

	webviewInput.webview.setHtml(getMadpHtml());

	registerMadpWebviewHandlers(
		webviewInput,
		MADP_METADATA,
		openerService,
		editorService,
		quickInputService,
		commandService,
		clipboardService,
		notificationService,
		initialModel,
	);
}
