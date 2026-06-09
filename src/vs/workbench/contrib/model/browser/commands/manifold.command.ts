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
import { IManifoldMetadata } from '../common/manifold.types.js';
import { registerManifoldWebviewHandlers } from '../handlers/manifold.handler.js';
import { getManifoldHtml } from '../webviews/manifold.template.js';

const MANIFOLD_VIEW_TYPE = 'pollis.manifold';
const MANIFOLD_TITLE = 'Manifold Learning';

const MANIFOLD_METADATA: IManifoldMetadata = {
	manifold: {
		packages: [
			{
				name: 'ManifoldLearning.jl',
				github: 'https://github.com/wildart/ManifoldLearning.jl',
				papers: [
					{ title: 'A Global Geometric Framework for Nonlinear Dimensionality Reduction', authors: 'Tenenbaum, J.B., de Silva, V. & Langford, J.C.', year: 2000, url: 'https://science.sciencemag.org/content/290/5500/2319', openAccess: false },
					{ title: 'Nonlinear Dimensionality Reduction by Locally Linear Embedding', authors: 'Roweis, S.T. & Saul, L.K.', year: 2000, url: 'https://science.sciencemag.org/content/290/5500/2323', openAccess: false },
					{ title: 'Diffusion Maps', authors: 'Coifman, R.R. & Lafon, S.', year: 2006, url: 'https://doi.org/10.1016/j.acha.2006.04.006', openAccess: false },
				],
			},
		],
		notebooks: [
			{ name: 'ISOmap', file: 'dim-reduction-manifold/tutorial-01-isomap.ipynb', bundled: true, description: 'Geodesic distance embedding with ISOmap — k-NN graph, MDS projection, and visualisation' },
			{ name: 'LLE', file: 'dim-reduction-manifold/tutorial-02-lle.ipynb', bundled: true, description: 'Locally Linear Embedding — reconstruction weights and low-dimensional preservation' },
			{ name: 'Diffusion Maps', file: 'dim-reduction-manifold/tutorial-03-diffusion-maps.ipynb', bundled: true, description: 'Diffusion operator eigenvectors — bandwidth, diffusion time, and spectral embedding' },
		],
		wikis: [
			{ name: 'Overview', file: 'dim-reduction-manifold/overview.md', bundled: true },
			{ name: 'Factsheet', file: 'dim-reduction-manifold/factsheet.md', bundled: true },
			{ name: 'ISOmap', file: 'dim-reduction-manifold/isomap.md', bundled: true },
			{ name: 'LLE', file: 'dim-reduction-manifold/lle.md', bundled: true },
			{ name: 'Diffusion Maps', file: 'dim-reduction-manifold/diffusion-maps.md', bundled: true },
		],
	},
};

export function openManifoldWebview(
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
			title: MANIFOLD_TITLE,
			options: { retainContextWhenHidden: true },
			contentOptions: { allowScripts: true },
			extension: undefined,
		},
		MANIFOLD_VIEW_TYPE,
		MANIFOLD_TITLE,
		undefined,
		{ group: undefined, preserveFocus: false }
	);

	webviewInput.webview.setHtml(getManifoldHtml());

	registerManifoldWebviewHandlers(
		webviewInput,
		MANIFOLD_METADATA,
		openerService,
		editorService,
		quickInputService,
		commandService,
		clipboardService,
		notificationService,
		initialModel,
	);
}
