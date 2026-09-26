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
import { INfMetadata } from '../common/nf.types.js';
import { registerNfWebviewHandlers } from '../handlers/nf.handler.js';
import { getNfHtml } from '../webviews/nf.template.js';

const NF_VIEW_TYPE = 'pollis.nf';
const NF_TITLE = 'Normalising Flows';

const NF_METADATA: INfMetadata = {
	nf: {
		packages: [
			{
				name: 'Flux.jl',
				github: 'https://github.com/FluxML/Flux.jl',
				papers: [
					{ title: 'Density Estimation Using Real-valued Non-Volume Preserving (Real NVP) Transformations', authors: 'Dinh, L. et al.', year: 2017, url: 'https://arxiv.org/abs/1605.08803', openAccess: true },
					{ title: 'Masked Autoregressive Flow for Density Estimation', authors: 'Papamakarios, G. et al.', year: 2017, url: 'https://arxiv.org/abs/1705.07057', openAccess: true },
					{ title: 'Neural Spline Flows', authors: 'Durkan, C. et al.', year: 2019, url: 'https://arxiv.org/abs/1906.04032', openAccess: true },
				],
			},
			{
				name: 'Bijectors.jl',
				github: 'https://github.com/TuringLang/Bijectors.jl',
				papers: [],
			},
		],
		notebooks: [
			{ name: 'RealNVP',              file: 'nf/tutorial-01-realnvp.ipynb',   bundled: true, description: 'Affine coupling layers for multivariate density estimation with Flux.jl' },
			{ name: 'MAF',                  file: 'nf/tutorial-02-maf.ipynb',        bundled: true, description: 'Masked Autoregressive Flow: sequential density estimation via MADE networks' },
			{ name: 'Neural Spline Flow',   file: 'nf/tutorial-03-nsf.ipynb',        bundled: true, description: 'Rational-quadratic spline coupling layers for expressive bijections' },
			{ name: 'Copula Estimation',    file: 'nf/tutorial-04-copula.ipynb',     bundled: true, description: 'PIT preprocessing + normalising flow to estimate a copula density' },
		],
		wikis: [
			{ name: 'Overview',             file: 'nf/overview.md',           bundled: true },
			{ name: 'Factsheet',            file: 'nf/factsheet.md',          bundled: true },
			{ name: 'Assumptions',          file: 'nf/assumptions.md',        bundled: true },
			{ name: 'Diagnostics',          file: 'nf/diagnostics.md',        bundled: true },
			{ name: 'Interpretation',       file: 'nf/interpretation.md',     bundled: true },
			{ name: 'Decision Guide',       file: 'nf/decision-guide.md',     bundled: true },
			{ name: 'RealNVP',              file: 'nf/realnvp.md',            bundled: true },
			{ name: 'MAF',                  file: 'nf/maf.md',                bundled: true },
			{ name: 'Neural Spline Flows',  file: 'nf/nsf.md',                bundled: true },
			{ name: 'Copula Estimation',    file: 'nf/copula.md',             bundled: true },
		],
		tooltips: {
			input_dim:   'Dimensionality of the input random vector x. Each dimension is treated as a separate variable; the flow learns the full joint density p(x₁, …, x_D).',
			num_flows:   'Number of stacked bijective transformations (coupling or autoregressive layers). More layers increase expressiveness but add compute. Typical range: 4–16.',
			hidden_size: 'Width of the conditioner networks inside each flow step. Controls how rich the learned scale-and-shift (or spline) parameters are. Typical range: 64–512.',
			num_layers:  'Depth of each conditioner network. Deeper conditioners can learn more complex dependencies between dimensions. Typical range: 2–4.',
			dropout:     'Dropout probability applied inside conditioner networks. Regularises deep conditioners. Set to 0 to disable. Typical range: 0.0–0.2.',
			num_bins:    'Number of spline segments K in each Neural Spline Flow coupling layer. More bins give a finer piecewise approximation at the cost of more parameters. Typical range: 4–16.',
		},
	},
};

export function openNfWebview(
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
			title: NF_TITLE,
			options: { retainContextWhenHidden: true },
			contentOptions: { allowScripts: true },
			extension: undefined,
		},
		NF_VIEW_TYPE,
		NF_TITLE,
		undefined,
		{ group: undefined, preserveFocus: false }
	);

	webviewInput.webview.setHtml(getNfHtml());

	registerNfWebviewHandlers(
		webviewInput,
		NF_METADATA,
		openerService,
		editorService,
		quickInputService,
		commandService,
		clipboardService,
		notificationService,
	);
}
