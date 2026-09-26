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
import { ICtmfMetadata } from '../common/ctmf.types.js';
import { registerCtmfWebviewHandlers } from '../handlers/ctmf.handler.js';
import { getCtmfHtml } from '../webviews/ctmf.template.js';

const CTMF_VIEW_TYPE = 'pollis.ctmf';
const CTMF_TITLE = 'Continuous-Time Macro-Finance';

const CTMF_METADATA: ICtmfMetadata = {
	ctmf: {
		packages: [
			{
				name: 'EconPDEs.jl',
				github: 'https://github.com/matthieugomez/EconPDEs.jl',
				papers: [
					{
						title: 'By Force of Habit: A Consumption-Based Explanation of Aggregate Stock Market Behavior',
						authors: 'Campbell, J. Y., & Cochrane, J. H.',
						year: 1999,
						url: 'https://doi.org/10.1086/250059',
						openAccess: false,
					},
					{
						title: 'Risks for the Long Run: A Potential Resolution of Asset Pricing Puzzles',
						authors: 'Bansal, R., & Yaron, A.',
						year: 2004,
						url: 'https://doi.org/10.1111/j.1540-6261.2004.00670.x',
						openAccess: false,
					},
					{
						title: 'A Macroeconomic Model with a Financial Sector',
						authors: 'Brunnermeier, M. K., & Sannikov, Y.',
						year: 2014,
						url: 'https://doi.org/10.1257/aer.104.2.379',
						openAccess: false,
					},
					{
						title: 'An Intertemporal Capital Asset Pricing Model',
						authors: 'Merton, R. C.',
						year: 1973,
						url: 'https://doi.org/10.2307/1913811',
						openAccess: false,
					},
				],
			},
		],
		notebooks: [
			{ name: 'Quick Start',       file: 'ctmf/tutorial-01-quickstart.ipynb', bundled: true, description: 'Solve a habit model and plot the price-dividend ratio and risk premium' },
			{ name: 'Long-Run Risk',     file: 'ctmf/tutorial-02-lrr.ipynb',        bundled: true, description: 'Bansal-Yaron long-run risk model: price-dividend ratio and term structure' },
			{ name: 'Habit Formation',   file: 'ctmf/tutorial-03-habit.ipynb',      bundled: true, description: 'Campbell-Cochrane habit model: equity premium and Sharpe ratio' },
			{ name: 'Financial Sector',  file: 'ctmf/tutorial-04-finance.ipynb',    bundled: true, description: 'Brunnermeier-Sannikov macro-finance model with intermediary balance sheets' },
		],
		wikis: [
			{ name: 'Overview',       file: 'ctmf/overview.md',       bundled: true },
			{ name: 'Factsheet',      file: 'ctmf/factsheet.md',      bundled: true },
			{ name: 'Assumptions',    file: 'ctmf/assumptions.md',    bundled: true },
			{ name: 'Diagnostics',    file: 'ctmf/diagnostics.md',    bundled: true },
			{ name: 'Interpretation', file: 'ctmf/interpretation.md', bundled: true },
			{ name: 'Decision Guide', file: 'ctmf/decision-guide.md', bundled: true },
		],
		tooltips: {
			gamma: 'Coefficient of relative risk aversion in the recursive Epstein-Zin utility specification.',
			rho:   'Subjective discount rate in continuous time.',
			sigma: 'Diffusion volatility of the consumption growth or state variable process.',
			psi:   'Elasticity of intertemporal substitution (EIS). Separates risk aversion from intertemporal substitution preferences.',
			kappa: 'Mean-reversion speed of the state variable (e.g. expected consumption growth or surplus ratio).',
			N:     'Number of grid points for the state space discretisation. More points give higher accuracy at greater computational cost.',
		},
	},
};

export function openCtmfWebview(
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
			title: CTMF_TITLE,
			options: { retainContextWhenHidden: true },
			contentOptions: { allowScripts: true },
			extension: undefined,
		},
		CTMF_VIEW_TYPE,
		CTMF_TITLE,
		undefined,
		{ group: undefined, preserveFocus: false }
	);

	webviewInput.webview.setHtml(getCtmfHtml());

	registerCtmfWebviewHandlers(
		webviewInput,
		CTMF_METADATA,
		openerService,
		editorService,
		quickInputService,
		commandService,
		clipboardService,
		notificationService,
	);
}
