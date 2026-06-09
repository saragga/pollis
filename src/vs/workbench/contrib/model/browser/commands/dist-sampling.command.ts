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
import { IDistMetadata } from '../common/dist.types.js';
import { registerDistWebviewHandlers } from '../handlers/dist.handler.js';
import { getDistSamplingHtml } from '../webviews/dist-sampling.template.js';

const DIST_SAMPLING_VIEW_TYPE = 'pollis.dist.sampling';
const DIST_SAMPLING_TITLE = 'Distribution Sampling';

const DIST_SAMPLING_METADATA: IDistMetadata = {
	dist: {
		packages: [
			{ name: 'Distributions.jl', github: 'https://github.com/JuliaStats/Distributions.jl', papers: [] },
		],
		notebooks: [
			{ name: 'Univariate Distributions (Jupyter)', file: 'dist/tutorial-01-univariate.ipynb', bundled: true, description: 'Working with discrete and continuous univariate distributions' },
			{ name: 'Univariate Distributions (Pluto)',  file: 'dist/tutorial-01-univariate.jl',    bundled: true, description: 'Reactive Pluto notebook — discrete and continuous univariate distributions' },
			{ name: 'Truncated and Censored', file: 'dist/tutorial-02-truncated-censored.ipynb', bundled: true, description: 'Constraining distributions with bounds' },
			{ name: 'Multivariate Distributions', file: 'dist/tutorial-03-multivariate.ipynb', bundled: true, description: 'Vector-valued distributions including MvNormal and Dirichlet' },
			{ name: 'Mixture and Composite', file: 'dist/tutorial-04-mixture-composite.ipynb', bundled: true, description: 'Mixture models, product distributions, and convolutions' },
		],
		wikis: [
			{ name: 'Overview',           file: 'dist/overview.md',               bundled: true },
			{ name: 'Factsheet',          file: 'dist/factsheet.md',              bundled: true },
			{ name: 'Assumptions',        file: 'dist/assumptions.md',            bundled: true },
			{ name: 'Diagnostics',        file: 'dist/diagnostics.md',            bundled: true },
			{ name: 'Interpretation',     file: 'dist/interpretation.md',         bundled: true },
			{ name: 'Decision Guide',     file: 'dist/decision-guide.md',         bundled: true },
			{ name: 'Pollis vs Crystal Ball', file: 'dist/pollis-vs-crystalball.md', bundled: true },
		],
	},
};

export function openDistSamplingWebview(
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
			title: DIST_SAMPLING_TITLE,
			options: { retainContextWhenHidden: true },
			contentOptions: { allowScripts: true },
			extension: undefined,
		},
		DIST_SAMPLING_VIEW_TYPE,
		DIST_SAMPLING_TITLE,
		undefined,
		{ group: undefined, preserveFocus: false }
	);

	webviewInput.webview.setHtml(getDistSamplingHtml());

	registerDistWebviewHandlers(
		webviewInput,
		DIST_SAMPLING_METADATA,
		openerService,
		editorService,
		quickInputService,
		commandService,
		clipboardService,
		notificationService,
	);
}
