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
import { IAutoencoderMetadata } from '../common/autoencoder.types.js';
import { registerAutoencoderWebviewHandlers } from '../handlers/autoencoder.handler.js';
import { getAutoencoderHtml } from '../webviews/autoencoder.template.js';

const AUTOENCODER_VIEW_TYPE = 'pollis.autoencoder';
const AUTOENCODER_TITLE = 'Autoencoders';

const AUTOENCODER_METADATA: IAutoencoderMetadata = {
	autoencoder: {
		packages: [
			{
				name: 'Flux.jl',
				github: 'https://github.com/FluxML/Flux.jl',
				papers: [],
			},
			{
				name: 'AutoEncoderToolkit.jl',
				github: 'https://github.com/mrazomej/AutoEncoderToolkit.jl',
				papers: [
					{ title: 'Auto-Encoding Variational Bayes', authors: 'Kingma, D.P. & Welling, M.', year: 2013, url: 'https://arxiv.org/abs/1312.6114', openAccess: true },
				],
			},
		],
		notebooks: [
			{ name: 'Autoencoder', file: 'dim-reduction-autoencoder/tutorial-01-ae.ipynb', bundled: true, description: 'Deterministic autoencoder with Flux.jl — architecture, MSE loss, latent space extraction' },
			{ name: 'Variational Autoencoder', file: 'dim-reduction-autoencoder/tutorial-02-vae.ipynb', bundled: true, description: 'VAE with reparametrisation trick — ELBO loss, &#946;-VAE, and latent traversal' },
		],
		wikis: [
			{ name: 'Overview', file: 'dim-reduction-autoencoder/overview.md', bundled: true },
			{ name: 'Factsheet', file: 'dim-reduction-autoencoder/factsheet.md', bundled: true },
			{ name: 'Autoencoder', file: 'dim-reduction-autoencoder/ae.md', bundled: true },
			{ name: 'Variational Autoencoder', file: 'dim-reduction-autoencoder/vae.md', bundled: true },
		],
	},
};

export function openAutoencoderWebview(
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
			title: AUTOENCODER_TITLE,
			options: { retainContextWhenHidden: true },
			contentOptions: { allowScripts: true },
			extension: undefined,
		},
		AUTOENCODER_VIEW_TYPE,
		AUTOENCODER_TITLE,
		undefined,
		{ group: undefined, preserveFocus: false }
	);

	webviewInput.webview.setHtml(getAutoencoderHtml());

	registerAutoencoderWebviewHandlers(
		webviewInput,
		AUTOENCODER_METADATA,
		openerService,
		editorService,
		quickInputService,
		commandService,
		clipboardService,
		notificationService,
		initialModel,
	);
}
