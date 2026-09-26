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
import { IHfcmeMetadata } from '../common/hfcme.types.js';
import { registerHfcmeWebviewHandlers } from '../handlers/hfcme.handler.js';
import { getHfcmeHtml } from '../webviews/hfcme.template.js';

const HFCME_VIEW_TYPE = 'pollis.hfcme';
const HFCME_TITLE = 'High-Frequency Covariance Matrix Estimation';

const HFCME_METADATA: IHfcmeMetadata = {
	hfcme: {
		packages: [
			{
				name: 'HighFrequencyCovariance.jl',
				github: 'https://github.com/s-fuerst/HighFrequencyCovariance.jl',
				papers: [
					{ title: 'Multivariate Realised Kernels: Consistent Positive Semi-Definite Estimators of the Covariation of Equity Prices with Noise and Non-Synchronous Trading', authors: 'Barndorff-Nielsen, Hansen, Lunde & Shephard', year: 2011, journal: 'Journal of Econometrics', doi: '10.1016/j.jeconom.2011.02.007', openAccess: false },
					{ title: 'Estimating Covariation: Epps Effect, Microstructure Noise', authors: 'Zhang', year: 2011, journal: 'Journal of Econometrics', doi: '10.1016/j.jeconom.2010.07.006', openAccess: false },
				],
			},
		],
		notebooks: [
			{ name: 'Realized Covariance Basics',    file: 'hfcme/tutorial-01-rc.ipynb',        bundled: true, description: 'Synchronising tick data and computing realized covariance with Simple()' },
			{ name: 'Pre-averaged Estimation',       file: 'hfcme/tutorial-02-pav.ipynb',       bundled: true, description: 'Noise-robust covariance via pre-averaging with bandwidth H' },
			{ name: 'Two-Scales Estimation',         file: 'hfcme/tutorial-03-tsrc.ipynb',      bundled: true, description: 'Bias-corrected covariance combining slow and fast realized covariance' },
			{ name: 'PSD Regularization',            file: 'hfcme/tutorial-04-psd.ipynb',       bundled: true, description: 'Nearest positive semi-definite projection and eigenvalue clipping' },
		],
		wikis: [
			{ name: 'Overview',        file: 'hfcme/overview.md',        bundled: true },
			{ name: 'Factsheet',       file: 'hfcme/factsheet.md',       bundled: true },
			{ name: 'Assumptions',     file: 'hfcme/assumptions.md',     bundled: true },
			{ name: 'Diagnostics',     file: 'hfcme/diagnostics.md',     bundled: true },
			{ name: 'Interpretation',  file: 'hfcme/interpretation.md',  bundled: true },
			{ name: 'Decision Guide',  file: 'hfcme/decision-guide.md',  bundled: true },
		],
		tooltips: {
			p:      'Price data for N assets. Accepts a matrix of synchronised prices (T&#215;N) or a vector of N tick-data series with irregular timestamps. Prices should be raw levels, not returns &#8212; log-returns are computed internally.',
			assets: 'Names or integer count of assets to estimate. When passing raw tick series, supply a string vector of asset tickers matching the column order of p.',
			H:      'Pre-averaging bandwidth: number of consecutive ticks over which each return is smoothed before forming outer products. Larger H removes more noise but reduces the effective number of observations. Typical range: 3&#8211;15.',
			K:      'Number of sub-sampling grids for the slow scale. The two-scales estimator uses K evenly spaced sub-grids of ticks to estimate slow-scale covariation and subtracts a fast-scale noise correction. Typical range: 5&#8211;30.',
		},
	},
};

export function openHfcmeWebview(
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
			title: HFCME_TITLE,
			options: { retainContextWhenHidden: true },
			contentOptions: { allowScripts: true },
			extension: undefined,
		},
		HFCME_VIEW_TYPE,
		HFCME_TITLE,
		undefined,
		{ group: undefined, preserveFocus: false }
	);

	webviewInput.webview.setHtml(getHfcmeHtml());

	registerHfcmeWebviewHandlers(
		webviewInput,
		HFCME_METADATA,
		openerService,
		editorService,
		quickInputService,
		commandService,
		clipboardService,
		notificationService,
	);
}
