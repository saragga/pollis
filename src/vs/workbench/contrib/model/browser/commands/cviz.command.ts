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
import { ICvizMetadata } from '../common/cviz.types.js';
import { IModelReference, IModelNotebookSection } from '../common/model.types.js';
import { INotebookEditorModelResolverService } from '../../../notebook/common/notebookEditorModelResolverService.js';
import { INotebookKernelService } from '../../../notebook/common/notebookKernelService.js';
import { ILanguageService } from '../../../../../editor/common/languages/language.js';
import { IThemeService } from '../../../../../platform/theme/common/themeService.js';
import { IFileService } from '../../../../../platform/files/common/files.js';
import { IPathService } from '../../../../services/path/common/pathService.js';
import { IWorkspaceContextService } from '../../../../../platform/workspace/common/workspace.js';
import { registerCvizWebviewHandlers } from '../handlers/cviz.handler.js';
import { getCvizHtml } from '../webviews/cviz.template.js';

const CVIZ_VIEW_TYPE = 'pollis.cviz';
const CVIZ_TITLE = 'Core Statistical Plots';

const CVIZ_REFERENCES: IModelReference[] = [
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
		title: 'StatsPlots.jl: Statistical Plotting Recipes for Julia',
		authors: 'JuliaPlots contributors',
		year: 2023,
		journal: 'GitHub',
		url: 'https://github.com/JuliaPlots/StatsPlots.jl',
		openAccess: true,
	},
	{
		title: 'Makie.jl: Flexible High-Performance Plotting for Julia',
		authors: 'Danisch, Simon; Krumbiegel, Julius',
		year: 2021,
		journal: 'Journal of Open Source Software',
		doi: '10.21105/joss.03349',
		openAccess: true,
	},
	{ separator: true, label: 'Textbooks' },
	{
		title: 'The Grammar of Graphics',
		authors: 'Wilkinson, Leland',
		year: 2005,
		journal: 'Springer (2nd ed.)',
		doi: '10.1007/0-387-28695-0',
		openAccess: false,
	},
	{
		title: 'Exploratory Data Analysis',
		authors: 'Tukey, John W.',
		year: 1977,
		journal: 'Pearson',
		url: 'https://www.pearson.com/en-us/subject-catalog/p/exploratory-data-analysis/P200000006166',
		openAccess: false,
	},
	{ separator: true, label: 'Original Papers' },
	{
		title: 'Violin Plots: A Box Plot-Density Trace Synergism',
		authors: 'Hintze, Jerry L.; Nelson, Ray D.',
		year: 1998,
		journal: 'The American Statistician',
		doi: '10.1080/00031305.1998.10480559',
		openAccess: false,
	},
	{
		title: 'Graphical Methods for Data Analysis',
		authors: 'Chambers, John M.; Cleveland, William S.; Kleiner, Beat; Tukey, Paul A.',
		year: 1983,
		journal: 'Wadsworth',
		url: 'https://www.routledge.com/Graphical-Methods-for-Data-Analysis/Chambers-Cleveland-Kleiner-Tukey/p/book/9780412052316',
		openAccess: false,
	},
];

export const CVIZ_NOTEBOOK_SECTIONS: IModelNotebookSection[] = [
	{
		label: 'Core Statistical Plots',
		notebooks: [
			{ name: 'Scatter and Bar',    file: 'cviz/tutorial-01-scatter-bar.ipynb',   bundled: true, description: 'Create scatter plots and bar charts with StatsPlots.jl and Makie.jl' },
			{ name: 'Histogram',          file: 'cviz/tutorial-02-histogram.ipynb',     bundled: true, description: 'Explore distributions with histograms, density overlays, and bin selection' },
			{ name: 'Box and Violin',     file: 'cviz/tutorial-03-box-violin.ipynb',    bundled: true, description: 'Compare groups with box plots and violin plots; notches, overlays, and jitter' },
			{ name: 'Customisation',      file: 'cviz/tutorial-04-customisation.ipynb', bundled: true, description: 'Themes, colours, annotations, layouts, and saving publication-quality figures' },
			{ name: 'Pie Chart',          file: 'cviz/tutorial-05-pie.ipynb',           bundled: true, description: 'Show part-to-whole shares as a donut pie with CairoMakie.jl' },
			{ name: 'Line Plot',          file: 'cviz/tutorial-06-line.ipynb',          bundled: true, description: 'Draw a fitted regression line over observations with StatsPlots.jl' },
		],
	},
];

const CVIZ_METADATA: ICvizMetadata = {
	cviz: {
		packages: [
			{ name: 'StatsPlots.jl', github: 'https://github.com/JuliaPlots/StatsPlots.jl', papers: [] },
			{ name: 'Makie.jl',      github: 'https://github.com/MakieOrg/Makie.jl',        papers: [] },
			{ name: 'Plots.jl',      github: 'https://github.com/JuliaPlots/Plots.jl',      papers: [] },
		],
		notebookSections: CVIZ_NOTEBOOK_SECTIONS,
		notebooks: CVIZ_NOTEBOOK_SECTIONS.flatMap(s => s.notebooks),
		wikis: [
			{ name: 'Factsheet',      description: 'Quick-reference: plot types, Julia packages, and when to use each',       file: 'cviz/factsheet.md',      bundled: true },
			{ name: 'Overview',       description: 'Motivation and guidance for choosing core statistical plots',                file: 'cviz/overview.md',        bundled: true },
			{ name: 'Assumptions',    description: 'Data requirements and conditions for valid statistical plots',               file: 'cviz/assumptions.md',     bundled: true },
			{ name: 'Diagnostics',    description: 'How to spot misleading charts and detect data quality issues',               file: 'cviz/diagnostics.md',     bundled: true },
			{ name: 'Interpretation', description: 'How to read and communicate each plot type correctly',                      file: 'cviz/interpretation.md',  bundled: true },
			{ name: 'Decision Guide', description: 'Which plot to use given your data type and question',                       file: 'cviz/decision-guide.md',  bundled: true },
			{ separator: true, label: 'Plot Types' },
			{ name: 'Scatter Plot',   description: 'Relationship between two continuous variables',                             file: 'cviz/scatter.md',         bundled: true },
			{ name: 'Bar Chart',      description: 'Comparing counts or values across categories',                              file: 'cviz/bar.md',             bundled: true },
			{ name: 'Histogram',      description: 'Distribution of a single continuous variable',                              file: 'cviz/histogram.md',       bundled: true },
			{ name: 'Box Plot',       description: 'Median, spread, and outliers by group',                                     file: 'cviz/box.md',             bundled: true },
			{ name: 'Violin Plot',    description: 'Full distribution shape and density by group',                              file: 'cviz/violin.md',          bundled: true },
			{ name: 'Pie Chart',      description: 'Part-to-whole proportions for a small number of categories',                file: 'cviz/pie.md',             bundled: true },
			{ name: 'Line Plot',      description: 'Trends and changes in a continuous variable over an ordered axis',          file: 'cviz/line.md',            bundled: true },
		],
		references: CVIZ_REFERENCES,
	},
};

export function openCvizWebview(
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
			title: CVIZ_TITLE,
			options: { retainContextWhenHidden: true },
			contentOptions: { allowScripts: true, localResourceRoots: [] },
			extension: undefined,
		},
		CVIZ_VIEW_TYPE,
		CVIZ_TITLE,
		undefined,
		{ group: undefined, preserveFocus: false }
	);

	webviewInput.webview.setHtml(getCvizHtml());

	registerCvizWebviewHandlers(
		webviewInput,
		CVIZ_METADATA,
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
