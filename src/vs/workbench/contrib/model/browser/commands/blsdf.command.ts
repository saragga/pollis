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
import { IBlsdfMetadata } from '../common/blsdf.types.js';
import { registerBlsdfWebviewHandlers } from '../handlers/blsdf.handler.js';
import { getBlsdfHtml } from '../webviews/blsdf.template.js';

const BLSDF_VIEW_TYPE = 'pollis.blsdf';
const BLSDF_TITLE = 'Bayesian Linear Stochastic Discount Factor';

const BLSDF_METADATA: IBlsdfMetadata = {
	blsdf: {
		packages: [
			{
				name: 'BayesianFactorZoo.jl',
				github: 'https://github.com/eohne/BayesianFactorZoo.jl',
				papers: [
					{ title: 'Bayesian Solutions for the Factor Zoo: We Just Ran Two Quadrillion Models', authors: 'Bryzgalova, Huang & Julliard', year: 2023, journal: 'Journal of Finance', doi: '10.1111/jofi.13197', openAccess: false },
				],
			},
		],
		notebooks: [
			{ name: 'BayesianSDF Basics',          file: 'blsdf/tutorial-01-sdf.ipynb',           bundled: true, description: 'Estimating the stochastic discount factor with BayesianSDF() and interpreting posterior risk prices' },
			{ name: 'Spike-and-Slab Factor Selection', file: 'blsdf/tutorial-02-spike-slab.ipynb', bundled: true, description: 'Automatic factor selection via continuous_ss_sdf() and posterior inclusion probabilities' },
			{ name: 'Traded Factors Extension',    file: 'blsdf/tutorial-03-traded.ipynb',         bundled: true, description: 'continuous_ss_sdf_2(): spike-and-slab SDF with tradable factors as additional test assets' },
			{ name: 'Factor Zoo Application',      file: 'blsdf/tutorial-04-factor-zoo.ipynb',     bundled: true, description: 'Applying Bayesian SDF model selection to a large cross-section of candidate factors' },
		],
		wikis: [
			{ name: 'Overview',        file: 'blsdf/overview.md',        bundled: true },
			{ name: 'Factsheet',       file: 'blsdf/factsheet.md',       bundled: true },
			{ name: 'Assumptions',     file: 'blsdf/assumptions.md',     bundled: true },
			{ name: 'Diagnostics',     file: 'blsdf/diagnostics.md',     bundled: true },
			{ name: 'Interpretation',  file: 'blsdf/interpretation.md',  bundled: true },
			{ name: 'Decision Guide',  file: 'blsdf/decision-guide.md',  bundled: true },
		],
		tooltips: {
			f:         'T&#215;K matrix of factor excess returns. Rows are time periods, columns are candidate factors. Use monthly excess returns in percent for standard asset pricing.',
			R:         'T&#215;N matrix of test asset excess returns. Rows are time periods, columns are portfolios (e.g. 25 Fama-French size/value portfolios).',
			psi0:      'Prior scale on SDF loadings b. Larger values give a more diffuse prior. Default 5.0 is calibrated for monthly excess returns in percent.',
			intercept: 'true to allow a non-zero intercept in the SDF pricing equation (pricing errors); false imposes exact factor pricing. Only available for BayesianSDF.',
			sim_length: 'Number of MCMC posterior draws retained after burnin. Increase to 50 000 or more for publication-quality inference.',
			burnin:    'Number of initial MCMC draws to discard as warmup. Should be at least 10&#8211;20&#37; of sim_length.',
			v0:        'Spike variance: controls how tightly inactive factors are shrunk toward zero loading. Very small (e.g. 0.001) concentrates the spike near b_k = 0.',
			v1:        'Slab variance: controls the spread of the prior for active factors. Larger values (e.g. 1.0) allow large SDF loadings when a factor is included.',
			t_factors: 'Integer vector of column indices (1-based) identifying which factors in f are tradable. E.g. [1, 2] means columns 1 and 2 of f are traded assets whose excess returns impose an extra moment condition.',
		},
	},
};

export function openBlsdfWebview(
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
			title: BLSDF_TITLE,
			options: { retainContextWhenHidden: true },
			contentOptions: { allowScripts: true },
			extension: undefined,
		},
		BLSDF_VIEW_TYPE,
		BLSDF_TITLE,
		undefined,
		{ group: undefined, preserveFocus: false }
	);

	webviewInput.webview.setHtml(getBlsdfHtml());

	registerBlsdfWebviewHandlers(
		webviewInput,
		BLSDF_METADATA,
		openerService,
		editorService,
		quickInputService,
		commandService,
		clipboardService,
		notificationService,
	);
}
