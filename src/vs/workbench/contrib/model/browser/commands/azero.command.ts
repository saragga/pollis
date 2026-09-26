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
import { IAzeroMetadata } from '../common/azero.types.js';
import { IModelReference } from '../common/model.types.js';
import { registerAzeroWebviewHandlers } from '../handlers/azero.handler.js';
import { getAzeroHtml } from '../webviews/azero.template.js';

const AZERO_VIEW_TYPE = 'pollis.azero';
const AZERO_TITLE = 'AlphaZero';

const AZERO_REFERENCES: IModelReference[] = [
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
		title: 'AlphaZero.jl: A Julia Implementation of the AlphaZero Algorithm',
		authors: 'Laurent, Jonathan',
		year: 2021,
		journal: 'GitHub',
		url: 'https://github.com/jonathan-laurent/AlphaZero.jl',
		openAccess: true,
	},
	{
		title: 'Chess.jl: A Julia Chess Programming Library',
		authors: 'Hager, Gunnar',
		year: 2021,
		journal: 'GitHub',
		url: 'https://github.com/romstad/Chess.jl',
		openAccess: true,
	},
	{
		title: 'Lux: Explicit Parameterisation for Deep Learning in Julia',
		authors: 'Pal, Avik',
		year: 2023,
		journal: 'GitHub',
		url: 'https://github.com/LuxDL/Lux.jl',
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
		title: 'Mastering the Game of Go with Deep Neural Networks and Tree Search',
		authors: 'Silver, David; Huang, Aja; Maddison, Chris J.; et al.',
		year: 2016,
		journal: 'Nature',
		doi: '10.1038/nature16961',
		openAccess: false,
	},
	{
		title: 'Mastering the Game of Go without Human Knowledge',
		authors: 'Silver, David; Schrittwieser, Julian; Simonyan, Karen; et al.',
		year: 2017,
		journal: 'Nature',
		doi: '10.1038/nature24270',
		openAccess: false,
	},
	{
		title: 'A General Reinforcement Learning Algorithm that Masters Chess, Shogi, and Go through Self-Play',
		authors: 'Silver, David; Hubert, Thomas; Schrittwieser, Julian; et al.',
		year: 2018,
		journal: 'Science',
		doi: '10.1126/science.aar6404',
		openAccess: false,
	},
];

const AZERO_METADATA: IAzeroMetadata = {
	azero: {
		packages: [
			{
				name: 'AlphaZero.jl',
				github: 'https://github.com/jonathan-laurent/AlphaZero.jl',
				papers: [],
				videos: [],
			},
			{
				name: 'AlphaZeroChess.jl',
				github: 'https://github.com/antonio-saragga-seabra/AlphaZeroChess.jl',
				papers: [],
				videos: [],
			},
		],
		notebooks: [
			{
				name: 'Connect Four',
				file: 'azero/tutorial-01-connect-four.ipynb',
				bundled: true,
				description: 'Train AlphaZero from scratch on Connect Four; visualise MCTS visit counts and training curves',
			},
			{
				name: 'Custom Game',
				file: 'azero/tutorial-02-custom-game.ipynb',
				bundled: true,
				description: 'Implement the GameInterface for a new two-player game and plug it into the AlphaZero training loop',
			},
			{
				name: 'TicTacToe',
				file: 'azero/tutorial-03-tictactoe.ipynb',
				bundled: true,
				description: 'Fast convergence showcase on TicTacToe; inspect the learned policy and value function on all 9 board positions',
			},
		],
		wikis: [
			{ name: 'Factsheet',      file: 'azero/factsheet.md',      bundled: true },
			{ name: 'Overview',       file: 'azero/overview.md',       bundled: true },
			{ name: 'Assumptions',    file: 'azero/assumptions.md',    bundled: true },
			{ name: 'Diagnostics',    file: 'azero/diagnostics.md',    bundled: true },
			{ name: 'Interpretation', file: 'azero/interpretation.md', bundled: true },
			{ name: 'Decision Guide', file: 'azero/decision-guide.md', bundled: true },
		],
		references: AZERO_REFERENCES,
	},
};

export function openAzeroWebview(
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
			title: AZERO_TITLE,
			options: { retainContextWhenHidden: true },
			contentOptions: { allowScripts: true },
			extension: undefined,
		},
		AZERO_VIEW_TYPE,
		AZERO_TITLE,
		undefined,
		{ group: undefined, preserveFocus: false }
	);

	webviewInput.webview.setHtml(getAzeroHtml());

	registerAzeroWebviewHandlers(
		webviewInput,
		AZERO_METADATA,
		openerService,
		editorService,
		quickInputService,
		commandService,
		clipboardService,
		notificationService,
	);
}
