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
import { INotebookEditorModelResolverService } from '../../../notebook/common/notebookEditorModelResolverService.js';
import { INotebookKernelService } from '../../../notebook/common/notebookKernelService.js';
import { ILanguageService } from '../../../../../editor/common/languages/language.js';
import { IThemeService } from '../../../../../platform/theme/common/themeService.js';
import { getMermaidUris } from '../../../mermaid/browser/mermaidHelper.js';
import { ITsvizMetadata } from '../common/tsviz.types.js';
import { IModelReference, IModelNotebookSection } from '../common/model.types.js';
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
			{ name: 'Factsheet',         file: 'tsviz/factsheet.md',     bundled: true },
			{ name: 'Overview',          file: 'tsviz/overview.md',       bundled: true },
			{ name: 'Assumptions',       file: 'tsviz/assumptions.md',    bundled: true },
			{ name: 'Diagnostics',       file: 'tsviz/diagnostics.md',    bundled: true },
			{ name: 'Interpretation',    file: 'tsviz/interpretation.md', bundled: true },
			{ name: 'Decision Guide',    file: 'tsviz/decision-guide.md', bundled: true },
			{ separator: true, label: 'Plot Types' },
			{ name: 'Time Series Plot',  file: 'tsviz/tsplot.md',         bundled: true },
			{ name: 'Ribbon Plot',       file: 'tsviz/ribbon.md',         bundled: true },
			{ name: 'Stacked Area',      file: 'tsviz/stacked.md',        bundled: true },
			{ name: 'OHLC',              file: 'tsviz/ohlc.md',           bundled: true },
		],
		references: TSVIZ_REFERENCES,
		conceptMap: {
			center: 'Patterns over Time',
			nodes: [
				{ id: 'root', label: 'Patterns over Time', kind: 'center' },
				{ id: 'q_trend', label: 'Level and trend', kind: 'concept' },
				{ id: 'q_uncert', label: 'Uncertainty over time', kind: 'concept' },
				{ id: 'q_comp', label: 'Composition over time', kind: 'concept' },
				{ id: 'c_range', label: 'Range per period', kind: 'concept' },
				{ id: 'tsplot', label: 'Time Series Plot', kind: 'topic', model: 'tsplot' },
				{ id: 'ribbon', label: 'Ribbon Plot', kind: 'topic', model: 'ribbon' },
				{ id: 'stacked', label: 'Stacked Area', kind: 'topic', model: 'stacked' },
				{ id: 'ohlc', label: 'OHLC', kind: 'topic', model: 'ohlc' },
				{ id: 'r_cviz', label: 'Core Statistical Plots', kind: 'related', command: 'chiara.explore.dvcs.line' },
				{ id: 'r_cpviz', label: 'Categorical and Proportional', kind: 'related', command: 'chiara.explore.dvcp.mosaic' },
				{ id: 'ext', label: 'Plots.jl', kind: 'external', url: 'https://github.com/JuliaPlots/Plots.jl' },
			],
			edges: [
				{ from: 'root', to: 'q_trend', label: 'asks about' },
				{ from: 'root', to: 'q_uncert', label: 'asks about' },
				{ from: 'root', to: 'q_comp', label: 'asks about' },
				{ from: 'q_trend', to: 'tsplot', label: 'drawn by' },
				{ from: 'q_uncert', to: 'ribbon', label: 'as a band in' },
				{ from: 'q_comp', to: 'stacked', label: 'as areas in' },
				{ from: 'q_uncert', to: 'c_range', label: 'summarised by' },
				{ from: 'c_range', to: 'ohlc', label: 'open-high-low-close in' },
				{ from: 'q_trend', to: 'r_cviz', label: 'ordered x, y in' },
				{ from: 'q_comp', to: 'r_cpviz', label: 'as proportions in' },
				{ from: 'root', to: 'ext', label: 'plotted with' },
			],
		},
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
	initialModel?: string,
): void {
	const mermaid = getMermaidUris();
	const webviewInput = webviewWorkbenchService.openWebview(
		{
			title: TSVIZ_TITLE,
			options: { retainContextWhenHidden: true },
			contentOptions: { allowScripts: true, localResourceRoots: [mermaid.distRoot] },
			extension: undefined,
		},
		TSVIZ_VIEW_TYPE,
		TSVIZ_TITLE,
		undefined,
		{ group: undefined, preserveFocus: false }
	);

	webviewInput.webview.setHtml(getTsvizHtml(mermaid.js));

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
		initialModel,
	);
}
