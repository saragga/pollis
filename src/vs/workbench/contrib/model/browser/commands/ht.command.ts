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
import { IHtMetadata } from '../common/ht.types.js';
import { registerHtWebviewHandlers } from '../handlers/ht.handler.js';
import { getHtHtml } from '../webviews/ht.template.js';

const HT_VIEW_TYPE = 'pollis.ht';
const HT_TITLE = 'Hypothesis Testing';

const HT_METADATA: IHtMetadata = {
	ht: {
		packages: [
			{ name: 'HypothesisTests.jl', github: 'https://github.com/JuliaStats/HypothesisTests.jl', papers: [] },
		],
		notebooks: [
			{ name: 'Parametric Tests', file: 'ht/tutorial-01-parametric.ipynb', bundled: true, description: 'z-test, t-test, F-test, ANOVA and chi-squared tests' },
			{ name: 'Nonparametric Tests', file: 'ht/tutorial-02-nonparametric.ipynb', bundled: true, description: 'Rank-based, permutation, and distribution-free tests' },
			{ name: 'Time-Series Tests', file: 'ht/tutorial-03-timeseries.ipynb', bundled: true, description: 'Stationarity, autocorrelation, and forecast evaluation tests' },
			{ name: 'Multivariate Tests', file: 'ht/tutorial-04-multivariate.ipynb', bundled: true as const, description: 'Hotelling\'s T², covariance equality, and correlation tests' },
		],
		wikis: [
			{ name: 'Overview',        file: 'ht/overview.md',        bundled: true },
			{ name: 'Factsheet',       file: 'ht/factsheet.md',       bundled: true },
			{ name: 'Assumptions',     file: 'ht/assumptions.md',     bundled: true },
			{ name: 'Diagnostics',     file: 'ht/diagnostics.md',     bundled: true },
			{ name: 'Interpretation',  file: 'ht/interpretation.md',  bundled: true },
			{ name: 'Decision Guide',  file: 'ht/decision-guide.md',  bundled: true },
		],
	},
};

export function openHtWebview(
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
			title: HT_TITLE,
			options: { retainContextWhenHidden: true },
			contentOptions: { allowScripts: true },
			extension: undefined,
		},
		HT_VIEW_TYPE,
		HT_TITLE,
		undefined,
		{ group: undefined, preserveFocus: false }
	);

	webviewInput.webview.setHtml(getHtHtml());

	registerHtWebviewHandlers(
		webviewInput,
		HT_METADATA,
		openerService,
		editorService,
		quickInputService,
		commandService,
		clipboardService,
		notificationService,
	);
}
