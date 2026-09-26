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
import { IArimaMetadata } from '../common/arima.types.js';
import { registerArimaWebviewHandlers } from '../handlers/arima.handler.js';
import { getArimaHtml } from '../webviews/arima.template.js';

const ARIMA_VIEW_TYPE = 'pollis.arima';
const ARIMA_TITLE = 'ARIMA Models';

const ARIMA_METADATA: IArimaMetadata = {
	arima: {
		packages: [
			{ name: 'StateSpaceModels.jl', github: 'https://github.com/LAMPSPUC/StateSpaceModels.jl', papers: [] },
		],
		notebooks: [
			{ name: 'ARIMA Modelling',       file: 'arima/tutorial-01-arima.ipynb',   bundled: true, description: 'Fitting and diagnosing ARIMA models with StateSpaceModels.jl' },
			{ name: 'Seasonal ARIMA',         file: 'arima/tutorial-02-sarima.ipynb',  bundled: true, description: 'Seasonal ARIMA for periodic time series' },
			{ name: 'Automatic Model Selection', file: 'arima/tutorial-03-auto.ipynb', bundled: true, description: 'Automatic order selection via information criteria' },
			{ name: 'Forecasting',            file: 'arima/tutorial-04-forecast.ipynb', bundled: true, description: 'Point forecasts and prediction intervals' },
		],
		wikis: [
			{ name: 'Overview',                                     file: 'arima/overview.md',                         bundled: true },
			{ name: 'Factsheet',                                    file: 'arima/factsheet.md',                        bundled: true },
			{ name: 'Assumptions',                                  file: 'arima/assumptions.md',                      bundled: true },
			{ name: 'Diagnostics',                                  file: 'arima/diagnostics.md',                      bundled: true },
			{ name: 'Interpretation',                               file: 'arima/interpretation.md',                   bundled: true },
			{ name: 'Decision Guide',                               file: 'arima/decision-guide.md',                   bundled: true },
		],
		tooltips: {
			p: 'Autoregressive order — number of lagged values of yₜ in the model. Identify from the PACF: cut off after lag p. Default 1.',
			d: 'Integration order — number of times to difference the series to achieve stationarity. Confirm with ADF or KPSS tests. Default 1.',
			q: 'Moving-average order — number of lagged forecast errors in the model. Identify from the ACF: cut off after lag q. Default 0.',
			P: 'Seasonal AR order — number of seasonal autoregressive terms at lag s, 2s, …, Ps. Default 1.',
			D: 'Seasonal integration order — number of seasonal differences (1 − Bˢ)ᴰ applied. Usually 0 or 1. Default 1.',
			Q: 'Seasonal MA order — number of seasonal moving-average terms at lag s, 2s, …, Qs. Default 1.',
			s: 'Seasonal period — observations per season (12 = monthly, 4 = quarterly, 7 = daily with weekly seasonality). Default 12.',
		},
	},
};

export function openArimaWebview(
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
			title: ARIMA_TITLE,
			options: { retainContextWhenHidden: true },
			contentOptions: { allowScripts: true },
			extension: undefined,
		},
		ARIMA_VIEW_TYPE,
		ARIMA_TITLE,
		undefined,
		{ group: undefined, preserveFocus: false }
	);

	webviewInput.webview.setHtml(getArimaHtml());

	registerArimaWebviewHandlers(
		webviewInput,
		ARIMA_METADATA,
		openerService,
		editorService,
		quickInputService,
		commandService,
		clipboardService,
		notificationService,
		initialModel,
	);
}
