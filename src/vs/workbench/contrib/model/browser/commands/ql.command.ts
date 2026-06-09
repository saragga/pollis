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
import { IQlMetadata } from '../common/ql.types.js';
import { IModelReference } from '../common/model.types.js';
import { registerQLWebviewHandlers } from '../handlers/ql.handler.js';
import { getQlHtml } from '../webviews/ql.template.js';

const QL_VIEW_TYPE = 'pollis.ql';
const QL_TITLE = 'Q-Learning';

const QL_REFERENCES: IModelReference[] = [
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
		title: 'Deep Reinforcement Learning Hands-On',
		authors: 'Lapan, Maxim',
		year: 2020,
		journal: 'Packt Publishing (2nd ed.)',
		url: 'https://www.packtpub.com/product/deep-reinforcement-learning-hands-on-second-edition/9781838826994',
		openAccess: false,
	},
	{ separator: true, label: 'Original Papers' },
	{
		title: 'Q-learning',
		authors: 'Watkins, Christopher J.C.H.; Dayan, Peter',
		year: 1992,
		journal: 'Machine Learning',
		doi: '10.1007/BF00992698',
		openAccess: false,
	},
	{
		title: 'Human-level Control through Deep Reinforcement Learning',
		authors: 'Mnih, Volodymyr; Kavukcuoglu, Koray; Silver, David; et al.',
		year: 2015,
		journal: 'Nature',
		doi: '10.1038/nature14236',
		openAccess: false,
	},
];

const QL_METADATA: IQlMetadata = {
	ql: {
		packages: [
			{
				name: 'ReinforcementLearning.jl',
				github: 'https://github.com/JuliaReinforcementLearning/ReinforcementLearning.jl',
				papers: [],
				videos: [],
			},
		],
		notebooks: [
			{ name: 'Tabular Q-Learning', file: 'ql/tutorial-01-tabular.ipynb', bundled: true, description: 'Q-table update rule, epsilon-greedy exploration, GridWorld and FrozenLake environments' },
			{ name: 'Deep Q-Network', file: 'ql/tutorial-02-dqn.ipynb', bundled: true, description: 'Neural network Q-function approximation with experience replay and target networks via Flux.jl' },
		],
		wikis: [
			{ name: 'Factsheet',      file: 'ql/factsheet.md',      bundled: true },
			{ name: 'Overview',       file: 'ql/overview.md',       bundled: true },
			{ name: 'Assumptions',    file: 'ql/assumptions.md',    bundled: true },
			{ name: 'Diagnostics',    file: 'ql/diagnostics.md',    bundled: true },
			{ name: 'Interpretation', file: 'ql/interpretation.md', bundled: true },
			{ name: 'Decision Guide', file: 'ql/decision-guide.md', bundled: true },
			{ separator: true, label: 'Algorithms' },
			{ name: 'Tabular',        file: 'ql/tabular.md',        bundled: true },
			{ name: 'DQN',            file: 'ql/dqn.md',            bundled: true },
		],
		references: QL_REFERENCES,
	},
};

export function openQlWebview(
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
			title: QL_TITLE,
			options: { retainContextWhenHidden: true },
			contentOptions: { allowScripts: true },
			extension: undefined,
		},
		QL_VIEW_TYPE,
		QL_TITLE,
		undefined,
		{ group: undefined, preserveFocus: false }
	);

	webviewInput.webview.setHtml(getQlHtml());

	registerQLWebviewHandlers(
		webviewInput,
		QL_METADATA,
		openerService,
		editorService,
		quickInputService,
		commandService,
		clipboardService,
		notificationService,
		initialModel,
	);
}
