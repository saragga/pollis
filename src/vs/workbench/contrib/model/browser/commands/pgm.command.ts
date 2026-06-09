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
import { IPgmMetadata } from '../common/pgm.types.js';
import { IModelReference } from '../common/model.types.js';
import { registerPGMWebviewHandlers } from '../handlers/pgm.handler.js';
import { getPgmHtml } from '../webviews/pgm.template.js';

const PGM_VIEW_TYPE = 'pollis.pgm';
const PGM_TITLE = 'Policy Gradient Methods';

const PGM_REFERENCES: IModelReference[] = [
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
	{ separator: true, label: 'Original Papers' },
	{
		title: 'Policy Gradient Methods for Reinforcement Learning with Function Approximation',
		authors: 'Sutton, Richard S.; McAllester, David; Singh, Satinder; Mansour, Yishay',
		year: 2000,
		journal: 'NeurIPS',
		url: 'https://proceedings.neurips.cc/paper/1999/hash/464d828b85b0bed98e80ade0a5c43b0f-Abstract.html',
		openAccess: true,
	},
	{
		title: 'Proximal Policy Optimization Algorithms',
		authors: 'Schulman, John; Wolski, Filip; Dhariwal, Prafulla; Radford, Alec; Klimov, Oleg',
		year: 2017,
		journal: 'arXiv',
		url: 'https://arxiv.org/abs/1707.06347',
		openAccess: true,
	},
	{
		title: 'Trust Region Policy Optimization',
		authors: 'Schulman, John; Levine, Sergey; Abbeel, Pieter; Jordan, Michael; Moritz, Philipp',
		year: 2015,
		journal: 'ICML',
		url: 'https://proceedings.mlr.press/v37/schulman15.html',
		openAccess: true,
	},
];

const PGM_METADATA: IPgmMetadata = {
	pgm: {
		packages: [
			{
				name: 'ReinforcementLearning.jl',
				github: 'https://github.com/JuliaReinforcementLearning/ReinforcementLearning.jl',
				papers: [],
				videos: [],
			},
		],
		notebooks: [
			{ name: 'REINFORCE', file: 'pgm/tutorial-01-reinforce.ipynb', bundled: true, description: 'Monte Carlo policy gradient with baseline; full-episode returns; Flux.jl policy network' },
			{ name: 'PPO', file: 'pgm/tutorial-02-ppo.ipynb', bundled: true, description: 'Proximal Policy Optimization with clipped surrogate objective; parallel environment rollouts' },
			{ name: 'TRPO', file: 'pgm/tutorial-03-trpo.ipynb', bundled: true, description: 'Trust Region Policy Optimization with KL divergence constraint; conjugate gradient solver' },
		],
		wikis: [
			{ name: 'Factsheet',      file: 'pgm/factsheet.md',      bundled: true },
			{ name: 'Overview',       file: 'pgm/overview.md',       bundled: true },
			{ name: 'Assumptions',    file: 'pgm/assumptions.md',    bundled: true },
			{ name: 'Diagnostics',    file: 'pgm/diagnostics.md',    bundled: true },
			{ name: 'Interpretation', file: 'pgm/interpretation.md', bundled: true },
			{ name: 'Decision Guide', file: 'pgm/decision-guide.md', bundled: true },
			{ separator: true, label: 'Algorithms' },
			{ name: 'REINFORCE',      file: 'pgm/reinforce.md',      bundled: true },
			{ name: 'PPO',            file: 'pgm/ppo.md',            bundled: true },
			{ name: 'TRPO',           file: 'pgm/trpo.md',           bundled: true },
		],
		references: PGM_REFERENCES,
	},
};

export function openPgmWebview(
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
			title: PGM_TITLE,
			options: { retainContextWhenHidden: true },
			contentOptions: { allowScripts: true },
			extension: undefined,
		},
		PGM_VIEW_TYPE,
		PGM_TITLE,
		undefined,
		{ group: undefined, preserveFocus: false }
	);

	webviewInput.webview.setHtml(getPgmHtml());

	registerPGMWebviewHandlers(
		webviewInput,
		PGM_METADATA,
		openerService,
		editorService,
		quickInputService,
		commandService,
		clipboardService,
		notificationService,
		initialModel,
	);
}
