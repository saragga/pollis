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
import { IRnnMetadata } from '../common/rnn.types.js';
import { registerRnnWebviewHandlers } from '../handlers/rnn.handler.js';
import { getRnnHtml } from '../webviews/rnn.template.js';

const RNN_VIEW_TYPE = 'pollis.rnn';
const RNN_TITLE = 'Recurrent Neural Networks';

const RNN_METADATA: IRnnMetadata = {
	rnn: {
		packages: [
			{ name: 'Flux.jl', github: 'https://github.com/FluxML/Flux.jl', papers: [] },
		],
		notebooks: [
			{ name: 'LSTM Basics',             file: 'rnn/tutorial-01-lstm.ipynb',      bundled: true, description: 'Sequence modelling with LSTM cells using Flux.jl' },
			{ name: 'GRU and Variants',         file: 'rnn/tutorial-02-gru.ipynb',       bundled: true, description: 'Gated recurrent units and lightweight alternatives' },
			{ name: 'Echo State Networks',      file: 'rnn/tutorial-03-esn.ipynb',       bundled: true, description: 'Reservoir computing with fixed random recurrent weights' },
			{ name: 'Attention-Augmented RNNs', file: 'rnn/tutorial-04-attention.ipynb', bundled: true, description: 'Adding multi-head attention on top of a recurrent encoder' },
		],
		wikis: [
			{ name: 'Overview',       file: 'rnn/overview.md',       bundled: true },
			{ name: 'Factsheet',      file: 'rnn/factsheet.md',      bundled: true },
			{ name: 'Assumptions',    file: 'rnn/assumptions.md',    bundled: true },
			{ name: 'Diagnostics',    file: 'rnn/diagnostics.md',    bundled: true },
			{ name: 'Interpretation', file: 'rnn/interpretation.md', bundled: true },
			{ name: 'Decision Guide',     file: 'rnn/decision-guide.md', bundled: true },
			{ name: 'Bidirectional RNNs', file: 'rnn/bidirectional.md',  bundled: true },
			{ name: 'Extensions',         file: 'rnn/extensions.md',     bundled: true },
		],
		tooltips: {
			hidden_size:     'Number of hidden units in each RNN layer. Larger values increase model capacity but also memory usage and training time. Typical range: 32–512.',
			num_layers:      'Number of stacked RNN layers. Deeper stacks can capture more abstract temporal patterns. Use dropout between layers to regularise. Typical range: 1–4.',
			dropout:         'Dropout probability applied between stacked RNN layers (not on the last layer). Set to 0 to disable. Typical range: 0.1–0.5.',
			reservoir_size:  'Number of neurons in the fixed random reservoir. More neurons give higher memory capacity. Typical range: 100–2000.',
			spectral_radius: 'Largest eigenvalue magnitude of the reservoir weight matrix. Values < 1 ensure the echo state property (fading memory). Typical range: 0.7–0.99.',
			sparsity:        'Fraction of reservoir connections set to zero. Sparse reservoirs (0.8–0.99) are computationally efficient and often generalise better.',
			leaking_rate:    'Leaking rate α ∈ (0, 1]. Controls how fast reservoir states respond to new inputs. Lower values produce slower, smoother dynamics.',
			num_heads:       'Number of parallel attention heads. Each head attends to a different subspace of the hidden states. Must divide hidden_size evenly. Typical: 4 or 8.',
		},
	},
};

export function openRnnWebview(
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
			title: RNN_TITLE,
			options: { retainContextWhenHidden: true },
			contentOptions: { allowScripts: true },
			extension: undefined,
		},
		RNN_VIEW_TYPE,
		RNN_TITLE,
		undefined,
		{ group: undefined, preserveFocus: false }
	);

	webviewInput.webview.setHtml(getRnnHtml());

	registerRnnWebviewHandlers(
		webviewInput,
		RNN_METADATA,
		openerService,
		editorService,
		quickInputService,
		commandService,
		clipboardService,
		notificationService,
		initialModel,
	);
}
