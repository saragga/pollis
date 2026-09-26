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
import { IVarMetadata } from '../common/var.types.js';
import { registerVarWebviewHandlers } from '../handlers/var.handler.js';
import { getVarHtml } from '../webviews/var.template.js';

const VAR_VIEW_TYPE = 'pollis.var';
const VAR_TITLE = 'VAR Models';

const VAR_METADATA: IVarMetadata = {
	var: {
		packages: [
			{ name: 'MacroEconometricModels.jl', github: 'https://github.com/FriedmanJP/MacroEconometricModels.jl', papers: [], license: 'GPL-3.0' },
			{ name: 'TransmissionChannelAnalysis.jl', github: 'https://github.com/enricoschumann/TransmissionChannelAnalysis.jl', papers: [] },
		],
		notebooks: [
			{ name: 'VAR Modelling',                    file: 'var/tutorial-01-var.ipynb',         bundled: true, description: 'Fitting and interpreting Vector Autoregression models' },
			{ name: 'Structural VAR',                   file: 'var/tutorial-02-svar.ipynb',        bundled: true, description: 'Identifying structural shocks with short-run and long-run restrictions' },
			{ name: 'Impulse Response Functions',       file: 'var/tutorial-03-irf.ipynb',         bundled: true, description: 'Computing and visualising IRFs and forecast error variance decompositions' },
			{ name: 'Cointegration and VECM',           file: 'var/tutorial-04-vecm.ipynb',        bundled: true, description: 'Johansen cointegration tests and vector error correction modelling' },
			{ name: 'Transmission Channel Analysis',    file: 'var/tutorial-05-tca.ipynb',         bundled: true, description: 'Decomposing transmission channels of structural shocks' },
		],
		wikis: [
			{ name: 'Overview',                                     file: 'var/overview.md',                           bundled: true },
			{ name: 'Factsheet',                                    file: 'var/factsheet.md',                          bundled: true },
			{ name: 'Assumptions',                                  file: 'var/assumptions.md',                        bundled: true },
			{ name: 'Diagnostics',                                  file: 'var/diagnostics.md',                        bundled: true },
			{ name: 'Interpretation',                               file: 'var/interpretation.md',                     bundled: true },
			{ name: 'Decision Guide',                               file: 'var/decision-guide.md',                     bundled: true },
		],
		tooltips: {
			p:        'Lag order — number of lagged vectors of endogenous variables in each equation. Select by AIC or BIC. Default 1.',
			trend:    'Deterministic component: "const" (intercept only), "trend" (linear trend only), "both" (intercept and trend), "none". Default "const".',
			r:        'Cointegration rank — number of cointegrating vectors for VECM. Determine via Johansen trace or max-eigenvalue tests. Default 1.',
			nfactors: 'Number of latent factors for FAVAR. Factors summarise large panels of observable variables not included directly in the VAR. Default 1.',
		},
	},
};

export function openVarWebview(
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
			title: VAR_TITLE,
			options: { retainContextWhenHidden: true },
			contentOptions: { allowScripts: true },
			extension: undefined,
		},
		VAR_VIEW_TYPE,
		VAR_TITLE,
		undefined,
		{ group: undefined, preserveFocus: false }
	);

	webviewInput.webview.setHtml(getVarHtml());

	registerVarWebviewHandlers(
		webviewInput,
		VAR_METADATA,
		openerService,
		editorService,
		quickInputService,
		commandService,
		clipboardService,
		notificationService,
		initialModel,
	);
}
