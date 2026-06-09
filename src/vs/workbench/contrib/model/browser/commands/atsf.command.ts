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
import { IAtsfMetadata } from '../common/atsf.types.js';
import { IModelNotebookSection, IModelReference } from '../common/model.types.js';
import { registerAtsfWebviewHandlers } from '../handlers/atsf.handler.js';
import { getAtsfHtml } from '../webviews/atsf.template.js';

const ATSF_VIEW_TYPE = 'pollis.atsf';
const ATSF_TITLE = 'Advanced Time-Series Forecasting';

export const ATSF_NOTEBOOK_SECTIONS: IModelNotebookSection[] = [
	{
		label: 'Seasonal Forecasting',
		notebooks: [
			{ name: 'BATS and TBATS', file: 'tsf/tutorial-03-bats.ipynb', bundled: true, description: 'Box-Cox ARMA trend and seasonal forecasting for complex or multiple seasonalities' },
		],
	},
	{
		label: 'Decomposition Methods',
		notebooks: [
			{ name: 'Theta Models', file: 'tsf/tutorial-04-theta.ipynb', bundled: true, description: 'Theta method for univariate decomposition and forecasting' },
		],
	},
	{
		label: 'Intermittent Demand',
		notebooks: [
			{ name: 'Intermittent Demand', file: 'tsf/tutorial-05-demand.ipynb', bundled: true, description: 'Croston SBA and SBJ for sparse, intermittent demand time series' },
		],
	},
];

const ATSF_REFERENCES: IModelReference[] = [
	{ separator: true, label: 'Textbooks' },
	{
		title: 'Forecasting: Principles and Practice',
		authors: 'Hyndman, Rob J.; Athanasopoulos, George',
		year: 2021,
		journal: 'OTexts',
		openAccess: true,
	},
	{ separator: true, label: 'Original Papers' },
	{
		title: 'Forecasting Time Series With Complex Seasonal Patterns Using Exponential Smoothing',
		authors: 'De Livera, Alysha M.; Hyndman, Rob J.; Snyder, Ralph D.',
		year: 2011,
		journal: 'Journal of the American Statistical Association',
		doi: '10.1198/jasa.2011.tm09771',
		openAccess: false,
	},
	{
		title: 'The Theta Model: A Decomposition Approach to Forecasting',
		authors: 'Assimakopoulos, Vassilis; Nikolopoulos, Konstantinos',
		year: 2000,
		journal: 'International Journal of Forecasting',
		doi: '10.1016/S0169-2070(00)00066-2',
		openAccess: false,
	},
	{
		title: 'Forecasting and Stock Control for Intermittent Demands',
		authors: 'Croston, J. D.',
		year: 1972,
		journal: 'Journal of the Operational Research Society',
		doi: '10.1057/jors.1972.50',
		openAccess: false,
	},
	{
		title: 'The Accuracy of Intermittent Demand Estimates',
		authors: 'Syntetos, Aris A.; Boylan, John E.',
		year: 2005,
		journal: 'International Journal of Forecasting',
		doi: '10.1016/j.ijpe.2004.06.004',
		openAccess: false,
	},
];

const ATSF_METADATA: IAtsfMetadata = {
	atsf: {
		packages: [
			{ name: 'Durbyn.jl', github: 'https://github.com/taf-society/Durbyn.jl', papers: [] },
		],
		notebooks: ATSF_NOTEBOOK_SECTIONS.flatMap(s => s.notebooks),
		notebookSections: ATSF_NOTEBOOK_SECTIONS,
		wikis: [
			{ name: 'Overview',       file: 'tsf/overview.md',       bundled: true },
			{ name: 'Factsheet',      file: 'tsf/factsheet.md',      bundled: true },
			{ name: 'Assumptions',    file: 'tsf/assumptions.md',    bundled: true },
			{ name: 'Diagnostics',    file: 'tsf/diagnostics.md',    bundled: true },
			{ name: 'Interpretation', file: 'tsf/interpretation.md', bundled: true },
			{ name: 'Decision Guide', file: 'tsf/decision-guide.md', bundled: true },
		],
		references: ATSF_REFERENCES,
		tooltips: {
			series:  'Julia vector of observed values ordered in time.',
			periods: 'Seasonal periods as a Julia vector, e.g. [7, 365.25]. TBATS handles multiple seasonalities simultaneously.',
			theta:   'Theta parameter &#952; &#8805; 0. Controls decomposition of the series into trend and seasonal components. &#952; = 2 is the standard Theta method.',
			period:  'Length of the seasonal cycle (e.g. 4 for quarterly, 12 for monthly, 52 for weekly).',
			method:  'Demand method. Croston SBA applies a bias correction; SBJ uses an alternative correction based on inter-demand intervals.',
			h:       'Forecast horizon. Number of steps ahead to forecast.',
		},
	},
};

export function openAtsfWebview(
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
			title: ATSF_TITLE,
			options: { retainContextWhenHidden: true },
			contentOptions: { allowScripts: true },
			extension: undefined,
		},
		ATSF_VIEW_TYPE,
		ATSF_TITLE,
		undefined,
		{ group: undefined, preserveFocus: false }
	);

	webviewInput.webview.setHtml(getAtsfHtml());

	registerAtsfWebviewHandlers(
		webviewInput,
		ATSF_METADATA,
		openerService,
		editorService,
		quickInputService,
		commandService,
		clipboardService,
		notificationService,
		initialMethod,
	);
}
