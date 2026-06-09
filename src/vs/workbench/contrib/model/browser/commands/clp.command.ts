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
import { IClpMetadata } from '../common/clp.types.js';
import { registerClpWebviewHandlers } from '../handlers/clp.handler.js';
import { getClpHtml } from '../webviews/clp.template.js';

const CLP_VIEW_TYPE = 'pollis.clp';
const CLP_TITLE = 'Partitional & Density Clustering';

const CLP_METADATA: IClpMetadata = {
	clp: {
		packages: [
			{
				name: 'Clustering.jl',
				github: 'https://github.com/JuliaStats/Clustering.jl',
				papers: [
					{ title: 'A Density-Based Algorithm for Discovering Clusters in Large Spatial Databases with Noise', authors: 'Ester, M., Kriegel, H.P., Sander, J. & Xu, X.', year: 1996, url: 'https://www.dbs.ifi.lmu.de/Publikationen/Papers/KDD-96.final.frame.pdf', openAccess: true },
				],
			},
			{
				name: 'BetaML.jl',
				github: 'https://github.com/sylvaticus/BetaML.jl',
				papers: [
					{ title: 'BetaML: The Beta Machine Learning Toolkit, a Self-Contained Repository of Machine Learning Algorithms in Julia', authors: 'Lobianco, A.', year: 2021, url: 'https://doi.org/10.21105/joss.02849', openAccess: true },
				],
			},
			{
				name: 'ShapML.jl',
				github: 'https://github.com/nredell/ShapML.jl',
				papers: [
					{ title: 'A Unified Approach to Interpreting Model Predictions', authors: 'Lundberg, S.M. & Lee, S.I.', year: 2017, url: 'https://arxiv.org/abs/1705.07874', openAccess: true },
				],
			},
			{
				name: 'CounterfactualExplanations.jl',
				github: 'https://github.com/JuliaTrustworthyAI/CounterfactualExplanations.jl',
				papers: [
					{ title: 'Explaining Black-Box Models through Counterfactuals', authors: 'Altmeyer, P., van der Blom, I., Daxberger, E. & Martens, D.', year: 2023, url: 'https://arxiv.org/abs/2212.07466', openAccess: true },
				],
			},
		],
		notebooks: [
			{ name: 'K-Means',                  file: 'cluster-partitional/tutorial-01-kmeans.ipynb',   bundled: true, description: 'K-Means clustering with Clustering.jl — choosing k, convergence, and visualisation' },
			{ name: 'K-Medoids',                file: 'cluster-partitional/tutorial-02-kmedoids.ipynb', bundled: true, description: 'K-Medoids for robust clustering on distance matrices with Clustering.jl' },
			{ name: 'Fuzzy C-Means',            file: 'cluster-partitional/tutorial-03-fcm.ipynb',      bundled: true, description: 'Soft cluster memberships with Fuzzy C-Means — fuzziness parameter and stability' },
			{ name: 'DBSCAN',                   file: 'cluster-partitional/tutorial-04-dbscan.ipynb',   bundled: true, description: 'Density-based clustering with DBSCAN — ε, min_pts, and noise detection' },
			{ name: 'Gaussian Mixture Models',  file: 'cluster-partitional/tutorial-05-gmm.ipynb',      bundled: true, description: 'Probabilistic clustering with GMM — EM algorithm and soft assignments via BetaML.jl' },
			{ name: 'Spectral Clustering',       file: 'cluster-partitional/tutorial-06-spectral.ipynb', bundled: true, description: 'Graph Laplacian spectral embedding followed by k-means for non-convex cluster shapes' },
		],
		wikis: [
			{ name: 'Overview',                file: 'cluster-partitional/overview.md',         bundled: true },
			{ name: 'Factsheet',               file: 'cluster-partitional/factsheet.md',        bundled: true },
			{ name: 'Assumptions',             file: 'cluster-partitional/assumptions.md',      bundled: true },
			{ name: 'Diagnostics',             file: 'cluster-partitional/diagnostics.md',      bundled: true },
			{ name: 'Interpretation',          file: 'cluster-partitional/interpretation.md',   bundled: true },
			{ name: 'Decision Guide',          file: 'cluster-partitional/decision-guide.md',   bundled: true },
			{ name: 'K-Means',                 file: 'cluster-partitional/kmeans.md',           bundled: true },
			{ name: 'K-Medoids',               file: 'cluster-partitional/kmedoids.md',         bundled: true },
			{ name: 'Fuzzy C-Means',           file: 'cluster-partitional/fuzzy-cmeans.md',     bundled: true },
			{ name: 'DBSCAN',                  file: 'cluster-partitional/dbscan.md',           bundled: true },
			{ name: 'Gaussian Mixture Models', file: 'cluster-partitional/gmm.md',              bundled: true },
			{ name: 'Spectral Clustering',     file: 'cluster-partitional/spectral.md',         bundled: true },
			{ name: 'Cluster Evaluation',      file: 'cluster-partitional/cluster-evaluation.md', bundled: true },
		],
	},
};

export function openClpWebview(
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
			title: CLP_TITLE,
			options: { retainContextWhenHidden: true },
			contentOptions: { allowScripts: true },
			extension: undefined,
		},
		CLP_VIEW_TYPE,
		CLP_TITLE,
		undefined,
		{ group: undefined, preserveFocus: false }
	);

	webviewInput.webview.setHtml(getClpHtml());

	registerClpWebviewHandlers(
		webviewInput,
		CLP_METADATA,
		openerService,
		editorService,
		quickInputService,
		commandService,
		clipboardService,
		notificationService,
		initialModel,
	);
}
