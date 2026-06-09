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
import { IClhMetadata } from '../common/clh.types.js';
import { registerClhWebviewHandlers } from '../handlers/clh.handler.js';
import { getClhHtml } from '../webviews/clh.template.js';

const CLH_VIEW_TYPE = 'pollis.clh';
const CLH_TITLE = 'Hierarchical Clustering';

const CLH_METADATA: IClhMetadata = {
	clh: {
		packages: [
			{
				name: 'Clustering.jl',
				github: 'https://github.com/JuliaStats/Clustering.jl',
				papers: [],
			},
			{
				name: 'Distances.jl',
				github: 'https://github.com/JuliaStats/Distances.jl',
				papers: [],
			},
		],
		notebooks: [
			{ name: 'Hierarchical Clustering',   file: 'cluster-hierarchical/tutorial-01-hclust.ipynb',            bundled: true, description: 'Agglomerative clustering with hclust — linkage methods, dendrogram, and cutree' },
			{ name: 'Linkage Comparison',        file: 'cluster-hierarchical/tutorial-02-linkage-comparison.ipynb', bundled: true, description: 'Comparing Ward, Complete, Average and Single linkage on real datasets' },
		],
		wikis: [
			{ name: 'Overview',               file: 'cluster-hierarchical/overview.md',      bundled: true },
			{ name: 'Factsheet',              file: 'cluster-hierarchical/factsheet.md',     bundled: true },
			{ name: 'Assumptions',            file: 'cluster-hierarchical/assumptions.md',   bundled: true },
			{ name: 'Diagnostics',            file: 'cluster-hierarchical/diagnostics.md',   bundled: true },
			{ name: 'Ward Linkage',           file: 'cluster-hierarchical/ward.md',          bundled: true },
			{ name: 'Complete Linkage',       file: 'cluster-hierarchical/complete.md',      bundled: true },
			{ name: 'Average Linkage',        file: 'cluster-hierarchical/average.md',       bundled: true },
			{ name: 'Single Linkage',         file: 'cluster-hierarchical/single.md',        bundled: true },
			{ name: 'Cophenetic Correlation', file: 'cluster-hierarchical/cophenetic.md',    bundled: true },
		],
	},
};

export function openClhWebview(
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
			title: CLH_TITLE,
			options: { retainContextWhenHidden: true },
			contentOptions: { allowScripts: true },
			extension: undefined,
		},
		CLH_VIEW_TYPE,
		CLH_TITLE,
		undefined,
		{ group: undefined, preserveFocus: false }
	);

	webviewInput.webview.setHtml(getClhHtml());

	registerClhWebviewHandlers(
		webviewInput,
		CLH_METADATA,
		openerService,
		editorService,
		quickInputService,
		commandService,
		clipboardService,
		notificationService,
		initialModel,
	);
}
