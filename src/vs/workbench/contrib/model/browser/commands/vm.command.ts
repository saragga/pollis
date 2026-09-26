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
import { IVmMetadata } from '../common/vm.types.js';
import { registerVmWebviewHandlers } from '../handlers/vm.handler.js';
import { getVmHtml } from '../webviews/vm.template.js';

const VM_VIEW_TYPE = 'pollis.vm';
const VM_TITLE = 'Volatility Measurement';

const VM_METADATA: IVmMetadata = {
	vm: {
		packages: [
			{
				name: 'HighFrequencyCovariance.jl',
				github: 'https://github.com/s-baumann/HighFrequencyCovariance.jl',
				papers: [
					{ title: 'The Extreme Value Method for Estimating the Variance of the Rate of Return', authors: 'Parkinson, M.', year: 1980, url: 'https://doi.org/10.1086/260803', openAccess: false },
					{ title: 'On the Estimation of Security Price Volatilities from Historical Data', authors: 'Garman, M.B. & Klass, M.J.', year: 1980, url: 'https://doi.org/10.1086/260791', openAccess: false },
					{ title: 'Estimating Variance from High, Low, and Closing Prices', authors: 'Rogers, L.C.G. & Satchell, S.E.', year: 1991, url: 'https://doi.org/10.1214/aoap/1177005798', openAccess: false },
					{ title: 'Drift-Independent Volatility Estimation Based on High, Low, Open, and Close Prices', authors: 'Yang, D. & Zhang, Q.', year: 2000, url: 'https://doi.org/10.1086/209650', openAccess: false },
					{ title: 'Answering the Skeptics: Yes, Standard Volatility Models Do Provide Accurate Forecasts', authors: 'Andersen, T.G. & Bollerslev, T.', year: 1998, url: 'https://doi.org/10.2307/2527343', openAccess: false },
					{ title: 'A Tale of Two Time Scales: Determining Integrated Volatility With Noisy High-Frequency Data', authors: 'Zhang, L., Mykland, P.A. & Aït-Sahalia, Y.', year: 2005, url: 'https://doi.org/10.1198/016214505000000169', openAccess: false },
					{ title: 'Power and Bipower Variation with Stochastic Volatility and Jumps', authors: 'Barndorff-Nielsen, O.E. & Shephard, N.', year: 2004, url: 'https://doi.org/10.1093/jjfinec/nbh001', openAccess: false },
				],
			},
		],
		notebooks: [
			{ name: 'Parkinson Estimator', file: 'volatility-measurement/tutorial-01-parkinson.ipynb', bundled: true, description: 'Range-based volatility with daily high-low prices — Parkinson (1980)' },
			{ name: 'Garman-Klass Estimator', file: 'volatility-measurement/tutorial-02-garman-klass.ipynb', bundled: true, description: 'OHLC estimator with higher efficiency than Parkinson — Garman & Klass (1980)' },
			{ name: 'Rogers-Satchell Estimator', file: 'volatility-measurement/tutorial-03-rogers-satchell.ipynb', bundled: true, description: 'Drift-corrected OHLC estimator unbiased under non-zero mean returns' },
			{ name: 'Yang-Zhang Estimator', file: 'volatility-measurement/tutorial-04-yang-zhang.ipynb', bundled: true, description: 'Minimum-variance combination of overnight, close-to-close, and RS components' },
			{ name: 'Realized Volatility', file: 'volatility-measurement/tutorial-05-realized-volatility.ipynb', bundled: true, description: 'High-frequency realized variance from intraday log-returns — HighFrequencyCovariance.jl' },
			{ name: 'Two Scales Volatility', file: 'volatility-measurement/tutorial-06-two-scales.ipynb', bundled: true, description: 'Noise-robust TSRV estimator using slow/fast time-scale correction — Zhang et al. (2005)' },
			{ name: 'Bipower Variation', file: 'volatility-measurement/tutorial-07-bipower-variation.ipynb', bundled: true, description: 'Jump-robust integrated variance estimator using products of adjacent absolute returns — Barndorff-Nielsen & Shephard (2004)' },
		],
		wikis: [
			{ name: 'Introduction to HF Volatility', file: 'volatility-measurement/intro-hf-finance.md', bundled: true },
			{ name: 'Overview', file: 'volatility-measurement/overview.md', bundled: true },
			{ name: 'Parkinson', file: 'volatility-measurement/parkinson.md', bundled: true },
			{ name: 'Garman-Klass', file: 'volatility-measurement/garman-klass.md', bundled: true },
			{ name: 'Rogers-Satchell', file: 'volatility-measurement/rogers-satchell.md', bundled: true },
			{ name: 'Yang-Zhang', file: 'volatility-measurement/yang-zhang.md', bundled: true },
			{ name: 'Realized Volatility', file: 'volatility-measurement/realized-volatility.md', bundled: true },
			{ name: 'Two Scales Volatility', file: 'volatility-measurement/two-scales-volatility.md', bundled: true },
		],
	},
};

export function openVmWebview(
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
			title: VM_TITLE,
			options: { retainContextWhenHidden: true },
			contentOptions: { allowScripts: true },
			extension: undefined,
		},
		VM_VIEW_TYPE,
		VM_TITLE,
		undefined,
		{ group: undefined, preserveFocus: false }
	);

	webviewInput.webview.setHtml(getVmHtml());

	registerVmWebviewHandlers(
		webviewInput,
		VM_METADATA,
		openerService,
		editorService,
		quickInputService,
		commandService,
		clipboardService,
		notificationService,
		initialModel,
	);
}
