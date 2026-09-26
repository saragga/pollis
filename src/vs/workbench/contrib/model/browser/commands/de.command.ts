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
import { ITerminalService } from '../../../terminal/browser/terminal.js';
import { IDeMetadata } from '../common/de.types.js';
import { registerDeWebviewHandlers } from '../handlers/de.handler.js';
import { getDeHtml } from '../webviews/de.template.js';

const DE_VIEW_TYPE = 'pollis.de';
const DE_TITLE = 'Density Estimation';

const DE_METADATA: IDeMetadata = {
	de: {
		packages: [
			{ name: 'StatsBase.jl',                 github: 'https://github.com/JuliaStats/StatsBase.jl',                 papers: [] },
			{ name: 'KernelDensity.jl',              github: 'https://github.com/JuliaStats/KernelDensity.jl',              papers: [] },
			{ name: 'Distributions.jl',              github: 'https://github.com/JuliaStats/Distributions.jl',              papers: [] },
		],
		notebooks: [
			{ name: 'Non-Parametric Methods', file: 'de/tutorial-01-nonparametric.ipynb', bundled: true as const, description: 'Histogram, kernel density and average shifted histogram estimation' },
			{ name: 'Parametric Fitting',     file: 'de/tutorial-02-parametric.ipynb',   bundled: true as const, description: 'Fitting parametric distributions to data via MLE' },
		],
		wikis: [
			{ name: 'Overview',        file: 'de/overview.md',        bundled: true },
			{ name: 'Factsheet',       file: 'de/factsheet.md',       bundled: true },
			{ name: 'Assumptions',     file: 'de/assumptions.md',     bundled: true },
			{ name: 'Diagnostics',     file: 'de/diagnostics.md',     bundled: true },
			{ name: 'Interpretation',  file: 'de/interpretation.md',  bundled: true },
			{ name: 'Decision Guide',  file: 'de/decision-guide.md',  bundled: true },
		],
	},
};

export function openDeWebview(
	webviewWorkbenchService: IWebviewWorkbenchService,
	openerService: IOpenerService,
	editorService: IEditorService,
	quickInputService: IQuickInputService,
	commandService: ICommandService,
	clipboardService: IClipboardService,
	notificationService: INotificationService,
	terminalService: ITerminalService,
): void {
	const webviewInput = webviewWorkbenchService.openWebview(
		{
			title: DE_TITLE,
			options: { retainContextWhenHidden: true },
			contentOptions: { allowScripts: true },
			extension: undefined,
		},
		DE_VIEW_TYPE,
		DE_TITLE,
		undefined,
		{ group: undefined, preserveFocus: false }
	);

	webviewInput.webview.setHtml(getDeHtml());

	registerDeWebviewHandlers(
		webviewInput,
		DE_METADATA,
		openerService,
		editorService,
		quickInputService,
		commandService,
		clipboardService,
		notificationService,
		terminalService,
	);
}
