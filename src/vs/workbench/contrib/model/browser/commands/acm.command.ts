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
import { IAcmMetadata } from '../common/acm.types.js';
import { IModelReference } from '../common/model.types.js';
import { registerACMWebviewHandlers } from '../handlers/acm.handler.js';
import { getAcmHtml } from '../webviews/acm.template.js';

const ACM_VIEW_TYPE = 'pollis.acm';
const ACM_TITLE = 'Actor-Critic Methods';

const ACM_REFERENCES: IModelReference[] = [
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
		title: 'Asynchronous Methods for Deep Reinforcement Learning',
		authors: 'Mnih, Volodymyr; et al.',
		year: 2016,
		journal: 'ICML',
		url: 'https://proceedings.mlr.press/v48/mniha16.html',
		openAccess: true,
	},
	{
		title: 'Soft Actor-Critic: Off-Policy Maximum Entropy Deep Reinforcement Learning with a Stochastic Actor',
		authors: 'Haarnoja, Tuomas; Zhou, Aurick; Abbeel, Pieter; Levine, Sergey',
		year: 2018,
		journal: 'ICML',
		url: 'https://proceedings.mlr.press/v80/haarnoja18b.html',
		openAccess: true,
	},
	{
		title: 'Addressing Function Approximation Error in Actor-Critic Methods',
		authors: 'Fujimoto, Scott; van Hoof, Herke; Meger, David',
		year: 2018,
		journal: 'ICML',
		url: 'https://proceedings.mlr.press/v80/fujimoto18a.html',
		openAccess: true,
	},
];

const ACM_METADATA: IAcmMetadata = {
	acm: {
		packages: [
			{
				name: 'ReinforcementLearning.jl',
				github: 'https://github.com/JuliaReinforcementLearning/ReinforcementLearning.jl',
				papers: [],
				videos: [],
			},
		],
		notebooks: [
			{ name: 'A2C', file: 'acm/tutorial-01-a2c.ipynb', bundled: true, description: 'Advantage Actor-Critic with parallel workers; synchronous gradient accumulation via Flux.jl' },
			{ name: 'SAC', file: 'acm/tutorial-02-sac.ipynb', bundled: true, description: 'Soft Actor-Critic: maximum-entropy off-policy; automatic temperature tuning; continuous control' },
			{ name: 'TD3', file: 'acm/tutorial-03-td3.ipynb', bundled: true, description: 'Twin Delayed DDPG: double critics, delayed actor updates, target policy smoothing' },
		],
		wikis: [
			{ name: 'Factsheet',      file: 'acm/factsheet.md',      bundled: true },
			{ name: 'Overview',       file: 'acm/overview.md',       bundled: true },
			{ name: 'Assumptions',    file: 'acm/assumptions.md',    bundled: true },
			{ name: 'Diagnostics',    file: 'acm/diagnostics.md',    bundled: true },
			{ name: 'Interpretation', file: 'acm/interpretation.md', bundled: true },
			{ name: 'Decision Guide', file: 'acm/decision-guide.md', bundled: true },
			{ separator: true, label: 'Algorithms' },
			{ name: 'A2C',            file: 'acm/a2c.md',            bundled: true },
			{ name: 'SAC',            file: 'acm/sac.md',            bundled: true },
			{ name: 'TD3',            file: 'acm/td3.md',            bundled: true },
		],
		references: ACM_REFERENCES,
	},
};

export function openAcmWebview(
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
			title: ACM_TITLE,
			options: { retainContextWhenHidden: true },
			contentOptions: { allowScripts: true },
			extension: undefined,
		},
		ACM_VIEW_TYPE,
		ACM_TITLE,
		undefined,
		{ group: undefined, preserveFocus: false }
	);

	webviewInput.webview.setHtml(getAcmHtml());

	registerACMWebviewHandlers(
		webviewInput,
		ACM_METADATA,
		openerService,
		editorService,
		quickInputService,
		commandService,
		clipboardService,
		notificationService,
		initialModel,
	);
}
