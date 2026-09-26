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
import { IDtMetadata } from '../common/dt.types.js';
import { registerDtWebviewHandlers } from '../handlers/dt.handler.js';
import { getDtHtml } from '../webviews/dt.template.js';

const DT_VIEW_TYPE = 'pollis.dt';
const DT_TITLE = 'Decision Tree Models';

const DT_METADATA: IDtMetadata = {
	dt: {
		packages: [
			{ name: 'DecisionTree.jl',      github: 'https://github.com/bensadeghi/DecisionTree.jl',       papers: [] },
			{ name: 'ModalDecisionTrees.jl', github: 'https://github.com/aclai-lab/ModalDecisionTrees.jl',  papers: [] },
		],
		notebooks: [
			{ name: 'Decision Tree Basics',    file: 'dt/tutorial-01-basics.ipynb',    bundled: true, description: 'Fitting and interpreting decision trees with DecisionTree.jl' },
			{ name: 'Modal Decision Trees',    file: 'dt/tutorial-02-modal.ipynb',     bundled: true, description: 'Modal logic extensions for structured and relational data' },
		],
		wikis: [
			{ name: 'Overview',       file: 'dt/overview.md',       bundled: true },
			{ name: 'Factsheet',      file: 'dt/factsheet.md',       bundled: true },
			{ name: 'Assumptions',    file: 'dt/assumptions.md',     bundled: true },
			{ name: 'Diagnostics',    file: 'dt/diagnostics.md',     bundled: true },
			{ name: 'Interpretation', file: 'dt/interpretation.md',  bundled: true },
			{ name: 'Decision Guide', file: 'dt/decision-guide.md',  bundled: true },
		],
		tooltips: {
			max_depth: 'Maximum depth of the tree. Use -1 for unlimited growth. Shallow trees (depth 3–7) generalise better; very deep trees tend to overfit. Default 5.',
			min_samples_leaf: 'Minimum number of training samples required in a leaf node. Higher values produce simpler, more robust trees. Default 1.',
			task: 'Classification predicts a discrete class label using Gini impurity or entropy. Regression predicts a continuous value by minimising mean squared error.',
		},
	},
};

export function openDtWebview(
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
			title: DT_TITLE,
			options: { retainContextWhenHidden: true },
			contentOptions: { allowScripts: true },
			extension: undefined,
		},
		DT_VIEW_TYPE,
		DT_TITLE,
		undefined,
		{ group: undefined, preserveFocus: false }
	);

	webviewInput.webview.setHtml(getDtHtml());

	registerDtWebviewHandlers(
		webviewInput,
		DT_METADATA,
		openerService,
		editorService,
		quickInputService,
		commandService,
		clipboardService,
		notificationService,
		initialModel,
	);
}
