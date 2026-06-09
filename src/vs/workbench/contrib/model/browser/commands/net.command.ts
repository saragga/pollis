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
import { INetMetadata } from '../common/net.types.js';
import { IModelReference } from '../common/model.types.js';
import { registerNetWebviewHandlers } from '../handlers/net.handler.js';
import { getNetHtml } from '../webviews/net.template.js';

const NET_VIEW_TYPE = 'pollis.net';
const NET_TITLE = 'Network Analysis';

const NET_REFERENCES: IModelReference[] = [
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
		title: 'Networks: An Introduction',
		authors: 'Newman, Mark E. J.',
		year: 2010,
		journal: 'Oxford University Press',
		openAccess: false,
	},
	{
		title: 'Network Science',
		authors: 'Barabasi, Albert-Laszlo',
		year: 2016,
		journal: 'Cambridge University Press',
		openAccess: true,
	},
	{ separator: true, label: 'Original Papers' },
	{
		title: 'On the Evolution of Random Graphs',
		authors: 'Erdos, Paul; Renyi, Alfred',
		year: 1960,
		journal: 'Publications of the Mathematical Institute of the Hungarian Academy of Sciences',
		openAccess: false,
	},
	{
		title: 'Emergence of Scaling in Random Networks',
		authors: 'Barabasi, Albert-Laszlo; Albert, Reka',
		year: 1999,
		journal: 'Science',
		doi: '10.1126/science.286.5439.509',
		openAccess: false,
	},
	{
		title: 'Collective Dynamics of Small-World Networks',
		authors: 'Watts, Duncan J.; Strogatz, Steven H.',
		year: 1998,
		journal: 'Nature',
		doi: '10.1038/30918',
		openAccess: false,
	},
];

const NET_METADATA: INetMetadata = {
	net: {
		packages: [
			{
				name: 'Graphs.jl',
				github: 'https://juliagraphs.org/Graphs.jl/stable/',
				papers: [],
				videos: [],
			},
			{
				name: 'MetaGraphsNext.jl',
				github: 'https://github.com/JuliaGraphs/MetaGraphsNext.jl',
				papers: [],
				videos: [],
			},
		],
		notebooks: [
			{ name: 'Erdos-Renyi Random Graph',   file: 'net/tutorial-01-erdos-renyi.ipynb',  bundled: true, description: 'Generate and analyse Erdos-Renyi random graphs and study how connectivity emerges with edge probability' },
			{ name: 'Scale-Free Networks',         file: 'net/tutorial-02-scale-free.ipynb',   bundled: true, description: 'Build Barabasi-Albert preferential attachment networks and measure their heavy-tailed degree distributions' },
			{ name: 'Small-World Networks',        file: 'net/tutorial-03-small-world.ipynb',  bundled: true, description: 'Construct Watts-Strogatz small-world graphs and quantify the clustering-path-length trade-off' },
			{ name: 'Attributed Graphs',           file: 'net/tutorial-04-metagraphs.ipynb',   bundled: true, description: 'Attach typed vertex and edge metadata with MetaGraphsNext.jl and query graphs by attribute' },
		],
		wikis: [
			{ name: 'Factsheet',        file: 'net/factsheet.md',       bundled: true },
			{ name: 'Overview',         file: 'net/overview.md',         bundled: true },
			{ name: 'Assumptions',      file: 'net/assumptions.md',      bundled: true },
			{ name: 'Diagnostics',      file: 'net/diagnostics.md',      bundled: true },
			{ name: 'Interpretation',   file: 'net/interpretation.md',   bundled: true },
			{ name: 'Decision Guide',   file: 'net/decision-guide.md',   bundled: true },
			{ separator: true, label: 'Graph Types' },
			{ name: 'Erdos-Renyi',      file: 'net/erdos-renyi.md',      bundled: true },
			{ name: 'Scale-Free',       file: 'net/scale-free.md',       bundled: true },
			{ name: 'Small-World',      file: 'net/small-world.md',      bundled: true },
			{ name: 'Attributed Graphs',file: 'net/metagraphs.md',       bundled: true },
		],
		references: NET_REFERENCES,
	},
};

export function openNetWebview(
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
			title: NET_TITLE,
			options: { retainContextWhenHidden: true },
			contentOptions: { allowScripts: true },
			extension: undefined,
		},
		NET_VIEW_TYPE,
		NET_TITLE,
		undefined,
		{ group: undefined, preserveFocus: false }
	);

	webviewInput.webview.setHtml(getNetHtml());

	registerNetWebviewHandlers(
		webviewInput,
		NET_METADATA,
		openerService,
		editorService,
		quickInputService,
		commandService,
		clipboardService,
		notificationService,
		initialModel,
	);
}
