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
import { INetflowMetadata } from '../common/netflow.types.js';
import { IModelReference } from '../common/model.types.js';
import { registerNetflowWebviewHandlers } from '../handlers/netflow.handler.js';
import { getNetflowHtml } from '../webviews/netflow.template.js';

const NETFLOW_VIEW_TYPE = 'pollis.netflow';
const NETFLOW_TITLE = 'Network Flows';

const NETFLOW_REFERENCES: IModelReference[] = [
	{ separator: true, label: 'Software' },
	{
		title: 'Graphs.jl: a General-Purpose Graph Library for the Julia Programming Language',
		authors: 'Bromberger, Seth; Fairbanks, James; contributors',
		year: 2017,
		journal: 'JuliaCon Proceedings',
		openAccess: true,
	},
	{ separator: true, label: 'Textbooks' },
	{
		title: 'Network Flows: Theory, Algorithms, and Applications',
		authors: 'Ahuja, Ravindra K.; Magnanti, Thomas L.; Orlin, James B.',
		year: 1993,
		journal: 'Prentice Hall',
		openAccess: false,
	},
	{
		title: 'Introduction to Algorithms',
		authors: 'Cormen, Thomas H.; Leiserson, Charles E.; Rivest, Ronald L.; Stein, Clifford',
		year: 2022,
		journal: 'MIT Press (4th ed.)',
		openAccess: false,
	},
	{ separator: true, label: 'Original Papers' },
	{
		title: 'Maximal Flow Through a Network',
		authors: 'Ford, Lester R.; Fulkerson, Delbert R.',
		year: 1956,
		journal: 'Canadian Journal of Mathematics',
		doi: '10.4153/CJM-1956-045-5',
		openAccess: false,
	},
	{
		title: 'Algorithm for Solution of a Problem of Maximum Flow in Networks with Power Estimation',
		authors: 'Dinic, Efim A.',
		year: 1970,
		journal: 'Soviet Mathematics Doklady',
		openAccess: false,
	},
	{
		title: 'A Simple Min-Cut Algorithm',
		authors: 'Stoer, Mechthild; Wagner, Frank',
		year: 1997,
		journal: 'Journal of the ACM',
		doi: '10.1145/263867.263872',
		openAccess: false,
	},
];

const NETFLOW_METADATA: INetflowMetadata = {
	netflow: {
		packages: [
			{
				name: 'GraphsFlows.jl',
				github: 'https://github.com/JuliaGraphs/GraphsFlows.jl',
				papers: [],
				videos: [],
			},
			{
				name: 'Graphs.jl',
				github: 'https://juliagraphs.org/Graphs.jl/stable/',
				papers: [],
				videos: [],
			},
		],
		notebooks: [
			{ name: 'Maximum Flow',      file: 'netflow/tutorial-01-max-flow.ipynb',  bundled: true, description: 'Find the maximum flow from source to sink in a capacitated network using the Dinic algorithm' },
			{ name: 'Minimum Cost Flow', file: 'netflow/tutorial-02-min-cost.ipynb',  bundled: true, description: 'Route a given flow demand through a network at minimum total cost using successive shortest paths' },
			{ name: 'Minimum Cut',       file: 'netflow/tutorial-03-min-cut.ipynb',   bundled: true, description: 'Find the minimum cut separating source and sink and identify the bottleneck edges via max-flow min-cut duality' },
		],
		wikis: [
			{ name: 'Factsheet',         file: 'netflow/factsheet.md',        bundled: true },
			{ name: 'Overview',          file: 'netflow/overview.md',          bundled: true },
			{ name: 'Assumptions',       file: 'netflow/assumptions.md',       bundled: true },
			{ name: 'Diagnostics',       file: 'netflow/diagnostics.md',       bundled: true },
			{ name: 'Interpretation',    file: 'netflow/interpretation.md',    bundled: true },
			{ name: 'Decision Guide',    file: 'netflow/decision-guide.md',    bundled: true },
			{ separator: true, label: 'Algorithms' },
			{ name: 'Maximum Flow',      file: 'netflow/max-flow.md',          bundled: true },
			{ name: 'Minimum Cost Flow', file: 'netflow/min-cost-flow.md',     bundled: true },
			{ name: 'Minimum Cut',       file: 'netflow/min-cut.md',           bundled: true },
		],
		references: NETFLOW_REFERENCES,
	},
};

export function openNetflowWebview(
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
			title: NETFLOW_TITLE,
			options: { retainContextWhenHidden: true },
			contentOptions: { allowScripts: true },
			extension: undefined,
		},
		NETFLOW_VIEW_TYPE,
		NETFLOW_TITLE,
		undefined,
		{ group: undefined, preserveFocus: false }
	);

	webviewInput.webview.setHtml(getNetflowHtml());

	registerNetflowWebviewHandlers(
		webviewInput,
		NETFLOW_METADATA,
		openerService,
		editorService,
		quickInputService,
		commandService,
		clipboardService,
		notificationService,
		initialModel,
	);
}
