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
import { ITransformerMetadata } from '../common/transformer.types.js';
import { registerTransformerWebviewHandlers } from '../handlers/transformer.handler.js';
import { getTransformerHtml } from '../webviews/transformer.template.js';

const TF_VIEW_TYPE = 'pollis.transformer';
const TF_TITLE = 'Transformers';

const TF_METADATA: ITransformerMetadata = {
	transformer: {
		packages: [
			{ name: 'Flux.jl',           github: 'https://github.com/FluxML/Flux.jl',           papers: [] },
			{ name: 'Transformers.jl',   github: 'https://github.com/chengchingwen/Transformers.jl', papers: [] },
		],
		notebooks: [
			{ name: 'Encoder (BERT-style)',      file: 'transformer/tutorial-01-encoder.ipynb',     bundled: true, description: 'Encoder-only Transformer for classification and sequence labelling' },
			{ name: 'Decoder (GPT-style)',        file: 'transformer/tutorial-02-decoder.ipynb',     bundled: true, description: 'Causal decoder for autoregressive language modelling' },
			{ name: 'Encoder-Decoder',            file: 'transformer/tutorial-03-encdec.ipynb',      bundled: true, description: 'Full seq2seq Transformer with cross-attention for translation and summarisation' },
			{ name: 'Time Series (PatchTST)',     file: 'transformer/tutorial-04-timeseries.ipynb',  bundled: true, description: 'PatchTST: patch-based Transformer for multivariate time-series forecasting' },
			{ name: 'Cross-Modal Fusion',         file: 'transformer/tutorial-05-crossmodal.ipynb',  bundled: true, description: 'Fusing text and numerical features for financial prediction tasks' },
		],
		wikis: [
			{ name: 'Overview',                    file: 'transformer/overview.md',         bundled: true },
			{ name: 'Factsheet',                   file: 'transformer/factsheet.md',        bundled: true },
			{ name: 'Assumptions',                 file: 'transformer/assumptions.md',      bundled: true },
			{ name: 'Diagnostics',                 file: 'transformer/diagnostics.md',      bundled: true },
			{ name: 'Interpretation',              file: 'transformer/interpretation.md',   bundled: true },
			{ name: 'Decision Guide',              file: 'transformer/decision-guide.md',   bundled: true },
			{ name: 'Time Series Transformers',    file: 'transformer/time-series.md',         bundled: true },
			{ name: 'Cross-Modal Transformers',    file: 'transformer/cross-modal.md',         bundled: true },
			{ name: 'Efficient Attention',         file: 'transformer/efficient-attention.md',  bundled: true },
			{ name: 'Positional Encoding',         file: 'transformer/positional-encoding.md',  bundled: true },
		],
		tooltips: {
			d_model:    'Embedding dimension — the width of all token and position representations. All sub-layers (attention, FFN, residual connections) operate in this space. Must be divisible by num_heads. Typical range: 128–1024.',
			num_heads:  'Number of parallel attention heads. Each head attends to different aspects of the input independently; their outputs are concatenated. d_model must be divisible by num_heads. Typical: 4, 8, or 16.',
			num_layers: 'Number of stacked Transformer blocks. More layers capture deeper semantic structure but increase training cost and risk overfitting on small datasets. Typical: 4–12.',
			d_ff:       'Dimension of the position-wise feed-forward network inside each Transformer block. Usually 2× or 4× d_model. Larger values increase capacity at the cost of memory.',
			dropout:    'Dropout probability applied to attention weights and feed-forward activations for regularisation. Set to 0 to disable. Typical range: 0.1–0.3.',
			seq_len:    'Input sequence length in tokens. For text models: maximum number of tokens per example. For PatchTST: the historical lookback window length (number of time steps). Must be divisible by patch_size for PatchTST.',
			tgt_len:    'Target sequence length — the number of tokens the decoder generates. For translation this is the target sentence length; for summarisation it is the summary length.',
			pred_len:   'Forecast horizon — number of future time steps to predict. PatchTST maps the full patch sequence directly to a flat pred_len output vector. Typical values: 24, 96, 192, 720.',
			patch_size: 'Number of consecutive time steps grouped into one patch token. Smaller patches preserve finer detail; larger patches give a broader view per token. seq_len must be divisible by patch_size. Typical: 8–64.',
			vocab_size: 'Size of the token vocabulary — determines the Embedding table rows. For financial text with BPE tokenisation: 10 000–50 000. For byte-level models: 256.',
			d_num:      'Dimensionality of the numerical feature vector per example. In Cross-Modal models these features (price ratios, volumes, macro indicators) are projected to d_model via a Dense layer and fused with the text representation.',
		},
	},
};

export function openTransformerWebview(
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
			title: TF_TITLE,
			options: { retainContextWhenHidden: true },
			contentOptions: { allowScripts: true },
			extension: undefined,
		},
		TF_VIEW_TYPE,
		TF_TITLE,
		undefined,
		{ group: undefined, preserveFocus: false }
	);

	webviewInput.webview.setHtml(getTransformerHtml());

	registerTransformerWebviewHandlers(
		webviewInput,
		TF_METADATA,
		openerService,
		editorService,
		quickInputService,
		commandService,
		clipboardService,
		notificationService,
	);
}
