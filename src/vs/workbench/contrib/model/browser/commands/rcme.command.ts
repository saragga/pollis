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
import { IRcmeMetadata } from '../common/rcme.types.js';
import { registerRcmeWebviewHandlers } from '../handlers/rcme.handler.js';
import { getRcmeHtml } from '../webviews/rcme.template.js';

const RCME_VIEW_TYPE = 'pollis.rcme';
const RCME_TITLE = 'Robust Covariance Matrix Estimation';

const RCME_METADATA: IRcmeMetadata = {
	rcme: {
		packages: [
			{
				name: 'CovarianceEstimation.jl',
				github: 'https://github.com/mateuszbaran/CovarianceEstimation.jl',
				papers: [
					{ title: 'A Well-Conditioned Estimator for Large-Dimensional Covariance Matrices', authors: 'Ledoit & Wolf', year: 2004, journal: 'Journal of Multivariate Analysis', doi: '10.1016/S0047-259X(03)00096-4', openAccess: false },
					{ title: 'Shrinkage Algorithms for MMSE Covariance Estimation', authors: 'Chen, Wiesel, Eldar & Hero', year: 2010, journal: 'IEEE Transactions on Signal Processing', doi: '10.1109/TSP.2010.2053029', openAccess: false },
					{ title: 'Analytical Nonlinear Shrinkage of Large-Dimensional Covariance Matrices', authors: 'Ledoit & Wolf', year: 2020, journal: 'Annals of Statistics', doi: '10.1214/19-AOS1921', openAccess: false },
				],
			},
		],
		notebooks: [
			{ name: 'Linear Shrinkage Basics',      file: 'rcme/tutorial-01-linear.ipynb',    bundled: true, description: 'Ledoit-Wolf and OAS linear shrinkage with different structured targets' },
			{ name: 'Shrinkage Target Selection',   file: 'rcme/tutorial-02-targets.ipynb',   bundled: true, description: 'Comparing DiagonalUnitVariance, ConstantCorrelation and other targets' },
			{ name: 'Nonlinear Shrinkage',          file: 'rcme/tutorial-03-nonlinear.ipynb', bundled: true, description: 'Eigenvalue-wise optimal estimation with AnalyticalNonlinearShrinkage' },
			{ name: 'Portfolio Applications',       file: 'rcme/tutorial-04-portfolio.ipynb', bundled: true, description: 'Minimum variance and maximum Sharpe portfolios using shrinkage covariance' },
		],
		wikis: [
			{ name: 'Overview',        file: 'rcme/overview.md',        bundled: true },
			{ name: 'Factsheet',       file: 'rcme/factsheet.md',       bundled: true },
			{ name: 'Assumptions',     file: 'rcme/assumptions.md',     bundled: true },
			{ name: 'Diagnostics',     file: 'rcme/diagnostics.md',     bundled: true },
			{ name: 'Interpretation',  file: 'rcme/interpretation.md',  bundled: true },
			{ name: 'Decision Guide',  file: 'rcme/decision-guide.md',  bundled: true },
		],
		tooltips: {
			X:      'T&#215;N data matrix: T observations in rows, N variables (assets) in columns. The estimator demeans each column internally before computing the covariance. Use returns, not price levels.',
			target: 'Structured matrix to shrink towards. Common choices: DiagonalUnitVariance() (scaled identity), DiagonalCommonVariance() (diagonal with average variance), ConstantCorrelation() (equal pairwise correlations). A well-specified target reduces finite-sample error.',
		},
	},
};

export function openRcmeWebview(
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
			title: RCME_TITLE,
			options: { retainContextWhenHidden: true },
			contentOptions: { allowScripts: true },
			extension: undefined,
		},
		RCME_VIEW_TYPE,
		RCME_TITLE,
		undefined,
		{ group: undefined, preserveFocus: false }
	);

	webviewInput.webview.setHtml(getRcmeHtml());

	registerRcmeWebviewHandlers(
		webviewInput,
		RCME_METADATA,
		openerService,
		editorService,
		quickInputService,
		commandService,
		clipboardService,
		notificationService,
	);
}
