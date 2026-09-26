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
import { IBndtMetadata } from '../common/bndt.types.js';
import { IModelReference } from '../common/model.types.js';
import { registerBndtWebviewHandlers } from '../handlers/bndt.handler.js';
import { getBndtHtml } from '../webviews/bndt.template.js';

const BNDT_VIEW_TYPE = 'pollis.bndt';
const BNDT_TITLE = 'Bandit Problems';

const BNDT_REFERENCES: IModelReference[] = [
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
		title: 'ReinforcementLearning.jl: A Reinforcement Learning Package for the Julia Programming Language',
		authors: 'Tian, Jun; others',
		year: 2020,
		journal: 'GitHub',
		url: 'https://github.com/JuliaReinforcementLearning/ReinforcementLearning.jl',
		openAccess: true,
	},
	{ separator: true, label: 'Textbooks' },
	{
		title: 'Reinforcement Learning: An Introduction',
		authors: 'Sutton, Richard S.; Barto, Andrew G.',
		year: 2018,
		journal: 'MIT Press',
		url: 'http://incompleteideas.net/book/the-book-2nd.html',
		openAccess: true,
	},
	{
		title: 'Algorithms for Reinforcement Learning',
		authors: 'Szepesvari, Csaba',
		year: 2010,
		journal: 'Morgan and Claypool',
		url: 'https://sites.ualberta.ca/~szepesva/papers/RLAlgsInMDPs.pdf',
		openAccess: true,
	},
	{ separator: true, label: 'Original Papers' },
	{
		title: 'On the Likelihood that One Unknown Probability Exceeds Another',
		authors: 'Thompson, William R.',
		year: 1933,
		journal: 'Biometrika',
		doi: '10.1093/biomet/25.3-4.285',
		openAccess: false,
	},
	{
		title: 'Finite-time Analysis of the Multiarmed Bandit Problem',
		authors: 'Auer, Peter; Cesa-Bianchi, Nicolo; Fischer, Paul',
		year: 2002,
		journal: 'Machine Learning',
		doi: '10.1023/A:1013689704352',
		openAccess: false,
	},
];

const BNDT_METADATA: IBndtMetadata = {
	bndt: {
		packages: [
			{
				name: 'ReinforcementLearning.jl',
				github: 'https://github.com/JuliaReinforcementLearning/ReinforcementLearning.jl',
				papers: [],
				videos: [],
			},
		],
		notebooks: [
			{ name: 'epsilon-Greedy', file: 'bandit/tutorial-01-epsilon-greedy.ipynb', bundled: true, description: 'Explore/exploit trade-off via epsilon-greedy action selection on multi-arm bandits' },
			{ name: 'UCB', file: 'bandit/tutorial-02-ucb.ipynb', bundled: true, description: 'Upper Confidence Bound: optimistic arm selection with confidence bonus' },
			{ name: 'Thompson Sampling', file: 'bandit/tutorial-03-thompson.ipynb', bundled: true, description: 'Bayesian exploration via Beta posterior sampling; conjugate update for Bernoulli rewards' },
		],
		wikis: [
			{ name: 'Factsheet',      file: 'bandit/factsheet.md',      bundled: true },
			{ name: 'Overview',       file: 'bandit/overview.md',       bundled: true },
			{ name: 'Assumptions',    file: 'bandit/assumptions.md',    bundled: true },
			{ name: 'Diagnostics',    file: 'bandit/diagnostics.md',    bundled: true },
			{ name: 'Interpretation', file: 'bandit/interpretation.md', bundled: true },
			{ name: 'Decision Guide', file: 'bandit/decision-guide.md', bundled: true },
			{ separator: true, label: 'Algorithms' },
			{ name: 'epsilon-Greedy',    file: 'bandit/epsilon-greedy.md',     bundled: true },
			{ name: 'UCB',              file: 'bandit/ucb.md',                bundled: true },
			{ name: 'Thompson Sampling', file: 'bandit/thompson-sampling.md', bundled: true },
		],
		references: BNDT_REFERENCES,
	},
};

export function openBndtWebview(
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
			title: BNDT_TITLE,
			options: { retainContextWhenHidden: true },
			contentOptions: { allowScripts: true },
			extension: undefined,
		},
		BNDT_VIEW_TYPE,
		BNDT_TITLE,
		undefined,
		{ group: undefined, preserveFocus: false }
	);

	webviewInput.webview.setHtml(getBndtHtml());

	registerBndtWebviewHandlers(
		webviewInput,
		BNDT_METADATA,
		openerService,
		editorService,
		quickInputService,
		commandService,
		clipboardService,
		notificationService,
		initialModel,
	);
}
