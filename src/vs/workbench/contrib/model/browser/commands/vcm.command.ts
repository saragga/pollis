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
import { IVcmMetadata } from '../common/vcm.types.js';
import { registerVcmWebviewHandlers } from '../handlers/vcm.handler.js';
import { getVcmHtml } from '../webviews/vcm.template.js';

const VCM_VIEW_TYPE = 'pollis.vcm';
const VCM_TITLE = 'GARCH-Type Models';

const VCM_METADATA: IVcmMetadata = {
	vcm: {
		packages: [
			{ name: 'ARCHModels.jl', github: 'https://github.com/s-baumann/ARCHModels.jl', papers: [] },
		],
		notebooks: [
			{ name: 'GARCH Modelling',           file: 'vcm/tutorial-01-garch.ipynb',    bundled: true, description: 'Univariate GARCH, EGARCH and GJR-GARCH volatility models' },
			{ name: 'Multivariate GARCH (DCC)',  file: 'vcm/tutorial-02-dcc.ipynb',      bundled: true, description: 'Dynamic conditional correlation modelling' },
			{ name: 'Volatility Forecasting',    file: 'vcm/tutorial-03-forecast.ipynb', bundled: true, description: 'Multi-step volatility forecasting and model comparison' },
			{ name: 'Value-at-Risk',             file: 'vcm/tutorial-04-var.ipynb',      bundled: true, description: 'Measuring Value-at-Risk when returns are not i.i.d.' },
		],
		wikis: [
			{ name: 'Overview',                                    file: 'vcm/overview.md',                          bundled: true },
			{ name: 'Factsheet',                                   file: 'vcm/factsheet.md',                         bundled: true },
			{ name: 'Assumptions',                                 file: 'vcm/assumptions.md',                       bundled: true },
			{ name: 'Diagnostics',                                 file: 'vcm/diagnostics.md',                       bundled: true },
			{ name: 'Interpretation',                              file: 'vcm/interpretation.md',                    bundled: true },
			{ name: 'Decision Guide',                              file: 'vcm/decision-guide.md',                    bundled: true },
			{ name: 'Comparison of Time-Varying Volatility Models', file: 'tvm/Time-VaryingVolatilityModels.md',     bundled: true },
		],
		tooltips: {
			p: 'ARCH order — number of lagged squared residuals in the variance equation. For DCC, applies to each inner GARCH volatility model. Default 1.',
			q: 'GARCH order — number of lagged conditional variances. Default 1.',
			o: 'Asymmetry order — number of leverage terms. Captures the tendency of negative shocks to increase volatility more than positive shocks of the same magnitude. Default 1.',
			dist: 'Innovation distribution. For DCC, the same distribution is applied to all individual GARCH models uniformly.',
			dccP: 'DCC ARCH order — lags of cross products of standardised residuals in the DCC correlation dynamics. Default 1.',
			dccQ: 'DCC GARCH order — lags of lagged conditional correlations in the DCC dynamics. Default 1.',
			data: 'Julia vector of log returns for univariate models, or a matrix with one asset per column for DCC.',
		},
	},
};

export function openVcmWebview(
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
			title: VCM_TITLE,
			options: { retainContextWhenHidden: true },
			contentOptions: { allowScripts: true },
			extension: undefined,
		},
		VCM_VIEW_TYPE,
		VCM_TITLE,
		undefined,
		{ group: undefined, preserveFocus: false }
	);

	webviewInput.webview.setHtml(getVcmHtml());

	registerVcmWebviewHandlers(
		webviewInput,
		VCM_METADATA,
		openerService,
		editorService,
		quickInputService,
		commandService,
		clipboardService,
		notificationService,
		initialModel,
	);
}
