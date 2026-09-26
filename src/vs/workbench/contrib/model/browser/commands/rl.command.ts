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
import { IRlMetadata } from '../common/rl.types.js';
import { registerRlWebviewHandlers } from '../handlers/rl.handler.js';
import { getRlHtml } from '../webviews/rl.template.js';

const RL_VIEW_TYPE = 'pollis.rl';
const RL_TITLE = 'Recurrent Layers';

const RL_METADATA: IRlMetadata = {
	rl: {
		packages: [
			{
				name: 'RecurrentLayers.jl',
				github: 'https://github.com/MartinuzziFrancesco/RecurrentLayers.jl',
				papers: [
					{
						title: 'Unified Implementations of Recurrent Neural Networks in Multiple Deep Learning Frameworks',
						authors: 'Martinuzzi, Francesco',
						year: 2025,
						journal: 'arXiv',
						url: 'https://arxiv.org/abs/2508.12942',
						openAccess: true,
					},
				],
			},
			{
				name: 'LuxRecurrentLayers.jl',
				github: 'https://github.com/MartinuzziFrancesco/LuxRecurrentLayers.jl',
				papers: [],
			},
			{
				name: 'Flux.jl',
				github: 'https://github.com/FluxML/Flux.jl',
				papers: [],
			},
			{
				name: 'Lux.jl',
				github: 'https://github.com/LuxDL/Lux.jl',
				papers: [],
			},
		],
		notebooks: [
			{ name: 'Recurrent Cell Zoo',     file: 'rl/tutorial-01-zoo.ipynb',       bundled: true, description: 'Tour of the RecurrentLayers.jl cells with a shared training loop' },
			{ name: 'Minimal Gated Cells',    file: 'rl/tutorial-02-minimal.ipynb',   bundled: true, description: 'MGU, LiGRU and friends: lightweight gating for fast training' },
			{ name: 'Stable & Oscillatory',   file: 'rl/tutorial-03-stable.ipynb',    bundled: true, description: 'coRNN, UnICORNN and LEM for very long-range dependencies' },
			{ name: 'Same Cells in Lux',      file: 'rl/tutorial-04-lux.ipynb',       bundled: true, description: 'Porting a RecurrentLayers.jl model to the Lux explicit-parameter API' },
		],
		wikis: [
			{ name: 'Factsheet',         file: 'rl/factsheet.md',         bundled: true },
			{ name: 'Overview',          file: 'rl/overview.md',          bundled: true },
			{ name: 'Assumptions',       file: 'rl/assumptions.md',       bundled: true },
			{ name: 'Diagnostics',       file: 'rl/diagnostics.md',       bundled: true },
			{ name: 'Interpretation',    file: 'rl/interpretation.md',    bundled: true },
			{ name: 'Decision Guide',    file: 'rl/decision-guide.md',    bundled: true },
			{ name: 'Cell Catalogue',    file: 'rl/cell-catalogue.md',    bundled: true },
			{ name: 'Flux vs Lux',       file: 'rl/flux-vs-lux.md',       bundled: true },
		],
		tooltips: {
			backend:     'RecurrentLayers.jl targets Flux (implicit parameters); LuxRecurrentLayers.jl provides the same architectures for Lux (explicit parameters and state). Switching backend filters the cell list to those implemented in that package.',
			cell:        'The recurrent architecture. Every cell shares the same constructor, Name(input_size => hidden_size), so you can swap one for another without changing the surrounding code.',
			input_size:  'Number of input features per time step. Typical range: 1 for a univariate series up to several hundred for embeddings.',
			hidden_size: 'Width of the recurrent hidden state. Larger values add capacity at the cost of memory and compute. Typical range: 32-512.',
			output_size: 'Dimension of the prediction produced by the readout layer. Use 1 for scalar regression or the number of classes for classification.',
		},
	},
};

export function openRlWebview(
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
			title: RL_TITLE,
			options: { retainContextWhenHidden: true },
			contentOptions: { allowScripts: true },
			extension: undefined,
		},
		RL_VIEW_TYPE,
		RL_TITLE,
		undefined,
		{ group: undefined, preserveFocus: false }
	);

	webviewInput.webview.setHtml(getRlHtml());

	registerRlWebviewHandlers(
		webviewInput,
		RL_METADATA,
		openerService,
		editorService,
		quickInputService,
		commandService,
		clipboardService,
		notificationService,
		initialModel,
	);
}
