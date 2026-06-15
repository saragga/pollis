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
import { getMermaidUris } from '../../../mermaid/browser/mermaidHelper.js';
import { IMvizMetadata } from '../common/mviz.types.js';
import { IModelReference, IModelNotebookSection } from '../common/model.types.js';
import { INotebookEditorModelResolverService } from '../../../notebook/common/notebookEditorModelResolverService.js';
import { INotebookKernelService } from '../../../notebook/common/notebookKernelService.js';
import { ILanguageService } from '../../../../../editor/common/languages/language.js';
import { IThemeService } from '../../../../../platform/theme/common/themeService.js';
import { IFileService } from '../../../../../platform/files/common/files.js';
import { IPathService } from '../../../../services/path/common/pathService.js';
import { IWorkspaceContextService } from '../../../../../platform/workspace/common/workspace.js';
import { registerMvizWebviewHandlers } from '../handlers/mviz.handler.js';
import { getMvizHtml } from '../webviews/mviz.template.js';

const MVIZ_VIEW_TYPE = 'pollis.mviz';
const MVIZ_TITLE = 'Multivariate Plots';

const MVIZ_REFERENCES: IModelReference[] = [
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
		title: 'PairPlots.jl: Beautiful and Flexible Visualizations of High Dimensional Data',
		authors: 'Thompson, William; Speagle, Joshua S.',
		year: 2023,
		journal: 'Journal of Open Source Software',
		doi: '10.21105/joss.05227',
		openAccess: true,
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
		title: 'Makie.jl: Flexible High-Performance Plotting for Julia',
		authors: 'Danisch, Simon; Krumbiegel, Julius',
		year: 2021,
		journal: 'Journal of Open Source Software',
		doi: '10.21105/joss.03349',
		openAccess: true,
	},
	{ separator: true, label: 'Textbooks' },
	{
		title: 'Applied Multivariate Statistical Analysis',
		authors: 'Johnson, Richard A.; Wichern, Dean W.',
		year: 2007,
		journal: 'Pearson (6th ed.)',
		url: 'https://www.pearson.com/en-us/subject-catalog/p/applied-multivariate-statistical-analysis/P200000006189',
		openAccess: false,
	},
	{
		title: 'The Grammar of Graphics',
		authors: 'Wilkinson, Leland',
		year: 2005,
		journal: 'Springer (2nd ed.)',
		doi: '10.1007/0-387-28695-0',
		openAccess: false,
	},
	{ separator: true, label: 'Original Papers' },
	{
		title: 'The Plane with Parallel Coordinates',
		authors: 'Inselberg, Alfred',
		year: 1985,
		journal: 'The Visual Computer',
		doi: '10.1007/BF01898350',
		openAccess: false,
	},
	{
		title: 'Brushing Scatterplots',
		authors: 'Becker, Richard A.; Cleveland, William S.',
		year: 1987,
		journal: 'Technometrics',
		doi: '10.1080/00401706.1987.10488204',
		openAccess: false,
	},
];

export const MVIZ_NOTEBOOK_SECTIONS: IModelNotebookSection[] = [
	{
		label: 'Multivariate Plots',
		notebooks: [
			{ name: 'Corner Plot',            file: 'mviz/tutorial-01-corner.ipynb',   bundled: true, description: 'Pairwise scatter matrix with marginal densities using PairPlots.jl' },
			{ name: 'Parallel Coordinates',   file: 'mviz/tutorial-02-parallel.ipynb', bundled: true, description: 'High-dimensional data lines coloured by group with Plots.jl' },
			{ name: 'Bubble Chart',           file: 'mviz/tutorial-03-bubble.ipynb',   bundled: true, description: 'Scatter with size and colour encoding a third and fourth dimension' },
			{ name: 'Heatmap',                file: 'mviz/tutorial-04-heatmap.ipynb',  bundled: true, description: 'Correlation and data matrix heatmaps with diverging colour scales' },
		],
	},
];

const MVIZ_METADATA: IMvizMetadata = {
	mviz: {
		packages: [
			{ name: 'PairPlots.jl', github: 'https://github.com/sefffal/PairPlots.jl',   papers: [] },
			{ name: 'Plots.jl',     github: 'https://github.com/JuliaPlots/Plots.jl',     papers: [] },
			{ name: 'Makie.jl',     github: 'https://github.com/MakieOrg/Makie.jl',       papers: [] },
		],
		notebookSections: MVIZ_NOTEBOOK_SECTIONS,
		notebooks: MVIZ_NOTEBOOK_SECTIONS.flatMap(s => s.notebooks),
		wikis: [
			{ name: 'Factsheet',            description: 'Quick-reference: plot types, Julia packages, and when to use each',       file: 'mviz/factsheet.md',       bundled: true },
			{ name: 'Overview',             description: 'When to use multivariate plots to explore many variables at once',    file: 'mviz/overview.md',         bundled: true },
			{ name: 'Assumptions',          description: 'Data requirements and scaling considerations for multivariate plots', file: 'mviz/assumptions.md',      bundled: true },
			{ name: 'Diagnostics',          description: 'Detecting overplotting, clutter, and misleading axis scaling',        file: 'mviz/diagnostics.md',      bundled: true },
			{ name: 'Interpretation',       description: 'How to read pairwise, parallel, and matrix visualisations',          file: 'mviz/interpretation.md',   bundled: true },
			{ name: 'Decision Guide',       description: 'Which multivariate plot fits your dimensionality and question',       file: 'mviz/decision-guide.md',   bundled: true },
			{ separator: true, label: 'Plot Types' },
			{ name: 'Corner Plot',          description: 'All pairwise scatter plots with marginal histograms on the diagonal', file: 'mviz/corner.md',           bundled: true },
			{ name: 'Parallel Coordinates', description: 'Each variable as a vertical axis; each observation as a polyline',   file: 'mviz/parallel.md',         bundled: true },
			{ name: 'Bubble Chart',         description: 'Scatter plot with a third variable encoded as bubble size',           file: 'mviz/bubble.md',           bundled: true },
			{ name: 'Heatmap',              description: 'Matrix of values encoded as colour intensity',                        file: 'mviz/heatmap.md',          bundled: true },
		],
		references: MVIZ_REFERENCES,
		conceptMap: {
			center: 'Exploring Many Variables',
			nodes: [
				{ id: 'root', label: 'Exploring Many Variables', kind: 'center' },
				{ id: 'q_pair', label: 'Pairwise relationships', kind: 'concept' },
				{ id: 'q_highdim', label: 'High-dimensional patterns', kind: 'concept' },
				{ id: 'q_extra', label: 'Extra dimensions at once', kind: 'concept' },
				{ id: 'c_corr', label: 'Correlation structure', kind: 'concept' },
				{ id: 'corner', label: 'Corner Plot', kind: 'topic', model: 'corner' },
				{ id: 'parallel', label: 'Parallel Coordinates', kind: 'topic', model: 'parallel' },
				{ id: 'bubble', label: 'Bubble Chart', kind: 'topic', model: 'bubble' },
				{ id: 'heatmap', label: 'Heatmap', kind: 'topic', model: 'heatmap' },
				{ id: 'r_cviz', label: 'Core Statistical Plots', kind: 'related', command: 'chiara.explore.dvcs.scatter' },
				{ id: 'r_dcmp', label: 'Distribution Comparison', kind: 'related', command: 'chiara.explore.dvdist.correlogram' },
				{ id: 'r_gsviz', label: 'Graph and Spatial', kind: 'related', command: 'chiara.explore.dvgs.network' },
				{ id: 'ext', label: 'PairPlots.jl', kind: 'external', url: 'https://github.com/sefffal/PairPlots.jl' },
			],
			edges: [
				{ from: 'root', to: 'q_pair', label: 'asks about' },
				{ from: 'root', to: 'q_highdim', label: 'asks about' },
				{ from: 'root', to: 'q_extra', label: 'asks about' },
				{ from: 'q_pair', to: 'corner', label: 'shown by' },
				{ from: 'q_pair', to: 'c_corr', label: 'summarised by' },
				{ from: 'c_corr', to: 'heatmap', label: 'as a matrix in' },
				{ from: 'q_highdim', to: 'parallel', label: 'traced by' },
				{ from: 'q_extra', to: 'bubble', label: 'size + colour in' },
				{ from: 'q_pair', to: 'r_dcmp', label: 'per pair in' },
				{ from: 'q_highdim', to: 'r_gsviz', label: 'as a graph in' },
				{ from: 'root', to: 'r_cviz', label: 'two variables in' },
				{ from: 'root', to: 'ext', label: 'plotted with' },
			],
		},
	},
};

export function openMvizWebview(
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
	const mermaid = getMermaidUris();
	const webviewInput = webviewWorkbenchService.openWebview(
		{
			title: MVIZ_TITLE,
			options: { retainContextWhenHidden: true },
			contentOptions: { allowScripts: true, localResourceRoots: [mermaid.distRoot] },
			extension: undefined,
		},
		MVIZ_VIEW_TYPE,
		MVIZ_TITLE,
		undefined,
		{ group: undefined, preserveFocus: false }
	);

	webviewInput.webview.setHtml(getMvizHtml(mermaid.js));

	registerMvizWebviewHandlers(
		webviewInput,
		MVIZ_METADATA,
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
