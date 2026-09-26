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
import { ICovShrinkageMetadata } from '../common/cov-shrinkage.types.js';
import { IModelReference } from '../common/model.types.js';
import { registerCovShrinkageWebviewHandlers } from '../handlers/cov-shrinkage.handler.js';
import { getCovShrinkageHtml } from '../webviews/cov-shrinkage.template.js';

const COV_SHRINKAGE_VIEW_TYPE = 'pollis.cov-shrinkage';
const COV_SHRINKAGE_TITLE = 'Regularised Covariance Estimation';

const COV_SHRINKAGE_REFERENCES: IModelReference[] = [
	{ separator: true, label: 'Software' },
	{
		title: 'Julia: A Fresh Approach to Numerical Computing',
		authors: 'Bezanson, Jeff; Edelman, Alan; Karpinski, Stefan; Shah, Viral B.',
		year: 2017,
		journal: 'SIAM Review',
		doi: '10.1137/141000671',
		openAccess: false,
	},
	{ separator: true, label: 'Textbooks' },
	{
		title: 'Random Matrix Theory and Wireless Communications',
		authors: 'Tulino, Antonia M.; Verdu, Sergio',
		year: 2004,
		journal: 'Foundations and Trends in Communications and Information Theory',
		doi: '10.1561/0100000001',
		openAccess: false,
	},
	{ separator: true, label: 'Original Papers' },
	{
		title: 'Honey, I Shrunk the Sample Covariance Matrix',
		authors: 'Ledoit, Olivier; Wolf, Michael',
		year: 2004,
		journal: 'Journal of Portfolio Management',
		doi: '10.3905/jpm.2004.110',
		openAccess: false,
	},
	{
		title: 'Shrinkage Algorithms for MMSE Covariance Estimation',
		authors: 'Chen, Yilun; Wiesel, Ami; Eldar, Yonina C.; Hero, Alfred O.',
		year: 2010,
		journal: 'IEEE Transactions on Signal Processing',
		doi: '10.1109/TSP.2010.2053029',
		openAccess: false,
	},
	{
		title: 'Analytical Nonlinear Shrinkage of Large-Dimensional Covariance Matrices',
		authors: 'Ledoit, Olivier; Wolf, Michael',
		year: 2020,
		journal: 'Annals of Statistics',
		doi: '10.1214/19-AOS1921',
		openAccess: true,
	},
];

const COV_SHRINKAGE_METADATA: ICovShrinkageMetadata = {
	covShrinkage: {
		packages: [
			{
				name: 'CovarianceEstimation.jl',
				github: 'https://mateuszbaran.github.io/CovarianceEstimation.jl/stable/',
				papers: [],
			},
		],
		notebooks: [
			{
				name: 'Linear Shrinkage',
				file: 'cov-shrinkage/tutorial-01-linear-shrinkage.ipynb',
				bundled: true,
				description: 'Ledoit-Wolf and Oracle-Approximating linear shrinkage towards structured targets — ConstantCorrelation, DiagonalCommonVariance, RBLW, OAS',
			},
			{
				name: 'Analytical Nonlinear Shrinkage',
				file: 'cov-shrinkage/tutorial-02-nonlinear-shrinkage.ipynb',
				bundled: true,
				description: 'Nonlinear eigenvalue shrinkage via the Ledoit-Wolf (2020) oracle formula — optimal for large p/n ratios',
			},
			{
				name: 'Woodbury Estimator',
				file: 'cov-shrinkage/tutorial-03-woodbury.ipynb',
				bundled: true,
				description: 'Low-rank plus diagonal structured estimator suited to very high-dimensional problems',
			},
			{
				name: 'Biweight Midcovariance',
				file: 'cov-shrinkage/tutorial-04-biweight.ipynb',
				bundled: true,
				description: 'Robust covariance estimator based on Tukey biweight — highly resistant to outliers and heavy-tailed distributions',
			},
		],
		wikis: [
			{ name: 'Factsheet',           file: 'cov-shrinkage/factsheet.md',           bundled: true },
			{ name: 'Overview',            file: 'cov-shrinkage/overview.md',            bundled: true },
			{ name: 'Assumptions',         file: 'cov-shrinkage/assumptions.md',         bundled: true },
			{ name: 'Diagnostics',         file: 'cov-shrinkage/diagnostics.md',         bundled: true },
			{ name: 'Interpretation',      file: 'cov-shrinkage/interpretation.md',      bundled: true },
			{ name: 'Decision Guide',      file: 'cov-shrinkage/decision-guide.md',      bundled: true },
			{ separator: true, label: 'Estimators' },
			{ name: 'Linear Shrinkage',    file: 'cov-shrinkage/linear-shrinkage.md',    bundled: true },
			{ name: 'Nonlinear Shrinkage', file: 'cov-shrinkage/nonlinear-shrinkage.md', bundled: true },
			{ name: 'Woodbury Estimator',  file: 'cov-shrinkage/woodbury.md',            bundled: true },
			{ name: 'Biweight',            file: 'cov-shrinkage/biweight.md',            bundled: true },
		],
		references: COV_SHRINKAGE_REFERENCES,
	},
};

export function openCovShrinkageWebview(
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
			title: COV_SHRINKAGE_TITLE,
			options: { retainContextWhenHidden: true },
			contentOptions: { allowScripts: true },
			extension: undefined,
		},
		COV_SHRINKAGE_VIEW_TYPE,
		COV_SHRINKAGE_TITLE,
		undefined,
		{ group: undefined, preserveFocus: false }
	);

	webviewInput.webview.setHtml(getCovShrinkageHtml());

	registerCovShrinkageWebviewHandlers(
		webviewInput,
		COV_SHRINKAGE_METADATA,
		openerService,
		editorService,
		quickInputService,
		commandService,
		clipboardService,
		notificationService,
		initialModel,
	);
}
