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
import { ICnnMetadata } from '../common/cnn.types.js';
import { registerCnnWebviewHandlers } from '../handlers/cnn.handler.js';
import { getCnnHtml } from '../webviews/cnn.template.js';

const CNN_VIEW_TYPE = 'pollis.cnn';
const CNN_TITLE = 'Convolutional Neural Networks';

const CNN_METADATA: ICnnMetadata = {
	cnn: {
		packages: [
			{ name: 'Flux.jl', github: 'https://github.com/FluxML/Flux.jl', papers: [] },
		],
		notebooks: [
			{ name: '1D CNN Basics',       file: 'cnn/tutorial-01-conv1d.ipynb',  bundled: true, description: 'Temporal convolution for time-series with Flux.jl' },
			{ name: 'Dilated Convolutions', file: 'cnn/tutorial-02-dilated.ipynb', bundled: true, description: 'Exponential dilation schedules for long-range receptive fields' },
			{ name: 'TCN Architecture',     file: 'cnn/tutorial-03-tcn.ipynb',     bundled: true, description: 'Temporal Convolutional Networks: causal, dilated, residual blocks' },
		],
		wikis: [
			{ name: 'Overview',                    file: 'cnn/overview.md',              bundled: true },
			{ name: 'Factsheet',                   file: 'cnn/factsheet.md',             bundled: true },
			{ name: 'Assumptions',                 file: 'cnn/assumptions.md',           bundled: true },
			{ name: 'Diagnostics',                 file: 'cnn/diagnostics.md',           bundled: true },
			{ name: 'Interpretation',              file: 'cnn/interpretation.md',        bundled: true },
			{ name: 'Decision Guide',              file: 'cnn/decision-guide.md',        bundled: true },
			{ name: 'Causal & Multi-Channel Guide', file: 'cnn/causal-multichannel.md', bundled: true },
		],
		tooltips: {
			in_channels:  'Number of input channels. Use 1 for a single time series. With multi-channel enabled, set this to the number of parallel input features (e.g. price, volume, sentiment).',
			out_channels: 'Number of feature maps (filters) in each convolutional layer. More channels capture richer patterns at the cost of more parameters. Typical range: 32–256.',
			kernel_size:  'Length of the convolution window in the time dimension. Larger kernels capture longer local patterns but reduce the output sequence length (acausal) or require more padding (causal). Typical range: 3–9.',
			num_layers:   'Number of stacked convolutional layers. Each layer applies a convolution to the output of the previous one. More layers increase depth without growing the kernel. Typical range: 2–8.',
			dilation_base: 'Base of the exponential dilation schedule. At layer l the dilation is base^(l−1), giving dilations 1, 2, 4, 8, … for base=2. The total receptive field grows exponentially with depth.',
			num_blocks:   'Number of residual TCN blocks. Each block contains two causal dilated convolutions with a skip connection. The dilation doubles with each block: 1, 2, 4, …',
			dropout:      'Dropout probability applied after each activation inside a TCN block. Regularises deep networks. Set to 0 to disable. Typical range: 0.1–0.3.',
		},
	},
};

export function openCnnWebview(
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
			title: CNN_TITLE,
			options: { retainContextWhenHidden: true },
			contentOptions: { allowScripts: true },
			extension: undefined,
		},
		CNN_VIEW_TYPE,
		CNN_TITLE,
		undefined,
		{ group: undefined, preserveFocus: false }
	);

	webviewInput.webview.setHtml(getCnnHtml());

	registerCnnWebviewHandlers(
		webviewInput,
		CNN_METADATA,
		openerService,
		editorService,
		quickInputService,
		commandService,
		clipboardService,
		notificationService,
	);
}
