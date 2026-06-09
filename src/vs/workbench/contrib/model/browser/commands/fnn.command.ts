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
import { IFnnMetadata } from '../common/fnn.types.js';
import { registerFnnWebviewHandlers } from '../handlers/fnn.handler.js';
import { getFnnHtml } from '../webviews/fnn.template.js';

const FNN_VIEW_TYPE = 'pollis.fnn';
const FNN_TITLE = 'Feedforward Neural Networks';

const FNN_METADATA: IFnnMetadata = {
	fnn: {
		packages: [
			{
				name: 'Flux.jl',
				github: 'https://github.com/FluxML/Flux.jl',
				papers: [
					{ title: 'Auto-Encoding Variational Bayes', authors: 'Kingma, D.P. & Welling, M.', year: 2013, url: 'https://arxiv.org/abs/1312.6114', openAccess: true },
					{ title: 'Deep Residual Learning for Image Recognition', authors: 'He, K. et al.', year: 2016, url: 'https://arxiv.org/abs/1512.03385', openAccess: true },
					{ title: 'Mixture Density Networks', authors: 'Bishop, C.M.', year: 1994, url: 'https://publications.aston.ac.uk/id/eprint/373/1/NCRG_94_004.pdf', openAccess: true },
				],
			},
		],
		notebooks: [
			{ name: 'MLP Basics',        file: 'fnn/tutorial-01-mlp.ipynb',         bundled: true, description: 'Feedforward MLP for regression and classification with Flux.jl' },
			{ name: 'Autoencoder',        file: 'fnn/tutorial-02-autoencoder.ipynb',  bundled: true, description: 'Unsupervised representation learning via encoder–decoder compression' },
			{ name: 'Variational AE',     file: 'fnn/tutorial-03-vae.ipynb',          bundled: true, description: 'Latent variable generative model with ELBO training' },
			{ name: 'Mixture Density Network', file: 'fnn/tutorial-04-mdn.ipynb',    bundled: true, description: 'Probabilistic output as a Gaussian mixture; captures multimodal targets' },
		],
		wikis: [
			{ name: 'Overview',               file: 'fnn/overview.md',            bundled: true },
			{ name: 'Factsheet',              file: 'fnn/factsheet.md',           bundled: true },
			{ name: 'Assumptions',            file: 'fnn/assumptions.md',         bundled: true },
			{ name: 'Diagnostics',            file: 'fnn/diagnostics.md',         bundled: true },
			{ name: 'Interpretation',         file: 'fnn/interpretation.md',      bundled: true },
			{ name: 'Decision Guide',         file: 'fnn/decision-guide.md',      bundled: true },
			{ name: 'Autoencoder',            file: 'fnn/autoencoder.md',         bundled: true },
			{ name: 'Variational Autoencoder', file: 'fnn/vae.md',                bundled: true },
			{ name: 'Residual & BatchNorm',   file: 'fnn/residual-batchnorm.md',  bundled: true },
			{ name: 'Mixture Density Network', file: 'fnn/mdn.md',               bundled: true },
		],
		tooltips: {
			input_size:    'Dimensionality of the input vector. For tabular data this is the number of features; for time-series, it is the flattened look-back window or number of channels.',
			hidden_size:   'Width of each hidden layer (number of neurons). Larger values increase model capacity at the cost of compute and overfitting risk. Typical range: 64–512.',
			num_layers:    'Number of hidden layers (depth). Shallow networks (1–2 layers) suffice for smooth targets; deeper networks (3–8) are needed for highly non-linear mappings.',
			output_size:   'Dimensionality of the network output. Use 1 for scalar regression, N for multi-output regression or N-class softmax classification.',
			latent_dim:    'Dimension of the bottleneck (latent) space in autoencoders. Smaller values force stronger compression; larger values preserve more information. Typical range: 2–64.',
			dropout:       'Dropout probability applied after each hidden activation. Regularises the network by randomly zeroing neurons during training. Set to 0 to disable. Typical range: 0.1–0.5.',
			num_components: 'Number of Gaussian components K in the Mixture Density Network output head. Higher K allows the model to capture more complex, multi-modal conditional distributions. Typical range: 3–20.',
		},
	},
};

export function openFnnWebview(
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
			title: FNN_TITLE,
			options: { retainContextWhenHidden: true },
			contentOptions: { allowScripts: true },
			extension: undefined,
		},
		FNN_VIEW_TYPE,
		FNN_TITLE,
		undefined,
		{ group: undefined, preserveFocus: false }
	);

	webviewInput.webview.setHtml(getFnnHtml());

	registerFnnWebviewHandlers(
		webviewInput,
		FNN_METADATA,
		openerService,
		editorService,
		quickInputService,
		commandService,
		clipboardService,
		notificationService,
	);
}
