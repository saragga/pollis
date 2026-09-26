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
import { ITsfMetadata } from '../common/tsf.types.js';
import { IModelNotebookSection, IModelReference } from '../common/model.types.js';
import { registerTsfWebviewHandlers } from '../handlers/tsf.handler.js';
import { getTsfHtml } from '../webviews/tsf.template.js';

const TSF_VIEW_TYPE = 'pollis.tsf';
const TSF_TITLE = 'Time-Series Forecasting';

export const TSF_NOTEBOOK_SECTIONS: IModelNotebookSection[] = [
	{
		label: 'Smoothing',
		notebooks: [
			{ name: 'LOESS', file: 'tsf/tutorial-01-loess.ipynb', bundled: true, description: 'Local polynomial smoothing for trend and cycle extraction' },
		],
	},
	{
		label: 'State Space',
		notebooks: [
			{ name: 'Local Level / Trend', file: 'tsf/tutorial-02-local.ipynb', bundled: true, description: 'Random walk and local linear trend state space models' },
			{ name: 'Seasonal Model',      file: 'tsf/tutorial-03-seasonal.ipynb', bundled: true, description: 'State space seasonal decomposition' },
			{ name: 'ETS Framework',       file: 'tsf/tutorial-04-ets.ipynb', bundled: true, description: 'Error, Trend, and Seasonality framework' },
			{ name: 'ARIMA',               file: 'tsf/tutorial-05-arima.ipynb', bundled: true, description: 'Auto-regressive integrated moving average models' },
			{ name: 'Unobserved Components', file: 'tsf/tutorial-06-ucm.ipynb', bundled: true, description: 'Flexible structural decomposition into trend, cycle, and seasonal' },
		],
	},
];

const TSF_REFERENCES: IModelReference[] = [
	{ separator: true, label: 'Software' },
	{
		title: 'StateSpaceModels.jl: A Julia Package for Time-Series Analysis in a State-Space Framework',
		authors: 'Bodin, Raphael; Guilherme Bodin, Thuener; Pereira, Davi M.',
		year: 2019,
		journal: 'arXiv',
		doi: '10.48550/arXiv.1908.01757',
		openAccess: true,
	},
	{ separator: true, label: 'Textbooks' },
	{
		title: 'Forecasting: Principles and Practice',
		authors: 'Hyndman, Rob J.; Athanasopoulos, George',
		year: 2021,
		journal: 'OTexts',
		openAccess: true,
	},
	{
		title: 'Time Series Analysis by State Space Methods',
		authors: 'Durbin, James; Koopman, Siem Jan',
		year: 2012,
		journal: 'Oxford University Press',
		openAccess: false,
	},
	{ separator: true, label: 'Original Papers' },
	{
		title: 'Smoothing by Spline Functions',
		authors: 'Cleveland, William S.',
		year: 1979,
		journal: 'Journal of the American Statistical Association',
		doi: '10.2307/2286407',
		openAccess: false,
	},
	{
		title: 'Forecasting Exponential Smoothing: The State Space Approach',
		authors: 'Hyndman, Rob J.; Koehler, Anne B.; Ord, J. Keith; Snyder, Ralph D.',
		year: 2008,
		journal: 'Springer',
		openAccess: false,
	},
	{
		title: 'ARIMA Models for Time Series Forecasting',
		authors: 'Box, George E. P.; Jenkins, Gwilym M.; Reinsel, Gregory C.; Ljung, Greta M.',
		year: 2015,
		journal: 'Wiley',
		openAccess: false,
	},
];

const TSF_METADATA: ITsfMetadata = {
	tsf: {
		packages: [
			{ name: 'StateSpaceModels.jl', github: 'https://github.com/LAMPSPUC/StateSpaceModels.jl', papers: [] },
		],
		notebooks: TSF_NOTEBOOK_SECTIONS.flatMap(s => s.notebooks),
		notebookSections: TSF_NOTEBOOK_SECTIONS,
		wikis: [
			{ name: 'Factsheet',      file: 'tsf/factsheet.md',      bundled: true },
			{ name: 'Overview',       file: 'tsf/overview.md',       bundled: true },
			{ name: 'Assumptions',    file: 'tsf/assumptions.md',    bundled: true },
			{ name: 'Diagnostics',    file: 'tsf/diagnostics.md',    bundled: true },
			{ name: 'Interpretation', file: 'tsf/interpretation.md', bundled: true },
			{ name: 'Decision Guide', file: 'tsf/decision-guide.md', bundled: true },
		],
		references: TSF_REFERENCES,
		tooltips: {
			series:    'Julia vector of observed values ordered in time.',
			x:         'Predictor variable (time index or covariate) as a Julia vector.',
			y:         'Response variable as a Julia vector of the same length as x.',
			degree:    'Degree of the local polynomial: 0 = local constant, 1 = local linear (default), 2 = local quadratic.',
			span:      'Smoothing bandwidth &#945; &#8712; (0, 1]. Fraction of data used in each local fit. Smaller values follow the data more closely.',
			error:     'Error type: Additive (A) or Multiplicative (M). Multiplicative suits data with variance growing with level.',
			trend:     'Trend component: None (N), Additive (A), or Multiplicative (M).',
			seasonal:  'Seasonal component: None (N), Additive (A), or Multiplicative (M).',
			period:    'Length of the seasonal cycle (e.g. 4 for quarterly, 12 for monthly, 52 for weekly).',
			h:         'Forecast horizon. Number of steps ahead to forecast.',
			order:     'ARIMA order as (p, d, q). p = AR lags, d = differencing order, q = MA lags.',
			level:     'Include a stochastic level (random walk) component in the structural model.',
			slope:     'Include a stochastic slope (trend) component in the structural model.',
			irregular: 'Include an irregular (observation noise) component in the structural model.',
			cycle:     'Include a stochastic cycle component with a specified period.',
		},
	},
};

export function openTsfWebview(
	webviewWorkbenchService: IWebviewWorkbenchService,
	openerService: IOpenerService,
	editorService: IEditorService,
	quickInputService: IQuickInputService,
	commandService: ICommandService,
	clipboardService: IClipboardService,
	notificationService: INotificationService,
	initialMethod?: string,
): void {
	const webviewInput = webviewWorkbenchService.openWebview(
		{
			title: TSF_TITLE,
			options: { retainContextWhenHidden: true },
			contentOptions: { allowScripts: true },
			extension: undefined,
		},
		TSF_VIEW_TYPE,
		TSF_TITLE,
		undefined,
		{ group: undefined, preserveFocus: false }
	);

	webviewInput.webview.setHtml(getTsfHtml());

	registerTsfWebviewHandlers(
		webviewInput,
		TSF_METADATA,
		openerService,
		editorService,
		quickInputService,
		commandService,
		clipboardService,
		notificationService,
		initialMethod,
	);
}
