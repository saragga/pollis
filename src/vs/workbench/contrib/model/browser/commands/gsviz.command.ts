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
import { IGsvizMetadata } from '../common/gsviz.types.js';
import { IModelReference, IModelNotebookSection } from '../common/model.types.js';
import { INotebookEditorModelResolverService } from '../../../notebook/common/notebookEditorModelResolverService.js';
import { INotebookKernelService } from '../../../notebook/common/notebookKernelService.js';
import { ILanguageService } from '../../../../../editor/common/languages/language.js';
import { IThemeService } from '../../../../../platform/theme/common/themeService.js';
import { IFileService } from '../../../../../platform/files/common/files.js';
import { IPathService } from '../../../../services/path/common/pathService.js';
import { IWorkspaceContextService } from '../../../../../platform/workspace/common/workspace.js';
import { registerGsvizWebviewHandlers } from '../handlers/gsviz.handler.js';
import { getGsvizHtml } from '../webviews/gsviz.template.js';

const GSVIZ_VIEW_TYPE = 'pollis.gsviz';
const GSVIZ_TITLE = 'Graph and Spatial Plots';

const GSVIZ_REFERENCES: IModelReference[] = [
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
		title: 'Graphs.jl: Graph Algorithms for Julia',
		authors: 'Fairbanks, James; Besançon, Mathieu; Simon, Schölly; others',
		year: 2021,
		journal: 'GitHub',
		url: 'https://github.com/JuliaGraphs/Graphs.jl',
		openAccess: true,
	},
	{
		title: 'GraphMakie.jl: Plotting Graphs with Makie',
		authors: 'Hartmann, Hans; contributors',
		year: 2022,
		journal: 'GitHub',
		url: 'https://github.com/MakieOrg/GraphMakie.jl',
		openAccess: true,
	},
	{
		title: 'GeoMakie.jl: Geographical Plotting for Julia',
		authors: 'Krumbiegel, Julius; Gardener, Anshul; contributors',
		year: 2023,
		journal: 'GitHub',
		url: 'https://github.com/MakieOrg/GeoMakie.jl',
		openAccess: true,
	},
	{ separator: true, label: 'Textbooks' },
	{
		title: 'Networks, Crowds, and Markets: Reasoning About a Highly Connected World',
		authors: 'Easley, David; Kleinberg, Jon',
		year: 2010,
		journal: 'Cambridge University Press',
		url: 'https://www.cs.cornell.edu/home/kleinber/networks-book/',
		openAccess: true,
	},
	{
		title: 'How to Lie with Maps',
		authors: 'Monmonier, Mark',
		year: 2018,
		journal: 'University of Chicago Press (3rd ed.)',
		url: 'https://press.uchicago.edu/ucp/books/book/chicago/H/bo27400543.html',
		openAccess: false,
	},
	{ separator: true, label: 'Original Papers' },
	{
		title: 'A Set of Measures of Centrality Based on Betweenness',
		authors: 'Freeman, Linton C.',
		year: 1977,
		journal: 'Sociometry',
		doi: '10.2307/3033543',
		openAccess: false,
	},
	{
		title: 'Drawing Dynamic Trees',
		authors: 'Buchheim, Christoph; Junger, Michael; Leipert, Sebastian',
		year: 2002,
		journal: 'Software: Practice and Experience',
		doi: '10.1002/spe.713',
		openAccess: false,
	},
];

export const GSVIZ_NOTEBOOK_SECTIONS: IModelNotebookSection[] = [
	{
		label: 'Graph and Spatial Plots',
		notebooks: [
			{ name: 'Network Diagram', file: 'gsviz/tutorial-01-network.ipynb',     bundled: true, description: 'Build a graph and plot nodes and edges with GraphMakie.jl, sized by centrality' },
			{ name: 'Tree Diagram',    file: 'gsviz/tutorial-02-tree.ipynb',        bundled: true, description: 'Hierarchical layout of a tree with the Buchheim algorithm' },
			{ name: 'Choropleth',      file: 'gsviz/tutorial-03-choropleth.ipynb',  bundled: true, description: 'Shade geographic regions by value on a GeoAxis with GeoMakie.jl' },
			{ name: 'Voronoi',         file: 'gsviz/tutorial-04-voronoi.ipynb',     bundled: true, description: 'Partition the plane into nearest-site cells with DelaunayTriangulation.jl' },
		],
	},
];

const GSVIZ_METADATA: IGsvizMetadata = {
	gsviz: {
		packages: [
			{ name: 'Graphs.jl',     github: 'https://github.com/JuliaGraphs/Graphs.jl',  papers: [] },
			{ name: 'GraphMakie.jl', github: 'https://github.com/MakieOrg/GraphMakie.jl',  papers: [] },
			{ name: 'GeoMakie.jl',   github: 'https://github.com/MakieOrg/GeoMakie.jl',    papers: [] },
			{ name: 'Makie.jl',      github: 'https://github.com/MakieOrg/Makie.jl',       papers: [] },
			{ name: 'DelaunayTriangulation.jl', github: 'https://github.com/JuliaGeometry/DelaunayTriangulation.jl', papers: [] },
		],
		notebookSections: GSVIZ_NOTEBOOK_SECTIONS,
		notebooks: GSVIZ_NOTEBOOK_SECTIONS.flatMap(s => s.notebooks),
		wikis: [
			{ name: 'Factsheet',      description: 'Quick-reference: plot types, Julia packages, and when to use each',       file: 'gsviz/factsheet.md',      bundled: true },
			{ name: 'Overview',       description: 'When to use graph and spatial visualisations',                              file: 'gsviz/overview.md',        bundled: true },
			{ name: 'Assumptions',    description: 'Data requirements for valid graph and geographic plots',                    file: 'gsviz/assumptions.md',     bundled: true },
			{ name: 'Diagnostics',    description: 'Common layout issues, overplotting, and projection pitfalls',               file: 'gsviz/diagnostics.md',     bundled: true },
			{ name: 'Interpretation', description: 'How to read network topology, spatial distributions, and partitions',       file: 'gsviz/interpretation.md',  bundled: true },
			{ name: 'Decision Guide', description: 'Which plot fits your relational or geographic data structure',              file: 'gsviz/decision-guide.md',  bundled: true },
			{ separator: true, label: 'Plot Types' },
			{ name: 'Network Diagram', description: 'Nodes and edges showing relational structure between entities',            file: 'gsviz/network.md',     bundled: true },
			{ name: 'Tree Diagram',    description: 'Hierarchical parent–child relationships as a branching layout',            file: 'gsviz/tree.md',        bundled: true },
			{ name: 'Choropleth',      description: 'Geographic regions coloured by a scalar variable',                        file: 'gsviz/choropleth.md',  bundled: true },
			{ name: 'Voronoi',         description: 'Spatial partition of a plane into regions nearest each seed point',       file: 'gsviz/voronoi.md',     bundled: true },
		],
		references: GSVIZ_REFERENCES,
		conceptMap: {
			center: 'Relationships and Space',
			nodes: [
				{ id: 'root', label: 'Relationships and Space', kind: 'center' },
				{ id: 'q_rel', label: 'Relational structure', kind: 'concept' },
				{ id: 'q_geo', label: 'Geographic data', kind: 'concept' },
				{ id: 'q_part', label: 'Spatial partition', kind: 'concept' },
				{ id: 'c_hier', label: 'Hierarchy', kind: 'concept' },
				{ id: 'network', label: 'Network Diagram', kind: 'topic', model: 'network' },
				{ id: 'tree', label: 'Tree Diagram', kind: 'topic', model: 'tree' },
				{ id: 'choropleth', label: 'Choropleth', kind: 'topic', model: 'choropleth' },
				{ id: 'voronoi', label: 'Voronoi', kind: 'topic', model: 'voronoi' },
				{ id: 'r_mviz', label: 'Multivariate Plots', kind: 'related', command: 'chiara.explore.dvmulti.corner' },
				{ id: 'r_sfviz', label: 'Surfaces and Fields', kind: 'related', command: 'chiara.explore.dvsf.contour' },
				{ id: 'ext', label: 'Graphs.jl', kind: 'external', url: 'https://github.com/JuliaGraphs/Graphs.jl' },
			],
			edges: [
				{ from: 'root', to: 'q_rel', label: 'asks about' },
				{ from: 'root', to: 'q_geo', label: 'asks about' },
				{ from: 'root', to: 'q_part', label: 'asks about' },
				{ from: 'q_rel', to: 'network', label: 'nodes + edges in' },
				{ from: 'q_rel', to: 'c_hier', label: 'special case' },
				{ from: 'c_hier', to: 'tree', label: 'drawn by' },
				{ from: 'q_geo', to: 'choropleth', label: 'regions in' },
				{ from: 'q_part', to: 'voronoi', label: 'cells in' },
				{ from: 'q_rel', to: 'r_mviz', label: 'from data in' },
				{ from: 'q_geo', to: 'r_sfviz', label: 'as a field in' },
				{ from: 'root', to: 'ext', label: 'built with' },
			],
		},
	},
};

export function openGsvizWebview(
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
			title: GSVIZ_TITLE,
			options: { retainContextWhenHidden: true },
			contentOptions: { allowScripts: true, localResourceRoots: [mermaid.distRoot] },
			extension: undefined,
		},
		GSVIZ_VIEW_TYPE,
		GSVIZ_TITLE,
		undefined,
		{ group: undefined, preserveFocus: false }
	);

	webviewInput.webview.setHtml(getGsvizHtml(mermaid.js));

	registerGsvizWebviewHandlers(
		webviewInput,
		GSVIZ_METADATA,
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
