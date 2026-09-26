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
import { ITslsMetadata } from '../common/tsls.types.js';
import { registerTslsWebviewHandlers } from '../handlers/tsls.handler.js';
import { getTslsHtml } from '../webviews/tsls.template.js';

const TSLS_VIEW_TYPE = 'pollis.tsls';
const TSLS_TITLE = 'Two-Stage Least Squares (2SLS)';

const TSLS_METADATA: ITslsMetadata = {
	tsls: {
		packages: [
			{
				name: 'Microeconometrics.jl',
				github: 'https://github.com/lbittarello/Microeconometrics.jl',
				papers: [
					{
						title: 'A Generalized Classical Method of Linear Estimation of Coefficients in a Structural Equation',
						authors: 'Basmann, R. L.',
						year: 1957,
						url: 'https://doi.org/10.2307/1907743',
						openAccess: false,
					},
					{
						title: 'The Estimation of Economic Relationships Using Instrumental Variables',
						authors: 'Sargan, J. D.',
						year: 1958,
						url: 'https://doi.org/10.2307/1907619',
						openAccess: false,
					},
					{
						title: 'Instrumental Variables and the Search for Identification: From Supply and Demand to Natural Experiments',
						authors: 'Angrist, J. D., & Krueger, A. B.',
						year: 2001,
						url: 'https://doi.org/10.1257/jep.15.4.69',
						openAccess: true,
					},
					{
						title: 'A Survey of Weak Instruments and Weak Identification in Generalized Method of Moments',
						authors: 'Stock, J. H., Wright, J. H., & Yogo, M.',
						year: 2002,
						url: 'https://doi.org/10.1198/073500102288618658',
						openAccess: false,
					},
				],
			},
		],
		notebooks: [
			{ name: 'Quick Start',           file: 'tsls/tutorial-01-quickstart.ipynb',  bundled: true, description: 'Estimate a 2SLS model and interpret the structural coefficients' },
			{ name: 'Instrument Validity',   file: 'tsls/tutorial-02-instruments.ipynb', bundled: true, description: 'Test instrument relevance and exogeneity' },
			{ name: 'Standard Errors',       file: 'tsls/tutorial-03-vcov.ipynb',        bundled: true, description: 'Homoscedastic, heteroscedastic, and clustered SEs' },
			{ name: 'Hausman Test',          file: 'tsls/tutorial-04-hausman.ipynb',     bundled: true, description: 'Test endogeneity: compare OLS and 2SLS estimates' },
		],
		wikis: [
			{ name: 'Overview',       file: 'tsls/overview.md',       bundled: true },
			{ name: 'Factsheet',      file: 'tsls/factsheet.md',      bundled: true },
			{ name: 'Assumptions',    file: 'tsls/assumptions.md',    bundled: true },
			{ name: 'Diagnostics',    file: 'tsls/diagnostics.md',    bundled: true },
			{ name: 'Interpretation', file: 'tsls/interpretation.md', bundled: true },
			{ name: 'Decision Guide', file: 'tsls/decision-guide.md', bundled: true },
		],
		tooltips: {
			y:       'Response (dependent) variable column name in the data frame.',
			exog:    'Space-separated names of exogenous regressors (included instruments). An intercept is added automatically.',
			endog:   'Space-separated names of endogenous regressors &#8212; variables correlated with the structural error.',
			instr:   'Space-separated names of excluded instruments. Must be correlated with endogenous regressors and uncorrelated with the error (rank and exclusion conditions).',
			vcov:    'Variance-covariance estimator for standard errors. Homoscedastic assumes IID errors; Heteroscedastic gives White-robust SEs.',
			data:    'Name of the data frame (AbstractDataFrame). Must contain all columns referenced in the model.',
			cluster: 'Column name identifying cluster groups for clustered standard errors (e.g. firm ID, region code).',
		},
	},
};

export function openTslsWebview(
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
			title: TSLS_TITLE,
			options: { retainContextWhenHidden: true },
			contentOptions: { allowScripts: true },
			extension: undefined,
		},
		TSLS_VIEW_TYPE,
		TSLS_TITLE,
		undefined,
		{ group: undefined, preserveFocus: false }
	);

	webviewInput.webview.setHtml(getTslsHtml());

	registerTslsWebviewHandlers(
		webviewInput,
		TSLS_METADATA,
		openerService,
		editorService,
		quickInputService,
		commandService,
		clipboardService,
		notificationService,
	);
}
