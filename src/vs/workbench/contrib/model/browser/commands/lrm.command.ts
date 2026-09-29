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
import { ILrmMetadata } from '../common/lrm.types.js';
import { registerLrmWebviewHandlers } from '../handlers/lrm.handler.js';
import { getLrmHtml } from '../webviews/lrm.template.js';

const LRM_VIEW_TYPE = 'pollis.lrm';
const LRM_TITLE = 'Loss Risk Measures';

const LRM_METADATA: ILrmMetadata = {
	lrm: {
		packages: [
			{
				name: 'PerformanceAnalytics.jl',
				github: 'https://github.com/eohne/PerformanceAnalytics.jl',
				papers: [
					{
						title: 'Coherent Measures of Risk',
						authors: 'Artzner, P., Delbaen, F., Eber, J.-M., & Heath, D.',
						year: 1999,
						url: 'https://doi.org/10.1111/1467-9965.00068',
						openAccess: false,
					},
					{
						title: 'Expected Shortfall: A Natural Coherent Alternative to Value at Risk',
						authors: 'Acerbi, C., & Tasche, D.',
						year: 2002,
						url: 'https://doi.org/10.1111/1468-0300.00091',
						openAccess: false,
					},
					{
						title: 'Performance Measurement in a Downside Risk Framework',
						authors: 'Sortino, F. A., & Price, L. N.',
						year: 1994,
						url: 'https://doi.org/10.3905/joi.3.3.59',
						openAccess: false,
					},
					{
						title: 'Portfolio Selection',
						authors: 'Markowitz, H.',
						year: 1952,
						url: 'https://doi.org/10.2307/2975974',
						openAccess: false,
					},
				],
			},
		],
		notebooks: [
			{ name: 'Quick Start',            file: 'lrm/tutorial-01-quickstart.ipynb',    bundled: true, description: 'Compute drawdown, VaR and CVaR for a returns series' },
			{ name: 'Drawdown Analysis',       file: 'lrm/tutorial-02-drawdown.ipynb',      bundled: true, description: 'Max drawdown, average drawdown and recovery periods' },
			{ name: 'Downside Risk',           file: 'lrm/tutorial-03-downside.ipynb',      bundled: true, description: 'Semi-deviation, Sortino ratio and Omega ratio' },
			{ name: 'VaR and CVaR',            file: 'lrm/tutorial-04-var-cvar.ipynb',      bundled: true, description: 'Historical and parametric Value at Risk and Expected Shortfall' },
		],
		wikis: [
			{ name: 'Overview',        file: 'lrm/overview.md',        bundled: true },
			{ name: 'Factsheet',       file: 'lrm/factsheet.md',       bundled: true },
			{ name: 'Assumptions',     file: 'lrm/assumptions.md',     bundled: true },
			{ name: 'Diagnostics',     file: 'lrm/diagnostics.md',     bundled: true },
			{ name: 'Interpretation',  file: 'lrm/interpretation.md',  bundled: true },
			{ name: 'Decision Guide',  file: 'lrm/decision-guide.md',  bundled: true },
		],
		tooltips: {
			returns:    'Variable name holding your returns vector (e.g. daily or monthly log-returns as a Float64 vector).',
			window:     'Rolling window length in periods for time-varying drawdown statistics.',
			mar:        'Minimum Acceptable Return (MAR). Returns below this threshold are counted as losses for downside-risk measures. Defaults to 0.',
			'alpha-vr': 'Significance level &#945; for Value at Risk. 0.05 gives the 95% VaR (loss not exceeded 95% of the time); 0.01 gives the 99% VaR.',
			'alpha-es': 'Significance level &#945; for Expected Shortfall (CVaR). 0.05 gives the average loss in the worst 5% of outcomes; 0.01 in the worst 1%.',
		},
	},
};

export function openLrmWebview(
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
			title: LRM_TITLE,
			options: { retainContextWhenHidden: true },
			contentOptions: { allowScripts: true },
			extension: undefined,
		},
		LRM_VIEW_TYPE,
		LRM_TITLE,
		undefined,
		{ group: undefined, preserveFocus: false }
	);

	webviewInput.webview.setHtml(getLrmHtml());

	registerLrmWebviewHandlers(
		webviewInput,
		LRM_METADATA,
		openerService,
		editorService,
		quickInputService,
		commandService,
		clipboardService,
		notificationService,
	);
}
