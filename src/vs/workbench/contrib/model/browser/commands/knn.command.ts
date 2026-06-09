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
import { IKnnMetadata } from '../common/knn.types.js';
import { registerKnnWebviewHandlers } from '../handlers/knn.handler.js';
import { getKnnHtml } from '../webviews/knn.template.js';

const KNN_VIEW_TYPE = 'pollis.knn';
const KNN_TITLE = 'k-Nearest Neighbours';

const KNN_METADATA: IKnnMetadata = {
	knn: {
		packages: [
			{ name: 'NearestNeighbors.jl', github: 'https://github.com/KristofferC/NearestNeighbors.jl', papers: [] },
		],
		notebooks: [
			{ name: 'kNN Basics',        file: 'knn/tutorial-01-basics.ipynb',   bundled: true, description: 'Building and querying KDTree and BallTree with NearestNeighbors.jl' },
			{ name: 'Range Search',      file: 'knn/tutorial-02-range.ipynb',    bundled: true, description: 'Efficient radius queries and inrange search' },
			{ name: 'Large-Scale kNN',   file: 'knn/tutorial-03-scalable.ipynb', bundled: true, description: 'Scaling nearest-neighbour search to large datasets' },
		],
		wikis: [
			{ name: 'Overview',       file: 'knn/overview.md',       bundled: true },
			{ name: 'Factsheet',      file: 'knn/factsheet.md',      bundled: true },
			{ name: 'Assumptions',    file: 'knn/assumptions.md',    bundled: true },
			{ name: 'Diagnostics',    file: 'knn/diagnostics.md',    bundled: true },
			{ name: 'Interpretation', file: 'knn/interpretation.md', bundled: true },
			{ name: 'Decision Guide', file: 'knn/decision-guide.md', bundled: true },
		],
		tooltips: {
			k:         'Number of nearest neighbours to return. Must be ≤ the number of data points. Default 5.',
			r:         'Search radius. All points with distance ≤ r from the query are returned. Default 1.0.',
			leaf_size: 'Minimum number of points in a leaf node. Smaller values produce finer trees with faster queries at the cost of longer build time. Not used by BruteTree. Default 10.',
			tree_type: 'KDTree is fastest for low-dimensional data (d ≤ 20) and supports all Minkowski-family metrics (Euclidean, Manhattan, Chebyshev, Minkowski). BallTree works in any metric space. BruteTree checks every point — best for small datasets.',
			metric:    'All listed metrics are Minkowski-family: Euclidean is L2 (p=2), Manhattan is L1 (p=1), Chebyshev is L∞ (p→∞), Minkowski allows any p ≥ 1. All are compatible with KDTree and BallTree.',
		},
	},
};

export function openKnnWebview(
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
			title: KNN_TITLE,
			options: { retainContextWhenHidden: true },
			contentOptions: { allowScripts: true },
			extension: undefined,
		},
		KNN_VIEW_TYPE,
		KNN_TITLE,
		undefined,
		{ group: undefined, preserveFocus: false }
	);

	webviewInput.webview.setHtml(getKnnHtml());

	registerKnnWebviewHandlers(
		webviewInput,
		KNN_METADATA,
		openerService,
		editorService,
		quickInputService,
		commandService,
		clipboardService,
		notificationService,
	);
}
