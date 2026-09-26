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
import { IRqrMetadata } from '../common/rqr.types.js';
import { registerRqrWebviewHandlers } from '../handlers/rqr.handler.js';
import { getRqrHtml } from '../webviews/rqr.template.js';

const RQR_VIEW_TYPE = 'pollis.rqr';
const RQR_TITLE = 'Robust and Quantile Regression';

const RQR_METADATA: IRqrMetadata = {
	rqr: {
		packages: [
			{
				name: 'RobustModels.jl',
				github: 'https://github.com/getzze/RobustModels.jl',
				papers: [
					{
						title: 'Robust Estimation of a Location Parameter',
						authors: 'Huber, P.J.',
						year: 1964,
						journal: 'The Annals of Mathematical Statistics',
						doi: '10.1214/aoms/1177703732',
						googleScholar: 'https://scholar.google.com/scholar?hl=en&as_sdt=0%2C5&q=Robust+Estimation+of+a+Location+Parameter+Huber&btnG=',
						googleScholarCited: 12808,
						openAccess: true,
					},
					{
						title: 'Robust Statistics: Theory and Methods (with R)',
						authors: 'Maronna, R.A.; Martin, R.D.; Yohai, V.J.; Salibián-Barrera, M.',
						year: 2019,
						journal: 'Wiley Series in Probability and Statistics',
						googleScholar: 'https://scholar.google.com/scholar?hl=en&as_sdt=0%2C5&q=Robust+Statistics+Theory+and+Methods+Maronna+Martin+Yohai&btnG=',
						googleScholarCited: 4840,
						openAccess: false,
					},
				],
			},
		],
		notebooks: [
			{ name: 'Robust Regression', file: 'rqr/tutorial-01-robust-regression.ipynb', bundled: true, description: 'Introduction to robust M-estimators and outlier resistance' },
			{ name: 'Quantile Regression', file: 'rqr/tutorial-02-quantile-regression.ipynb', bundled: true, description: 'Fitting conditional quantiles and interpreting τ' },
			{ name: 'Penalised Fitting', file: 'rqr/tutorial-03-penalties.ipynb', bundled: true, description: 'L1 and L2 regularisation for robust and quantile models' },
			{ name: 'Practical Examples', file: 'rqr/tutorial-04-examples.ipynb', bundled: true, description: 'Real-world examples and comparison with OLS' },
		],
		wikis: [
			{ name: 'Overview',        file: 'rqr/overview.md',        bundled: true },
			{ name: 'Factsheet',       file: 'rqr/factsheet.md',       bundled: true },
			{ name: 'Assumptions',     file: 'rqr/assumptions.md',     bundled: true },
			{ name: 'Diagnostics',     file: 'rqr/diagnostics.md',     bundled: true },
			{ name: 'Interpretation',  file: 'rqr/interpretation.md',  bundled: true },
			{ name: 'Decision Guide',  file: 'rqr/decision-guide.md',  bundled: true },
		],
		tooltips: {
			formula: 'Julia formula using the @formula macro. Response goes left of ~, predictors right.\ny ~ x1 + x2 — additive effects\ny ~ x1 * x2 — includes interaction x1:x2\ny ~ x1 + x2 + x3 — multivariate',
			data: 'DataFrame containing all variables referenced in the formula. Column names must match formula symbols exactly.',
			estimator: 'M-estimator loss function controlling outlier resistance.\nHuber — moderate resistance, efficient near normality (recommended default)\nTukey bisquare — strong resistance, fully rejects large outliers\nHampel — three-part redescending loss\nAndrews wave — smooth redescending\nL1 (LAD) — median regression, maximum resistance',
			tau: 'Quantile level τ ∈ (0, 1). The model fits the conditional τ-quantile of the response.\nτ = 0.5 — median regression (most common)\nτ = 0.25 — lower quartile\nτ = 0.75 — upper quartile',
			lambda: 'Regularisation strength λ ≥ 0. Larger values shrink coefficients more strongly.\nL1 penalty — promotes sparsity (some coefficients set exactly to zero)\nL2 penalty — shrinks all coefficients, none forced to zero',
		},
	},
};

export function openRqrWebview(
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
			title: RQR_TITLE,
			options: { retainContextWhenHidden: true },
			contentOptions: { allowScripts: true },
			extension: undefined,
		},
		RQR_VIEW_TYPE,
		RQR_TITLE,
		undefined,
		{ group: undefined, preserveFocus: false }
	);

	webviewInput.webview.setHtml(getRqrHtml());

	registerRqrWebviewHandlers(
		webviewInput,
		RQR_METADATA,
		openerService,
		editorService,
		quickInputService,
		commandService,
		clipboardService,
		notificationService,
		initialMode
	);
}
