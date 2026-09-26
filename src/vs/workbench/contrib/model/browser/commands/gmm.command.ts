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
import { IGmmMetadata } from '../common/gmm.types.js';
import { registerGmmWebviewHandlers } from '../handlers/gmm.handler.js';
import { getGmmHtml } from '../webviews/gmm.template.js';

const GMM_VIEW_TYPE = 'pollis.gmm';
const GMM_TITLE = 'Generalized Method of Moments (GMM)';

const GMM_METADATA: IGmmMetadata = {
	gmm: {
		packages: [
			{
				name: 'Microeconometrics.jl',
				github: 'https://github.com/lbittarello/Microeconometrics.jl',
				papers: [
					{
						title: 'Large Sample Properties of Generalized Method of Moments Estimators',
						authors: 'Hansen, L. P.',
						year: 1982,
						url: 'https://doi.org/10.2307/1912775',
						openAccess: false,
					},
					{
						title: 'A Simple, Positive Semi-Definite, Heteroskedasticity and Autocorrelation Consistent Covariance Matrix',
						authors: 'Newey, W. K., & West, K. D.',
						year: 1987,
						url: 'https://doi.org/10.2307/1913610',
						openAccess: false,
					},
					{
						title: 'Finite-Sample Properties of Some Alternative GMM Estimators',
						authors: 'Hansen, L. P., Heaton, J., & Yaron, A.',
						year: 1996,
						url: 'https://doi.org/10.1080/07350015.1996.10524656',
						openAccess: false,
					},
					{
						title: 'Generalized Instrumental Variables Estimation of Nonlinear Rational Expectations Models',
						authors: 'Hansen, L. P., & Singleton, K. J.',
						year: 1982,
						url: 'https://doi.org/10.2307/1911873',
						openAccess: false,
					},
				],
			},
		],
		notebooks: [
			{ name: 'Quick Start',         file: 'gmm/tutorial-01-quickstart.ipynb',  bundled: true, description: 'Estimate a GMM model and read the coefficient table' },
			{ name: 'Two-Step GMM',        file: 'gmm/tutorial-02-twostep.ipynb',     bundled: true, description: 'Efficient two-step GMM with optimal weighting matrix' },
			{ name: 'J-Statistic',         file: 'gmm/tutorial-03-jtest.ipynb',       bundled: true, description: 'Hansen overidentification test for instrument validity' },
			{ name: 'Standard Errors',     file: 'gmm/tutorial-04-vcov.ipynb',        bundled: true, description: 'Heteroscedastic and clustered standard errors for GMM' },
		],
		wikis: [
			{ name: 'Overview',       file: 'gmm/overview.md',       bundled: true },
			{ name: 'Factsheet',      file: 'gmm/factsheet.md',      bundled: true },
			{ name: 'Assumptions',    file: 'gmm/assumptions.md',    bundled: true },
			{ name: 'Diagnostics',    file: 'gmm/diagnostics.md',    bundled: true },
			{ name: 'Interpretation', file: 'gmm/interpretation.md', bundled: true },
			{ name: 'Decision Guide', file: 'gmm/decision-guide.md', bundled: true },
		],
		tooltips: {
			y:       'Response (dependent) variable column name in the data frame.',
			exog:    'Space-separated names of exogenous regressors included in the moment conditions.',
			endog:   'Space-separated names of endogenous regressors &#8212; variables correlated with the structural error.',
			instr:   'Space-separated names of excluded instruments. Requires at least as many instruments as endogenous variables for identification.',
			vcov:    'Moment-condition variance estimator. Heteroscedastic gives the efficient two-step GMM weighting matrix; Clustered is recommended with grouped data.',
			data:    'Name of the data frame (AbstractDataFrame). Must contain all columns referenced in the model.',
			cluster: 'Column name for cluster groups. Clusters the moment conditions, producing cluster-robust standard errors.',
		},
	},
};

export function openGmmWebview(
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
			title: GMM_TITLE,
			options: { retainContextWhenHidden: true },
			contentOptions: { allowScripts: true },
			extension: undefined,
		},
		GMM_VIEW_TYPE,
		GMM_TITLE,
		undefined,
		{ group: undefined, preserveFocus: false }
	);

	webviewInput.webview.setHtml(getGmmHtml());

	registerGmmWebviewHandlers(
		webviewInput,
		GMM_METADATA,
		openerService,
		editorService,
		quickInputService,
		commandService,
		clipboardService,
		notificationService,
	);
}
