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
import { IDfMetadata } from '../common/df.types.js';
import { registerDfWebviewHandlers } from '../handlers/df.handler.js';
import { getDfHtml } from '../webviews/df.template.js';

const DF_VIEW_TYPE = 'pollis.df';
const DF_TITLE = 'Distribution Factories';

const DF_METADATA: IDfMetadata = {
	df: {
		packages: [
			{ name: 'DistributionsFactories.jl', github: 'https://github.com/Distribution-Matching/DistributionsFactories.jl', papers: [] },
			{ name: 'Distributions.jl', github: 'https://github.com/JuliaStats/Distributions.jl', papers: [] },
		],
		notebooks: [
			{ name: 'Mean & Std Factories', file: 'df/tutorial-01-moments.ipynb', bundled: true, description: 'Constructing distributions from mean, standard deviation, and variance' },
			{ name: 'Quantile Matching', file: 'df/tutorial-02-quantiles.ipynb', bundled: true, description: 'Finding distributions that match specified probability-quantile pairs' },
			{ name: 'Fit to Data', file: 'df/tutorial-03-fit.ipynb', bundled: true, description: 'Maximum likelihood and method-of-moments fitting to observed data' },
			{ name: 'Practical Examples', file: 'df/tutorial-04-examples.ipynb', bundled: true, description: 'Real-world scenarios: insurance losses, component lifetimes, and count data' },
		],
		wikis: [
			{ name: 'Overview',        file: 'df/overview.md',        bundled: true },
			{ name: 'Factsheet',       file: 'df/factsheet.md',       bundled: true },
			{ name: 'Assumptions',     file: 'df/assumptions.md',     bundled: true },
			{ name: 'Diagnostics',     file: 'df/diagnostics.md',     bundled: true },
			{ name: 'Interpretation',  file: 'df/interpretation.md',  bundled: true },
			{ name: 'Decision Guide',  file: 'df/decision-guide.md',  bundled: true },
		],
	},
};

export function openDfWebview(
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
			title: DF_TITLE,
			options: { retainContextWhenHidden: true },
			contentOptions: { allowScripts: true },
			extension: undefined,
		},
		DF_VIEW_TYPE,
		DF_TITLE,
		undefined,
		{ group: undefined, preserveFocus: false }
	);

	webviewInput.webview.setHtml(getDfHtml());

	registerDfWebviewHandlers(
		webviewInput,
		DF_METADATA,
		openerService,
		editorService,
		quickInputService,
		commandService,
		clipboardService,
		notificationService,
	);
}
