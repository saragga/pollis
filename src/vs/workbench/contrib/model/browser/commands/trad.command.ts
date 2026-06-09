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
import { ITradMetadata } from '../common/trad.types.js';
import { IModelReference } from '../common/model.types.js';
import { registerTradWebviewHandlers } from '../handlers/trad.handler.js';
import { getTradHtml } from '../webviews/trad.template.js';

const TRAD_VIEW_TYPE = 'pollis.trad';
const TRAD_TITLE = 'Trading Agents';

const TRAD_REFERENCES: IModelReference[] = [
	{ separator: true, label: 'Software' },
	{
		title: 'Scalable Agent-Based Modeling for Complex Financial Market Simulations',
		authors: 'Raman, Anand; Ramirez, Jose Mauricio; Szabo, Krisztian; Saba, Louis',
		year: 2024,
		journal: 'JuliaCon Proceedings',
		openAccess: true,
	},
	{ separator: true, label: 'Textbooks' },
	{
		title: 'Algorithmic and High-Frequency Trading',
		authors: 'Cartea, Alvaro; Jaimungal, Sebastian; Penalva, Jose',
		year: 2015,
		journal: 'Cambridge University Press',
		openAccess: false,
	},
	{
		title: 'Market Microstructure Theory',
		authors: "O'Hara, Maureen",
		year: 1995,
		journal: 'Blackwell',
		openAccess: false,
	},
	{ separator: true, label: 'Original Papers' },
	{
		title: 'Allocative Efficiency of Markets with Zero-Intelligence Traders: Market as a Partial Substitute for Individual Rationality',
		authors: 'Gode, Dhananjay K.; Sunder, Shyam',
		year: 1993,
		journal: 'Journal of Political Economy',
		doi: '10.1086/261868',
		openAccess: false,
	},
	{
		title: 'Agent-based computational finance',
		authors: 'LeBaron, Blake',
		year: 2006,
		journal: 'Handbook of Computational Economics',
		doi: '10.1016/S1574-0021(05)02024-1',
		openAccess: false,
	},
	{
		title: 'Empirical properties of asset returns: stylized facts and statistical issues',
		authors: 'Cont, Rama',
		year: 2001,
		journal: 'Quantitative Finance',
		doi: '10.1080/713665670',
		openAccess: false,
	},
];

const TRAD_METADATA: ITradMetadata = {
	trad: {
		packages: [
			{
				name: 'TradingAgents.jl',
				github: 'https://github.com/aaron-wheeler/TradingAgents.jl',
				papers: [],
				videos: [
					{
						title: 'Scalable Agent-Based Modeling for Complex Financial Market Simulations',
						description: 'JuliaCon talk demonstrating TradingAgents.jl for large-scale financial market simulation',
						url: 'https://www.youtube.com/watch?v=C2Itnbwf9hg',
					},
				],
			},
			{
				name: 'VLLimitOrderBook.jl',
				github: 'https://github.com/dm13450/VLLimitOrderBook.jl',
				papers: [],
				videos: [],
			},
			{
				name: 'Brokerage.jl',
				github: 'https://github.com/dm13450/Brokerage.jl',
				papers: [],
				videos: [],
			},
			{
				name: 'TotalViewITCH.jl',
				github: 'https://github.com/dm13450/TotalViewITCH.jl',
				papers: [],
				videos: [],
			},
		],
		notebooks: [
			{ name: 'Trading Agent Population', file: 'trad/tutorial-01-trading-agents.ipynb', bundled: true, description: 'Simulate a large population of heterogeneous trading agents and observe emergent price discovery' },
			{ name: 'Limit Order Book',          file: 'trad/tutorial-02-limit-order-book.ipynb', bundled: true, description: 'Build and simulate a continuous double auction limit order book with VLLimitOrderBook.jl' },
			{ name: 'Market Microstructure',     file: 'trad/tutorial-03-market-microstructure.ipynb', bundled: true, description: 'Full market simulation with the Brokerage.jl platform: agents, exchange, and order flow' },
		],
		wikis: [
			{ name: 'Factsheet',              file: 'trad/factsheet.md',              bundled: true },
			{ name: 'Overview',               file: 'trad/overview.md',               bundled: true },
			{ name: 'Assumptions',            file: 'trad/assumptions.md',            bundled: true },
			{ name: 'Diagnostics',            file: 'trad/diagnostics.md',            bundled: true },
			{ name: 'Interpretation',         file: 'trad/interpretation.md',         bundled: true },
			{ name: 'Decision Guide',         file: 'trad/decision-guide.md',         bundled: true },
			{ separator: true, label: 'Packages' },
			{ name: 'Trading Agents',         file: 'trad/trading-agents.md',         bundled: true },
			{ name: 'Limit Order Book',       file: 'trad/limit-order-book.md',       bundled: true },
			{ name: 'Market Microstructure',  file: 'trad/market-microstructure.md',  bundled: true },
		],
		references: TRAD_REFERENCES,
	},
};

export function openTradWebview(
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
			title: TRAD_TITLE,
			options: { retainContextWhenHidden: true },
			contentOptions: { allowScripts: true },
			extension: undefined,
		},
		TRAD_VIEW_TYPE,
		TRAD_TITLE,
		undefined,
		{ group: undefined, preserveFocus: false }
	);

	webviewInput.webview.setHtml(getTradHtml());

	registerTradWebviewHandlers(
		webviewInput,
		TRAD_METADATA,
		openerService,
		editorService,
		quickInputService,
		commandService,
		clipboardService,
		notificationService,
		initialModel,
	);
}
