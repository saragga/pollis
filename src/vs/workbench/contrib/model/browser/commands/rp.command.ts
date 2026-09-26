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
import { IRpMetadata } from '../common/rp.types.js';
import { registerRpWebviewHandlers } from '../handlers/rp.handler.js';
import { getRpHtml } from '../webviews/rp.template.js';

const RP_VIEW_TYPE = 'pollis.rp';
const RP_TITLE = 'Regression Performance';

const RP_METADATA: IRpMetadata = {
	rp: {
		packages: [
			{
				name: 'Statistics.jl',
				github: 'https://github.com/JuliaStats/Statistics.jl',
				papers: [],
			},
			{
				name: 'StatsBase.jl',
				github: 'https://github.com/JuliaStats/StatsBase.jl',
				papers: [],
			},
		],
		notebooks: [
			{ name: 'Regression Metrics',    file: 'model-workflow/tutorial-01-regression-metrics.ipynb',    bundled: true, description: 'Computing RMSE, MAE, R² and Adjusted R² — choosing the right metric for your task' },
			{ name: 'Residual Diagnostics',  file: 'model-workflow/tutorial-02-residual-diagnostics.ipynb',  bundled: true, description: 'Residual plots, Q-Q plots, and leverage diagnostics to validate regression assumptions' },
		],
		wikis: [
			{ name: 'Overview',        file: 'model-workflow/rp-overview.md',        bundled: true },
			{ name: 'Metric Guide',    file: 'model-workflow/rp-metric-guide.md',    bundled: true },
			{ name: 'Assumptions',     file: 'model-workflow/rp-assumptions.md',     bundled: true },
			{ name: 'Interpretation',  file: 'model-workflow/rp-interpretation.md',  bundled: true },
		],
	},
};

export function openRpWebview(
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
			title: RP_TITLE,
			options: { retainContextWhenHidden: true },
			contentOptions: { allowScripts: true },
			extension: undefined,
		},
		RP_VIEW_TYPE,
		RP_TITLE,
		undefined,
		{ group: undefined, preserveFocus: false }
	);

	webviewInput.webview.setHtml(getRpHtml());

	registerRpWebviewHandlers(
		webviewInput,
		RP_METADATA,
		openerService,
		editorService,
		quickInputService,
		commandService,
		clipboardService,
		notificationService,
	);
}
