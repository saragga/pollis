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
import { IEmbeddingMetadata } from '../common/embedding.types.js';
import { registerEmbeddingWebviewHandlers } from '../handlers/embedding.handler.js';
import { getEmbeddingHtml } from '../webviews/embedding.template.js';

const EMBEDDING_VIEW_TYPE = 'pollis.embedding';
const EMBEDDING_TITLE = 'Neighbour Embedding';

const EMBEDDING_METADATA: IEmbeddingMetadata = {
	embedding: {
		packages: [
			{
				name: 'TSne.jl',
				github: 'https://github.com/lejon/TSne.jl',
				papers: [
					{ title: 'Visualizing Data using t-SNE', authors: 'van der Maaten, L. & Hinton, G.', year: 2008, url: 'https://jmlr.org/papers/v9/vandermaaten08a.html', openAccess: true },
				],
			},
			{
				name: 'UMAP.jl',
				github: 'https://github.com/dillondaudert/UMAP.jl',
				papers: [
					{ title: 'UMAP: Uniform Manifold Approximation and Projection for Dimension Reduction', authors: 'McInnes, L., Healy, J. & Melville, J.', year: 2018, url: 'https://arxiv.org/abs/1802.03426', openAccess: true },
				],
			},
		],
		notebooks: [
			{ name: 't-SNE', file: 'dim-reduction-embedding/tutorial-01-tsne.ipynb', bundled: true, description: 't-SNE with TSne.jl — perplexity, learning rate, and 2-D/3-D neighbourhood embedding' },
			{ name: 'UMAP', file: 'dim-reduction-embedding/tutorial-02-umap.ipynb', bundled: true, description: 'UMAP with UMAP.jl — n_neighbors, min_dist, and topology-preserving embedding' },
		],
		wikis: [
			{ name: 'Overview', file: 'dim-reduction-embedding/overview.md', bundled: true },
			{ name: 'Factsheet', file: 'dim-reduction-embedding/factsheet.md', bundled: true },
			{ name: 't-SNE', file: 'dim-reduction-embedding/tsne.md', bundled: true },
			{ name: 'UMAP', file: 'dim-reduction-embedding/umap.md', bundled: true },
		],
	},
};

export function openEmbeddingWebview(
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
			title: EMBEDDING_TITLE,
			options: { retainContextWhenHidden: true },
			contentOptions: { allowScripts: true },
			extension: undefined,
		},
		EMBEDDING_VIEW_TYPE,
		EMBEDDING_TITLE,
		undefined,
		{ group: undefined, preserveFocus: false }
	);

	webviewInput.webview.setHtml(getEmbeddingHtml());

	registerEmbeddingWebviewHandlers(
		webviewInput,
		EMBEDDING_METADATA,
		openerService,
		editorService,
		quickInputService,
		commandService,
		clipboardService,
		notificationService,
		initialModel,
	);
}
