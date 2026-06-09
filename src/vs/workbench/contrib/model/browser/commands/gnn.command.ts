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
import { IGnnMetadata } from '../common/gnn.types.js';
import { registerGnnWebviewHandlers } from '../handlers/gnn.handler.js';
import { getGnnHtml } from '../webviews/gnn.template.js';

const GNN_VIEW_TYPE = 'pollis.gnn';
const GNN_TITLE = 'Graph Neural Networks';

const GNN_METADATA: IGnnMetadata = {
	gnn: {
		packages: [
			{ name: 'Flux.jl',                  github: 'https://github.com/FluxML/Flux.jl',                                  papers: [] },
			{ name: 'GraphNeuralNetworks.jl',    github: 'https://github.com/CarloLucibello/GraphNeuralNetworks.jl',           papers: [] },
		],
		notebooks: [
			{ name: 'GCN Basics',              file: 'gnn/tutorial-01-gcn.ipynb',      bundled: true, description: 'Node classification with Graph Convolutional Networks using GraphNeuralNetworks.jl' },
			{ name: 'Graph Attention Networks', file: 'gnn/tutorial-02-gat.ipynb',      bundled: true, description: 'Attention-weighted neighbourhood aggregation with GATConv' },
			{ name: 'GraphSAGE',               file: 'gnn/tutorial-03-graphsage.ipynb', bundled: true, description: 'Inductive learning on large graphs with neighbour sampling' },
			{ name: 'Temporal GNNs',           file: 'gnn/tutorial-04-temporal.ipynb',  bundled: true, description: 'EvolveGCN for dynamic graphs with time-varying topology' },
		],
		wikis: [
			{ name: 'Overview',            file: 'gnn/overview.md',       bundled: true },
			{ name: 'Factsheet',           file: 'gnn/factsheet.md',      bundled: true },
			{ name: 'Assumptions',         file: 'gnn/assumptions.md',    bundled: true },
			{ name: 'Diagnostics',         file: 'gnn/diagnostics.md',    bundled: true },
			{ name: 'Interpretation',      file: 'gnn/interpretation.md', bundled: true },
			{ name: 'Decision Guide',      file: 'gnn/decision-guide.md', bundled: true },
			{ name: 'Heterogeneous Graphs',           file: 'gnn/heterogeneous.md',           bundled: true },
			{ name: 'GNN Architectures in Finance',   file: 'gnn/gnn-architectures-finance.md', bundled: true },
		],
		tooltips: {
			in_channels:     'Number of input node features. Each node is represented by a feature vector of this length. In financial graphs, features might include balance-sheet ratios, trading volumes, or sector embeddings.',
			hidden_channels: 'Size of the hidden node embedding produced by each GNN layer. Larger values increase model capacity. Typical range: 32–256.',
			out_channels:    'Output dimension per node. For node classification this equals the number of classes. For regression or link prediction it is typically 1 or the embedding size fed to a downstream head.',
			num_layers:      'Number of stacked GNN convolution layers. Each layer aggregates one additional hop of neighbours. More layers risk over-smoothing on dense graphs. Typical range: 2–4.',
			dropout:         'Dropout probability applied between GNN layers. Regularises deep networks. Set to 0 to disable. Typical range: 0.1–0.5.',
			num_heads:       'Number of parallel attention heads in GAT. Each head attends to neighbours independently and outputs are concatenated (all but the last layer) or averaged (last layer). Must divide hidden_channels evenly. Typical: 4 or 8.',
			aggr:            'Neighbourhood aggregation function in GraphSAGE. mean averages neighbour features (smooth, stable). max selects the largest activation per feature (sharp, captures extremes). sum accumulates total neighbourhood signal (sensitive to degree).',
			time_steps:      'Number of discrete graph snapshots in the temporal sequence. EvolveGCN processes one snapshot per step, updating GCN weight matrices via a GRU. Typical range: 10–100.',
			num_relations:   'Number of distinct edge (relation) types in a heterogeneous graph. Each relation type has its own convolution weights, allowing the model to treat e.g. ownership, co-trading, and sentiment edges differently.',
		},
	},
};

export function openGnnWebview(
	webviewWorkbenchService: IWebviewWorkbenchService,
	openerService: IOpenerService,
	editorService: IEditorService,
	quickInputService: IQuickInputService,
	commandService: ICommandService,
	clipboardService: IClipboardService,
	notificationService: INotificationService,
): void {
	const webviewInput = webviewWorkbenchService.openWebview(
		{
			title: GNN_TITLE,
			options: { retainContextWhenHidden: true },
			contentOptions: { allowScripts: true },
			extension: undefined,
		},
		GNN_VIEW_TYPE,
		GNN_TITLE,
		undefined,
		{ group: undefined, preserveFocus: false }
	);

	webviewInput.webview.setHtml(getGnnHtml());

	registerGnnWebviewHandlers(
		webviewInput,
		GNN_METADATA,
		openerService,
		editorService,
		quickInputService,
		commandService,
		clipboardService,
		notificationService,
	);
}
