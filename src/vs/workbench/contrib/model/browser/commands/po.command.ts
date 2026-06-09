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
import { IPoMetadata } from '../common/po.types.js';
import { IModelReference } from '../common/model.types.js';
import { registerPoWebviewHandlers } from '../handlers/po.handler.js';
import { getPoHtml } from '../webviews/po.template.js';

const PO_VIEW_TYPE = 'pollis.po';
const PO_TITLE = 'Portfolio Optimisation';

const PO_REFERENCES: IModelReference[] = [
	{ separator: true, label: 'Software' },
	{
		title: 'Julia: A Fresh Approach to Numerical Computing',
		authors: 'Bezanson, Jeff; Edelman, Alan; Karpinski, Stefan; Shah, Viral B.',
		year: 2017,
		journal: 'SIAM Review',
		doi: '10.1137/141000671',
		openAccess: false,
	},
	{ separator: true, label: 'Textbooks' },
	{
		title: 'Portfolio Selection: Efficient Diversification of Investments',
		authors: 'Markowitz, Harry M.',
		year: 1991,
		journal: 'Wiley (2nd ed.)',
		url: 'https://www.wiley.com/en-us/Portfolio+Selection%3A+Efficient+Diversification+of+Investments%2C+2nd+Edition-p-9781557861085',
		openAccess: false,
	},
	{
		title: 'Introduction to Risk Parity and Budgeting',
		authors: 'Roncalli, Thierry',
		year: 2013,
		journal: 'CRC Press',
		url: 'https://www.crcpress.com/Introduction-to-Risk-Parity-and-Budgeting/Roncalli/p/book/9781482207156',
		openAccess: false,
	},
	{ separator: true, label: 'Original Papers' },
	{
		title: 'Portfolio Selection',
		authors: 'Markowitz, Harry M.',
		year: 1952,
		journal: 'Journal of Finance',
		doi: '10.2307/2975974',
		openAccess: false,
	},
	{
		title: 'Optimization of Conditional Value-at-Risk',
		authors: 'Rockafellar, R. Tyrrell; Uryasev, Stanislav',
		year: 2000,
		journal: 'Journal of Risk',
		doi: '10.21314/JOR.2000.038',
		openAccess: false,
	},
	{
		title: 'Building Diversified Portfolios that Outperform Out of Sample',
		authors: 'Lopez de Prado, Marcos',
		year: 2016,
		journal: 'Journal of Portfolio Management',
		doi: '10.3905/jpm.2016.42.4.059',
		openAccess: false,
	},
	{
		title: 'Global Portfolio Optimization',
		authors: 'Black, Fischer; Litterman, Robert',
		year: 1992,
		journal: 'Financial Analysts Journal',
		doi: '10.2469/faj.v48.n5.28',
		openAccess: false,
	},
];

const PO_METADATA: IPoMetadata = {
	po: {
		packages: [
			{
				name: 'PortfolioOptimisers.jl',
				github: 'https://github.com/dcelisgarza/PortfolioOptimisers.jl',
				papers: [],
				videos: [
					{
						title: 'Julia in Academia',
						description: 'Overview of Julia for academic and scientific computing',
						url: 'https://www.youtube.com/watch?v=wPFPT-Ech2c',
					},
				],
			},
		],
		notebooks: [
			{ name: 'Mean-Variance (Markowitz)',        file: 'portfolio-opt/tutorial-01-mean-variance.ipynb',  bundled: true, description: 'Markowitz mean-variance optimisation: minimum-risk and maximum Sharpe ratio portfolios on the efficient frontier' },
			{ name: 'Mean-CVaR',                        file: 'portfolio-opt/tutorial-02-mean-cvar.ipynb',      bundled: true, description: 'Mean-CVaR optimisation: minimise Conditional Value-at-Risk at a given confidence level instead of variance' },
			{ name: 'Hierarchical Risk Parity (HRP)',   file: 'portfolio-opt/tutorial-03-hrp.ipynb',            bundled: true, description: 'HRP: cluster assets by correlation, then allocate inversely proportional to within-cluster risk' },
			{ name: 'Hierarchical Equal Risk (HERC)',   file: 'portfolio-opt/tutorial-04-herc.ipynb',           bundled: true, description: 'HERC: hierarchical clustering with equal risk contribution within each cluster for better diversification' },
		],
		wikis: [
			{ name: 'Factsheet',      file: 'portfolio-opt/factsheet.md',      bundled: true },
			{ name: 'Overview',       file: 'portfolio-opt/overview.md',        bundled: true },
			{ name: 'Assumptions',    file: 'portfolio-opt/assumptions.md',     bundled: true },
			{ name: 'Diagnostics',    file: 'portfolio-opt/diagnostics.md',     bundled: true },
			{ name: 'Interpretation', file: 'portfolio-opt/interpretation.md',  bundled: true },
			{ name: 'Decision Guide', file: 'portfolio-opt/decision-guide.md',  bundled: true },
			{ separator: true, label: 'Optimisation Methods' },
			{ name: 'Mean-Variance',  file: 'portfolio-opt/mean-variance.md',   bundled: true },
			{ name: 'Mean-CVaR',      file: 'portfolio-opt/mean-cvar.md',       bundled: true },
			{ name: 'HRP',            file: 'portfolio-opt/hrp.md',             bundled: true },
			{ name: 'HERC',           file: 'portfolio-opt/herc.md',            bundled: true },
		],
		references: PO_REFERENCES,
	},
};

export function openPoWebview(
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
			title: PO_TITLE,
			options: { retainContextWhenHidden: true },
			contentOptions: { allowScripts: true },
			extension: undefined,
		},
		PO_VIEW_TYPE,
		PO_TITLE,
		undefined,
		{ group: undefined, preserveFocus: false }
	);

	webviewInput.webview.setHtml(getPoHtml());

	registerPoWebviewHandlers(
		webviewInput,
		PO_METADATA,
		openerService,
		editorService,
		quickInputService,
		commandService,
		clipboardService,
		notificationService,
		initialModel,
	);
}
