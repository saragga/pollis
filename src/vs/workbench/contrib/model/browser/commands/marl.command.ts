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
import { IMarlMetadata } from '../common/marl.types.js';
import { IModelReference } from '../common/model.types.js';
import { registerMARLWebviewHandlers } from '../handlers/marl.handler.js';
import { getMarlHtml } from '../webviews/marl.template.js';

const MARL_VIEW_TYPE = 'pollis.marl';
const MARL_TITLE = 'Multi-Agent Reinforcement Learning';

const MARL_REFERENCES: IModelReference[] = [
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
		title: 'Multiagent Systems: Algorithmic, Game-Theoretic, and Logical Foundations',
		authors: 'Shoham, Yoav; Leyton-Brown, Kevin',
		year: 2009,
		journal: 'Cambridge University Press',
		url: 'https://www.masfoundations.org/',
		openAccess: true,
	},
	{
		title: 'An Introduction to MultiAgent Systems',
		authors: 'Wooldridge, Michael',
		year: 2009,
		journal: 'Wiley (2nd ed.)',
		url: 'https://www.wiley.com/en-us/An+Introduction+to+MultiAgent+Systems%2C+2nd+Edition-p-9780470519462',
		openAccess: false,
	},
	{ separator: true, label: 'Original Papers' },
	{
		title: 'Multi-Agent Actor-Critic for Mixed Cooperative-Competitive Environments',
		authors: 'Lowe, Ryan; Wu, Yi; Tamar, Aviv; Harb, Jean; Abbeel, Pieter; Mordatch, Igor',
		year: 2017,
		journal: 'NeurIPS',
		url: 'https://proceedings.neurips.cc/paper/2017/hash/68a9750337a418a86fe06c1991a1d64c-Abstract.html',
		openAccess: true,
	},
	{
		title: 'Counterfactual Multi-Agent Policy Gradients',
		authors: 'Foerster, Jakob; Farquhar, Gregory; Afouras, Triantafyllos; Nardelli, Nantas; Whiteson, Shimon',
		year: 2018,
		journal: 'AAAI',
		url: 'https://ojs.aaai.org/index.php/AAAI/article/view/11794',
		openAccess: true,
	},
];

const MARL_METADATA: IMarlMetadata = {
	marl: {
		packages: [
			{
				name: 'ReinforcementLearning.jl',
				github: 'https://github.com/JuliaReinforcementLearning/ReinforcementLearning.jl',
				papers: [],
				videos: [],
			},
		],
		notebooks: [
			{ name: 'Cooperative MARL', file: 'marl/tutorial-01-cooperative.ipynb', bundled: true, description: 'Cooperative multi-agent setup with shared reward; independent Q-learning and CTDE (QMIX-style)' },
			{ name: 'Competitive MARL', file: 'marl/tutorial-02-competitive.ipynb', bundled: true, description: 'Competitive (zero-sum) multi-agent games; self-play; Nash equilibrium via policy gradient' },
		],
		wikis: [
			{ name: 'Factsheet',      file: 'marl/factsheet.md',      bundled: true },
			{ name: 'Overview',       file: 'marl/overview.md',       bundled: true },
			{ name: 'Assumptions',    file: 'marl/assumptions.md',    bundled: true },
			{ name: 'Diagnostics',    file: 'marl/diagnostics.md',    bundled: true },
			{ name: 'Interpretation', file: 'marl/interpretation.md', bundled: true },
			{ name: 'Decision Guide', file: 'marl/decision-guide.md', bundled: true },
			{ separator: true, label: 'Modes' },
			{ name: 'Cooperative',    file: 'marl/cooperative.md',    bundled: true },
			{ name: 'Competitive',    file: 'marl/competitive.md',    bundled: true },
		],
		references: MARL_REFERENCES,
	},
};

export function openMarlWebview(
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
			title: MARL_TITLE,
			options: { retainContextWhenHidden: true },
			contentOptions: { allowScripts: true },
			extension: undefined,
		},
		MARL_VIEW_TYPE,
		MARL_TITLE,
		undefined,
		{ group: undefined, preserveFocus: false }
	);

	webviewInput.webview.setHtml(getMarlHtml());

	registerMARLWebviewHandlers(
		webviewInput,
		MARL_METADATA,
		openerService,
		editorService,
		quickInputService,
		commandService,
		clipboardService,
		notificationService,
		initialModel,
	);
}
