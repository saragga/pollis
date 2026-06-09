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
import { ICpvizMetadata } from '../common/cpviz.types.js';
import { IModelReference, IModelNotebookSection } from '../common/model.types.js';
import { INotebookEditorModelResolverService } from '../../../notebook/common/notebookEditorModelResolverService.js';
import { INotebookKernelService } from '../../../notebook/common/notebookKernelService.js';
import { ILanguageService } from '../../../../../editor/common/languages/language.js';
import { IThemeService } from '../../../../../platform/theme/common/themeService.js';
import { registerCpvizWebviewHandlers } from '../handlers/cpviz.handler.js';
import { getCpvizHtml } from '../webviews/cpviz.template.js';

const CPVIZ_VIEW_TYPE = 'pollis.cpviz';
const CPVIZ_TITLE = 'Categorical and Proportional Plots';

const CPVIZ_REFERENCES: IModelReference[] = [
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
		title: 'SankeyMakie.jl: Sankey Diagrams for Julia',
		authors: 'Krumbiegel, Julius; contributors',
		year: 2023,
		journal: 'GitHub',
		url: 'https://github.com/MakieOrg/SankeyMakie.jl',
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
		title: 'The Visual Display of Quantitative Information',
		authors: 'Tufte, Edward R.',
		year: 2001,
		journal: 'Graphics Press (2nd ed.)',
		url: 'https://www.edwardtufte.com/book/the-visual-display-of-quantitative-information/',
		openAccess: false,
	},
	{ separator: true, label: 'Original Papers' },
	{
		title: 'Mosaic Displays for Multi-Way Contingency Tables',
		authors: 'Friendly, Michael',
		year: 1994,
		journal: 'Journal of the American Statistical Association',
		doi: '10.1080/01621459.1994.10476484',
		openAccess: false,
	},
	{
		title: 'Notes on Matters Affecting the Health, Efficiency and Hospital Administration of the British Army',
		authors: 'Nightingale, Florence',
		year: 1858,
		journal: 'Harrison and Sons',
		url: 'https://archive.org/details/b20387118',
		openAccess: true,
	},
];

export const CPVIZ_NOTEBOOK_SECTIONS: IModelNotebookSection[] = [
	{
		label: 'Categorical and Proportional Plots',
		notebooks: [
			{ name: 'Mosaic Plot',      file: 'cpviz/tutorial-01-mosaic.ipynb',      bundled: true, description: 'Build a mosaic from a contingency table and test association with a chi-squared test' },
			{ name: 'Nightingale Rose', file: 'cpviz/tutorial-02-nightingale.ipynb', bundled: true, description: 'Polar area chart for cyclic categories, and the area-perception caveat' },
			{ name: 'Waterfall Plot',   file: 'cpviz/tutorial-03-waterfall.ipynb',   bundled: true, description: 'Floating bars that bridge a start value to an end value through signed deltas' },
			{ name: 'Treemap',          file: 'cpviz/tutorial-04-treemap.ipynb',     bundled: true, description: 'Area-proportional part-to-whole tiles with a simple slice layout' },
			{ name: 'Sankey Diagram',   file: 'cpviz/tutorial-05-sankey.ipynb',      bundled: true, description: 'Flows between nodes with SankeyMakie.jl; band width encodes quantity' },
		],
	},
];

const CPVIZ_METADATA: ICpvizMetadata = {
	cpviz: {
		packages: [
			{ name: 'StatsPlots.jl',  github: 'https://github.com/JuliaPlots/StatsPlots.jl',  papers: [] },
			{ name: 'Plots.jl',       github: 'https://github.com/JuliaPlots/Plots.jl',       papers: [] },
			{ name: 'Makie.jl',       github: 'https://github.com/MakieOrg/Makie.jl',         papers: [] },
			{ name: 'SankeyMakie.jl', github: 'https://github.com/MakieOrg/SankeyMakie.jl',   papers: [] },
		],
		notebookSections: CPVIZ_NOTEBOOK_SECTIONS,
		notebooks: CPVIZ_NOTEBOOK_SECTIONS.flatMap(s => s.notebooks),
		wikis: [
			{ name: 'Factsheet',      file: 'cpviz/factsheet.md',      bundled: true },
			{ name: 'Overview',       file: 'cpviz/overview.md',        bundled: true },
			{ name: 'Assumptions',    file: 'cpviz/assumptions.md',     bundled: true },
			{ name: 'Diagnostics',    file: 'cpviz/diagnostics.md',     bundled: true },
			{ name: 'Interpretation', file: 'cpviz/interpretation.md',  bundled: true },
			{ name: 'Decision Guide', file: 'cpviz/decision-guide.md',  bundled: true },
			{ separator: true, label: 'Plot Types' },
			{ name: 'Mosaic Plot',          file: 'cpviz/mosaic.md',      bundled: true },
			{ name: 'Nightingale Rose',     file: 'cpviz/nightingale.md', bundled: true },
			{ name: 'Waterfall Plot',       file: 'cpviz/waterfall.md',   bundled: true },
			{ name: 'Treemap',              file: 'cpviz/treemap.md',     bundled: true },
			{ name: 'Sankey Diagram',       file: 'cpviz/sankey.md',      bundled: true },
		],
		references: CPVIZ_REFERENCES,
		conceptMap: {
			center: 'Categories and Proportions',
			nodes: [
				{ id: 'root', label: 'Categories and Proportions', kind: 'center' },
				{ id: 'q_contig', label: 'Two-way categories', kind: 'concept' },
				{ id: 'q_partwhole', label: 'Parts of a whole', kind: 'concept' },
				{ id: 'q_flow', label: 'Flows and changes', kind: 'concept' },
				{ id: 'c_hier', label: 'Hierarchy', kind: 'concept' },
				{ id: 'mosaic', label: 'Mosaic Plot', kind: 'topic', model: 'mosaic' },
				{ id: 'nightingale', label: 'Nightingale Rose', kind: 'topic', model: 'nightingale' },
				{ id: 'waterfall', label: 'Waterfall', kind: 'topic', model: 'waterfall' },
				{ id: 'treemap', label: 'Treemap', kind: 'topic', model: 'treemap' },
				{ id: 'sankey', label: 'Sankey Diagram', kind: 'topic', model: 'sankey' },
				{ id: 'r_cviz', label: 'Core Statistical Plots', kind: 'related', command: 'chiara.explore.dvcs.bar' },
				{ id: 'r_gsviz', label: 'Graph and Spatial', kind: 'related', command: 'chiara.explore.dvgs.network' },
				{ id: 'ext', label: 'StatsPlots.jl', kind: 'external', url: 'https://github.com/JuliaPlots/StatsPlots.jl' },
			],
			edges: [
				{ from: 'root', to: 'q_contig', label: 'asks about' },
				{ from: 'root', to: 'q_partwhole', label: 'asks about' },
				{ from: 'root', to: 'q_flow', label: 'asks about' },
				{ from: 'q_contig', to: 'mosaic', label: 'tiled in' },
				{ from: 'q_partwhole', to: 'nightingale', label: 'polar wedges in' },
				{ from: 'q_partwhole', to: 'c_hier', label: 'organised as' },
				{ from: 'c_hier', to: 'treemap', label: 'nested in' },
				{ from: 'q_flow', to: 'waterfall', label: 'running total in' },
				{ from: 'q_flow', to: 'sankey', label: 'as ribbons in' },
				{ from: 'root', to: 'r_cviz', label: 'single category in' },
				{ from: 'q_flow', to: 'r_gsviz', label: 'as a graph in' },
				{ from: 'root', to: 'ext', label: 'plotted with' },
			],
		},
	},
};

export function openCpvizWebview(
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
			title: CPVIZ_TITLE,
			options: { retainContextWhenHidden: true },
			contentOptions: { allowScripts: true, localResourceRoots: [mermaid.distRoot] },
			extension: undefined,
		},
		CPVIZ_VIEW_TYPE,
		CPVIZ_TITLE,
		undefined,
		{ group: undefined, preserveFocus: false }
	);

	webviewInput.webview.setHtml(getCpvizHtml(mermaid.js));

	registerCpvizWebviewHandlers(
		webviewInput,
		CPVIZ_METADATA,
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
