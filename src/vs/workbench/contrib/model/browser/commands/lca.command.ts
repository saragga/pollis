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
import { ILcaMetadata } from '../common/lca.types.js';
import { registerLcaWebviewHandlers } from '../handlers/lca.handler.js';
import { getLcaHtml } from '../webviews/lca.template.js';

const LCA_VIEW_TYPE = 'pollis.lca';
const LCA_TITLE = 'Latent Component Analysis';

const LCA_METADATA: ILcaMetadata = {
	lca: {
		packages: [
			{
				name: 'MultivariateStats.jl',
				github: 'https://github.com/JuliaStats/MultivariateStats.jl',
				papers: [
					{ title: 'Analysis of a Complex of Statistical Variables into Principal Components', authors: 'Hotelling, H.', year: 1933, url: 'https://doi.org/10.1037/h0071325', openAccess: false },
					{ title: 'Kernel Principal Component Analysis', authors: 'Schölkopf, B., Smola, A. & Müller, K.-R.', year: 1998, url: 'https://doi.org/10.1162/089976698300017467', openAccess: false },
					{ title: 'EM Algorithms for ML Factor Analysis', authors: 'Rubin, D.B. & Thayer, D.T.', year: 1982, url: 'https://doi.org/10.1007/BF02294360', openAccess: false },
				],
			},
		],
		notebooks: [
			{ name: 'PCA', file: 'dim-reduction-lca/tutorial-01-pca.ipynb', bundled: true, description: 'Principal Component Analysis — eigendecomposition, scree plot, and score visualisation' },
			{ name: 'Kernel PCA', file: 'dim-reduction-lca/tutorial-02-kpca.ipynb', bundled: true, description: 'Kernel PCA with RBF kernel — centred Gram matrix, nonlinear embedding, and bandwidth selection' },
			{ name: 'Factor Analysis', file: 'dim-reduction-lca/tutorial-03-fa.ipynb', bundled: true, description: 'Factor Analysis — EM estimation of loadings and uniquenesses, scree and loading heatmap' },
		],
		wikis: [
			{ name: 'Overview', file: 'dim-reduction-lca/overview.md', bundled: true },
			{ name: 'Factsheet', file: 'dim-reduction-lca/factsheet.md', bundled: true },
			{ name: 'PCA', file: 'dim-reduction-lca/pca.md', bundled: true },
			{ name: 'Kernel PCA', file: 'dim-reduction-lca/kpca.md', bundled: true },
			{ name: 'Factor Analysis', file: 'dim-reduction-lca/fa.md', bundled: true },
		],
	},
};

export function openLcaWebview(
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
			title: LCA_TITLE,
			options: { retainContextWhenHidden: true },
			contentOptions: { allowScripts: true },
			extension: undefined,
		},
		LCA_VIEW_TYPE,
		LCA_TITLE,
		undefined,
		{ group: undefined, preserveFocus: false }
	);

	webviewInput.webview.setHtml(getLcaHtml());

	registerLcaWebviewHandlers(
		webviewInput,
		LCA_METADATA,
		openerService,
		editorService,
		quickInputService,
		commandService,
		clipboardService,
		notificationService,
		initialModel,
	);
}
