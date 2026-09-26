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
import { IHptMetadata } from '../common/hpt.types.js';
import { registerHptWebviewHandlers } from '../handlers/hpt.handler.js';
import { getHptHtml } from '../webviews/hpt.template.js';

const HPT_VIEW_TYPE = 'pollis.hpt';
const HPT_TITLE = 'Hyperparameter Tuning';

const HPT_METADATA: IHptMetadata = {
	hpt: {
		packages: [
			{
				name: 'MLJ.jl',
				github: 'https://github.com/alan-turing-institute/MLJ.jl',
				papers: [
					{ title: 'MLJ: A Julia Package for Composable Machine Learning', authors: 'Blaom, A.D., Kiraly, F., Lienart, T. et al.', year: 2020, url: 'https://doi.org/10.21105/joss.02704', openAccess: true },
				],
			},
			{
				name: 'Hyperopt.jl',
				github: 'https://github.com/baggepinnen/Hyperopt.jl',
				papers: [],
			},
		],
		notebooks: [
			{ name: 'Grid Search',        file: 'model-workflow/tutorial-01-grid-search.ipynb',     bundled: true, description: 'Exhaustive grid search over hyperparameter combinations with MLJ.jl' },
			{ name: 'Random Search',      file: 'model-workflow/tutorial-02-random-search.ipynb',   bundled: true, description: 'Efficient random sampling from parameter distributions with MLJ.jl' },
			{ name: 'Bayesian Optimisation', file: 'model-workflow/tutorial-03-bayesian-hpt.ipynb', bundled: true, description: 'GP-guided Bayesian optimisation of hyperparameters with Hyperopt.jl' },
		],
		wikis: [
			{ name: 'Overview',              file: 'model-workflow/hpt-overview.md',    bundled: true },
			{ name: 'Grid Search',           file: 'model-workflow/hpt-grid.md',        bundled: true },
			{ name: 'Random Search',         file: 'model-workflow/hpt-random.md',      bundled: true },
			{ name: 'Bayesian Optimisation', file: 'model-workflow/hpt-bayesian.md',    bundled: true },
			{ name: 'Choosing a Strategy',   file: 'model-workflow/hpt-strategy.md',    bundled: true },
		],
	},
};

export function openHptWebview(
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
			title: HPT_TITLE,
			options: { retainContextWhenHidden: true },
			contentOptions: { allowScripts: true },
			extension: undefined,
		},
		HPT_VIEW_TYPE,
		HPT_TITLE,
		undefined,
		{ group: undefined, preserveFocus: false }
	);

	webviewInput.webview.setHtml(getHptHtml());

	registerHptWebviewHandlers(
		webviewInput,
		HPT_METADATA,
		openerService,
		editorService,
		quickInputService,
		commandService,
		clipboardService,
		notificationService,
		initialModel,
	);
}
