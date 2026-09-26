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
import { IModelReference, IModelNotebookSection } from '../common/model.types.js';
import { INgoMetadata } from '../common/ngo.types.js';
import { registerNgoWebviewHandlers } from '../handlers/ngo.handler.js';
import { getNgoHtml } from '../webviews/ngo.template.js';

const NGO_VIEW_TYPE = 'pollis.ngo';
const NGO_TITLE = 'Network and Graph Optimisation';

const NGO_REFERENCES: IModelReference[] = [
	{ separator: true, label: 'Software' },
	{
		title: 'Julia: A Fresh Approach to Numerical Computing',
		authors: 'Bezanson, Jeff; Edelman, Alan; Karpinski, Stefan; Shah, Viral B.',
		year: 2017,
		journal: 'SIAM Review',
		doi: '10.1137/141000671',
		openAccess: false,
	},
	{ separator: true, label: 'Textbooks' },
	{
		title: 'Introduction to Algorithms',
		authors: 'Cormen, Thomas H.; Leiserson, Charles E.; Rivest, Ronald L.; Stein, Clifford',
		year: 2022,
		journal: 'MIT Press (4th ed.)',
		openAccess: false,
	},
	{
		title: 'Network Flows: Theory, Algorithms, and Applications',
		authors: 'Ahuja, Ravindra K.; Magnanti, Thomas L.; Orlin, James B.',
		year: 1993,
		journal: 'Prentice Hall',
		openAccess: false,
	},
	{ separator: true, label: 'Original Papers' },
	{
		title: 'A Note on Two Problems in Connexion with Graphs',
		authors: 'Dijkstra, Edsger W.',
		year: 1959,
		journal: 'Numerische Mathematik',
		doi: '10.1007/BF01386390',
		openAccess: false,
	},
	{
		title: 'An Exact Algorithm for the Robust Shortest Path Problem with Interval Data',
		authors: 'Montemanni, Roberto; Gambardella, Luca M.',
		year: 2004,
		journal: 'Computers & Operations Research',
		doi: '10.1016/S0305-0548(03)00085-3',
		openAccess: false,
	},
	{
		title: 'Maximal Flow Through a Network',
		authors: 'Ford, Lester R.; Fulkerson, Delbert R.',
		year: 1956,
		journal: 'Canadian Journal of Mathematics',
		doi: '10.4153/CJM-1956-045-5',
		openAccess: false,
	},
	{
		title: 'On the Shortest Spanning Subtree of a Graph and the Traveling Salesman Problem',
		authors: 'Kruskal, Joseph B.',
		year: 1956,
		journal: 'Proceedings of the American Mathematical Society',
		doi: '10.1090/S0002-9939-1956-0078686-7',
		openAccess: false,
	},
	{
		title: 'The Hungarian Method for the Assignment Problem',
		authors: 'Kuhn, Harold W.',
		year: 1955,
		journal: 'Naval Research Logistics Quarterly',
		doi: '10.1002/nav.3800020109',
		openAccess: false,
	},
];

export const NGO_NOTEBOOK_SECTIONS: IModelNotebookSection[] = [
	{
		label: '',
		notebooks: [
			{
				name: 'Shortest Path',
				file: 'ngo/tutorial-01-sp.ipynb',
				bundled: true,
				description: 'Dijkstra, Bellman-Ford, and A* for single-source shortest paths on weighted directed graphs',
			},
			{
				name: 'Robust Shortest Path',
				file: 'ngo/tutorial-02-rsp.ipynb',
				bundled: true,
				description: 'Min-max regret robust shortest path with interval edge weights via RobustShortestPath.jl',
			},
			{
				name: 'Network Flow',
				file: 'ngo/tutorial-03-nf.ipynb',
				bundled: true,
				description: 'Maximum flow and minimum cut on directed capacity networks via Dinic and push-relabel',
			},
			{
				name: 'Spanning Tree',
				file: 'ngo/tutorial-04-st.ipynb',
				bundled: true,
				description: 'Minimum spanning tree via Kruskal and Prim on undirected weighted graphs',
			},
			{
				name: 'Bipartite Matching',
				file: 'ngo/tutorial-05-bm.ipynb',
				bundled: true,
				description: 'Maximum weight bipartite matching via GraphsOptim; maximises matched pairs',
			},
			{
				name: 'Assignment',
				file: 'ngo/tutorial-06-am.ipynb',
				bundled: true,
				description: 'Minimum cost assignment problem via the Hungarian method',
			},
		],
	},
];

const NGO_METADATA: INgoMetadata = {
	ngo: {
		packages: [
			{
				name: 'RobustShortestPath.jl',
				github: 'https://github.com/chkwon/RobustShortestPath.jl',
				papers: [],
			},
			{
				name: 'Graphs.jl',
				github: 'https://github.com/JuliaGraphs/Graphs.jl',
				papers: [],
			},
			{
				name: 'SimpleWeightedGraphs.jl',
				github: 'https://github.com/JuliaGraphs/SimpleWeightedGraphs.jl',
				papers: [],
			},
			{
				name: 'GraphsFlows.jl',
				github: 'https://github.com/JuliaGraphs/GraphsFlows.jl',
				papers: [],
			},
			{
				name: 'GraphsOptim.jl',
				github: 'https://github.com/JuliaGraphs/GraphsOptim.jl',
				papers: [],
			},
			{
				name: 'Hungarian.jl',
				github: 'https://github.com/Gnimuc/Hungarian.jl',
				papers: [],
			},
		],
		notebookSections: NGO_NOTEBOOK_SECTIONS,
		notebooks: NGO_NOTEBOOK_SECTIONS.flatMap(s => s.notebooks),
		wikis: [
			{ name: 'Factsheet',      file: 'ngo/factsheet.md',      bundled: true },
			{ name: 'Overview',       file: 'ngo/overview.md',        bundled: true },
			{ name: 'Assumptions',    file: 'ngo/assumptions.md',     bundled: true },
			{ name: 'Diagnostics',    file: 'ngo/diagnostics.md',     bundled: true },
			{ name: 'Interpretation', file: 'ngo/interpretation.md',  bundled: true },
			{ name: 'Decision Guide', file: 'ngo/decision-guide.md',  bundled: true },
			{ separator: true, label: 'Algorithms' },
			{ name: 'Shortest Path',          file: 'ngo/sp.md',  bundled: true },
			{ name: 'Robust Shortest Path',   file: 'ngo/rsp.md', bundled: true },
			{ name: 'Network Flow',   file: 'ngo/nf.md', bundled: true },
			{ name: 'Spanning Tree',  file: 'ngo/st.md', bundled: true },
			{ name: 'Bipartite Matching', file: 'ngo/bm.md', bundled: true },
			{ name: 'Assignment',         file: 'ngo/am.md', bundled: true },
		],
		references: NGO_REFERENCES,
	},
};

export function openNgoWebview(
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
			title: NGO_TITLE,
			options: { retainContextWhenHidden: true },
			contentOptions: { allowScripts: true },
			extension: undefined,
		},
		NGO_VIEW_TYPE,
		NGO_TITLE,
		undefined,
		{ group: undefined, preserveFocus: false }
	);

	webviewInput.webview.setHtml(getNgoHtml());

	registerNgoWebviewHandlers(
		webviewInput,
		NGO_METADATA,
		openerService,
		editorService,
		quickInputService,
		commandService,
		clipboardService,
		notificationService,
		initialModel,
	);
}
