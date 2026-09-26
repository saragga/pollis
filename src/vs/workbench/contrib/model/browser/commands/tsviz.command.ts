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
import { INotebookEditorModelResolverService } from '../../../notebook/common/notebookEditorModelResolverService.js';
import { INotebookKernelService } from '../../../notebook/common/notebookKernelService.js';
import { ILanguageService } from '../../../../../editor/common/languages/language.js';
import { IThemeService } from '../../../../../platform/theme/common/themeService.js';
import { ITsvizMetadata } from '../common/tsviz.types.js';
import { IModelReference, IModelNotebookSection } from '../common/model.types.js';
import { IFileService } from '../../../../../platform/files/common/files.js';
import { IPathService } from '../../../../services/path/common/pathService.js';
import { IWorkspaceContextService } from '../../../../../platform/workspace/common/workspace.js';
import { registerTsvizWebviewHandlers } from '../handlers/tsviz.handler.js';
import { getTsvizHtml } from '../webviews/tsviz.template.js';

const TSVIZ_VIEW_TYPE = 'pollis.tsviz';
const TSVIZ_TITLE = 'Time Series Plots';

const TSVIZ_REFERENCES: IModelReference[] = [
	{ separator: true, label: 'Software' },
	{
		title: 'Julia: A Fresh Approach to Numerical Computing',
		authors: 'Bezanson, Jeff; Edelman, Alan; Karpinski, Stefan; Shah, Viral B.',
		year: 2017,
		journal: 'SIAM Review',
		doi: '10.1137/141000671',
		openAccess: false,
	},
	{
		title: 'Plots.jl: Powerful Convenience for Julia Visualizations',
		authors: 'Christ, Simon; others',
		year: 2023,
		journal: 'GitHub',
		url: 'https://github.com/JuliaPlots/Plots.jl',
		openAccess: true,
	},
	{
		title: 'StatsBase.jl: Basic Statistics for Julia',
		authors: 'JuliaStats contributors',
		year: 2023,
		journal: 'GitHub',
		url: 'https://github.com/JuliaStats/StatsBase.jl',
		openAccess: true,
	},
	{
		title: 'StatsPlots.jl: Statistical Plotting Recipes for Julia',
		authors: 'JuliaPlots contributors',
		year: 2023,
		journal: 'GitHub',
		url: 'https://github.com/JuliaPlots/StatsPlots.jl',
		openAccess: true,
	},
	{ separator: true, label: 'Textbooks' },
	{
		title: 'Time Series Analysis and Its Applications',
		authors: 'Shumway, Robert H.; Stoffer, David S.',
		year: 2017,
		journal: 'Springer (4th ed.)',
		doi: '10.1007/978-3-319-52452-8',
		openAccess: false,
	},
	{
		title: 'Time Series Analysis: Forecasting and Control',
		authors: 'Box, George E. P.; Jenkins, Gwilym M.; Reinsel, Gregory C.; Ljung, Greta M.',
		year: 2015,
		journal: 'Wiley (5th ed.)',
		url: 'https://www.wiley.com/en-us/Time+Series+Analysis%3A+Forecasting+and+Control%2C+5th+Edition-p-9781118675021',
		openAccess: false,
	},
	{ separator: true, label: 'Original Papers' },
	{
		title: 'Distribution of the Estimators for Autoregressive Time Series with a Unit Root',
		authors: 'Dickey, David A.; Fuller, Wayne A.',
		year: 1979,
		journal: 'Journal of the American Statistical Association',
		doi: '10.1080/01621459.1979.10482531',
		openAccess: false,
	},
	{
		title: 'Distribution of Residual Autocorrelations in Autoregressive-Integrated Moving Average Time Series Models',
		authors: 'Box, George E. P.; Pierce, David A.',
		year: 1970,
		journal: 'Journal of the American Statistical Association',
		doi: '10.1080/01621459.1970.10481180',
		openAccess: false,
	},
];

export const TSVIZ_NOTEBOOK_SECTIONS: IModelNotebookSection[] = [
	{
		label: 'Time Series Plots',
		notebooks: [
			{ name: 'Time Series Plot',    file: 'tsviz/tutorial-01-tsplot.ipynb',  bundled: true, description: 'Line plots, multi-series overlays, and styling time series with Plots.jl' },
			{ name: 'Ribbon Plot',         file: 'tsviz/tutorial-03-ribbon.ipynb',  bundled: true, description: 'Uncertainty bands, forecast intervals, and shaded regions with Plots.jl' },
			{ name: 'Stacked Area',        file: 'tsviz/tutorial-04-stacked.ipynb', bundled: true, description: 'Stack non-negative component series into a running total with StatsPlots.jl' },
			{ name: 'OHLC',                file: 'tsviz/tutorial-05-ohlc.ipynb', bundled: true, description: 'Draw open-high-low-close financial bars with the built-in ohlc series in Plots.jl' },
		],
	},
];

const TSVIZ_METADATA: ITsvizMetadata = {
	tsviz: {
		packages: [
			{ name: 'Plots.jl',      github: 'https://github.com/JuliaPlots/Plots.jl',      papers: [] },
			{ name: 'StatsBase.jl',  github: 'https://github.com/JuliaStats/StatsBase.jl',  papers: [] },
			{ name: 'StatsPlots.jl', github: 'https://github.com/JuliaPlots/StatsPlots.jl', papers: [] },
		],
		notebookSections: TSVIZ_NOTEBOOK_SECTIONS,
		notebooks: TSVIZ_NOTEBOOK_SECTIONS.flatMap(s => s.notebooks),
		wikis: [
			{ name: 'Factsheet',         description: 'Quick-reference: plot types, Julia packages, and when to use each',       file: 'tsviz/factsheet.md',     bundled: true },
			{ name: 'Overview',          description: 'When to use time series plots and what patterns they reveal',            file: 'tsviz/overview.md',       bundled: true },
			{ name: 'Assumptions',       description: 'Stationarity, regularity, and data requirements for temporal plots',     file: 'tsviz/assumptions.md',    bundled: true },
			{ name: 'Diagnostics',       description: 'Detecting trend, seasonality, outliers, and missing observations',       file: 'tsviz/diagnostics.md',    bundled: true },
			{ name: 'Interpretation',    description: 'How to read levels, uncertainty bands, and composition over time',       file: 'tsviz/interpretation.md', bundled: true },
			{ name: 'Decision Guide',    description: 'Which temporal plot fits your data frequency and question',              file: 'tsviz/decision-guide.md', bundled: true },
			{ separator: true, label: 'Plot Types' },
			{ name: 'Time Series Plot',  description: 'Raw or smoothed series with optional confidence ribbon',                 file: 'tsviz/tsplot.md',         bundled: true },
			{ name: 'Ribbon Plot',       description: 'Central line with shaded uncertainty band over time',                    file: 'tsviz/ribbon.md',         bundled: true },
			{ name: 'Stacked Area',      description: 'Composition of multiple series summing to a total over time',            file: 'tsviz/stacked.md',        bundled: true },
			{ name: 'OHLC',              description: 'Open-high-low-close bars for financial price series',                    file: 'tsviz/ohlc.md',           bundled: true },
		],
		references: TSVIZ_REFERENCES,
	},
};

export function openTsvizWebview(
	webviewWorkbenchService: IWebviewWorkbenchService,
	openerService: IOpenerService,
	editorService: IEditorService,
	quickInputService: IQuickInputService,
	commandService: ICommandService,
	clipboardService: IClipboardService,
	notificationService: INotificationService,
	notebookEditorModelResolverService: INotebookEditorModelResolverService,
	notebookKernelService: INotebookKernelService,
	languageService: ILanguageService,
	themeService: IThemeService,
	fileService: IFileService,
	pathService: IPathService,
	workspaceContextService: IWorkspaceContextService,
	initialModel?: string,
): void {
	const webviewInput = webviewWorkbenchService.openWebview(
		{
			title: TSVIZ_TITLE,
			options: { retainContextWhenHidden: true },
			contentOptions: { allowScripts: true, localResourceRoots: [] },
			extension: undefined,
		},
		TSVIZ_VIEW_TYPE,
		TSVIZ_TITLE,
		undefined,
		{ group: undefined, preserveFocus: false }
	);

	webviewInput.webview.setHtml(getTsvizHtml());

	registerTsvizWebviewHandlers(
		webviewInput,
		TSVIZ_METADATA,
		openerService,
		editorService,
		quickInputService,
		commandService,
		clipboardService,
		notificationService,
		notebookEditorModelResolverService,
		notebookKernelService,
		languageService,
		themeService,
		fileService,
		pathService,
		workspaceContextService,
		initialModel,
	);
}
