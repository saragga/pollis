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
import { ILassoMetadata } from '../common/lasso.types.js';
import { registerLassoWebviewHandlers } from '../handlers/lasso.handler.js';
import { getLassoHtml } from '../webviews/lasso.template.js';

const LASSO_VIEW_TYPE = 'pollis.lasso';
const LASSO_TITLE = 'Penalised & Projection Regression';

const LASSO_METADATA: ILassoMetadata = {
	lasso: {
		packages: [
			{ name: 'Lasso.jl', github: 'https://github.com/JuliaStats/Lasso.jl', papers: [] },
			{
				name: 'MultivariateStats.jl',
				github: 'https://github.com/JuliaStats/MultivariateStats.jl',
				papers: [
					{ title: 'PLS-regression: a basic tool of chemometrics', authors: 'Wold, S., Sjöström, M. & Eriksson, L.', year: 2001, url: 'https://doi.org/10.1016/S0169-7439(01)00155-1', openAccess: false },
				],
			},
		],
		notebooks: [
			{ name: 'Lasso Basics',      file: 'lasso/tutorial-01-lasso.ipynb',           bundled: true, description: 'Introduction to Lasso regression and regularisation paths' },
			{ name: 'ElasticNet',        file: 'lasso/tutorial-02-elasticnet.ipynb',       bundled: true, description: 'ElasticNet regression and the α mixing parameter' },
			{ name: 'λ Selection',  file: 'lasso/tutorial-03-lambda-selection.ipynb', bundled: true, description: 'Cross-validation and AICc for optimal λ selection' },
			{ name: 'Variable Selection', file: 'lasso/tutorial-04-variable-selection.ipynb', bundled: true, description: 'Using sparsity for automatic variable selection' },
			{ name: 'PLSR',              file: 'lasso/tutorial-05-plsr.ipynb',             bundled: true, description: 'Partial Least Squares Regression with MultivariateStats.jl — components, scores, and prediction' },
		],
		wikis: [
			{ name: 'Overview',        file: 'lasso/overview.md',        bundled: true },
			{ name: 'Factsheet',       file: 'lasso/factsheet.md',       bundled: true },
			{ name: 'Assumptions',     file: 'lasso/assumptions.md',     bundled: true },
			{ name: 'Diagnostics',     file: 'lasso/diagnostics.md',     bundled: true },
			{ name: 'Interpretation',  file: 'lasso/interpretation.md',  bundled: true },
			{ name: 'Decision Guide',  file: 'lasso/decision-guide.md',  bundled: true },
		],
		tooltips: {
			formula: 'Julia formula using the @formula macro. Response goes left of ~, predictors right.\ny ~ x1 + x2 — additive effects\ny ~ x1 * x2 — includes interaction x1:x2\ny ~ x1 + x2 + x3 — multivariate (Lasso performs automatic selection)',
			data: 'DataFrame containing all variables referenced in the formula. Column names must match formula symbols exactly.',
			lambda: 'Regularization strength (λ ≥ 0). Leave empty to fit the full regularization path and select λ automatically via AICc. Larger λ = stronger penalty = sparser model.',
			alpha: 'Mixing parameter between L1 (Lasso) and L2 (Ridge) penalties.\nα = 1 — pure Lasso (maximum sparsity)\nα = 0 — pure Ridge (no variable selection)\n0 < α < 1 — ElasticNet (grouped sparsity)\nDefault: 0.5',
		},
	},
};

export function openLassoWebview(
	webviewWorkbenchService: IWebviewWorkbenchService,
	openerService: IOpenerService,
	editorService: IEditorService,
	quickInputService: IQuickInputService,
	commandService: ICommandService,
	clipboardService: IClipboardService,
	notificationService: INotificationService,
	initialMode?: string
): void {
	const webviewInput = webviewWorkbenchService.openWebview(
		{
			title: LASSO_TITLE,
			options: { retainContextWhenHidden: true },
			contentOptions: { allowScripts: true },
			extension: undefined,
		},
		LASSO_VIEW_TYPE,
		LASSO_TITLE,
		undefined,
		{ group: undefined, preserveFocus: false }
	);

	webviewInput.webview.setHtml(getLassoHtml());

	registerLassoWebviewHandlers(
		webviewInput,
		LASSO_METADATA,
		openerService,
		editorService,
		quickInputService,
		commandService,
		clipboardService,
		notificationService,
		initialMode
	);
}
