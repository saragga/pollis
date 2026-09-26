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
import { ICamMetadata } from '../common/cam.types.js';
import { IModelReference, IModelNotebookSection } from '../common/model.types.js';
import { registerCamWebviewHandlers } from '../handlers/cam.handler.js';
import { getCamHtml } from '../webviews/cam.template.js';

const CAM_VIEW_TYPE = 'pollis.cam';
const CAM_TITLE = 'Curvature-Aware Methods';

const CAM_REFERENCES: IModelReference[] = [
	{ separator: true, label: 'Software' },
	{
		title: 'Julia: A Fresh Approach to Numerical Computing',
		authors: 'Bezanson, Jeff; Edelman, Alan; Karpinski, Stefan; Shah, Viral B.',
		year: 2017,
		journal: 'SIAM Review',
		doi: '10.1137/141000671',
		openAccess: false,
	},
	{ separator: true, label: 'Textbooks' },
	{
		title: 'Numerical Optimization',
		authors: 'Nocedal, Jorge; Wright, Stephen J.',
		year: 2006,
		journal: 'Springer (2nd ed.)',
		doi: '10.1007/978-0-387-40065-5',
		openAccess: false,
	},
	{ separator: true, label: 'Original Papers' },
	{
		title: 'Sophia: A Scalable Stochastic Second-order Optimizer for Language Model Pre-training',
		authors: 'Liu, Hong; Zhu, Zhiyuan; Guo, Jiarui; Jordan, Michael; Liang, Percy; Ma, Tengyu',
		year: 2023,
		journal: 'International Conference on Learning Representations',
		doi: '10.48550/arXiv.2305.14342',
		openAccess: true,
	},
];

export const CAM_NOTEBOOK_SECTIONS: IModelNotebookSection[] = [
	{
		label: '',
		notebooks: [
			{
				name: 'SOPHIA Optimizer',
				file: 'cam/tutorial-01-sophia.ipynb',
				bundled: true,
				description: 'SOPHIA: second-order optimizer with clipped Hessian diagonal estimate via Optimization.jl',
			},
			{
				name: 'SOPHIA vs Adam',
				file: 'cam/tutorial-02-sophia-vs-adam.ipynb',
				bundled: true,
				description: 'Benchmark comparison of SOPHIA and Adam on convex and non-convex objectives',
			},
		],
	},
];

const CAM_METADATA: ICamMetadata = {
	cam: {
		packages: [
			{
				name: 'Optimization.jl',
				github: 'https://github.com/SciML/Optimization.jl',
				papers: [],
			},
		],
		notebookSections: CAM_NOTEBOOK_SECTIONS,
		notebooks: CAM_NOTEBOOK_SECTIONS.flatMap(s => s.notebooks),
		wikis: [
			{ name: 'Factsheet',      file: 'cam/factsheet.md',      bundled: true },
			{ name: 'Overview',       file: 'cam/overview.md',        bundled: true },
			{ name: 'Assumptions',    file: 'cam/assumptions.md',     bundled: true },
			{ name: 'Diagnostics',    file: 'cam/diagnostics.md',     bundled: true },
			{ name: 'Interpretation', file: 'cam/interpretation.md',  bundled: true },
			{ name: 'Decision Guide', file: 'cam/decision-guide.md',  bundled: true },
			{ separator: true, label: 'Algorithm Details' },
			{ name: 'SOPHIA', file: 'cam/sophia.md', bundled: true },
		],
		references: CAM_REFERENCES,
	},
};

export function openCamWebview(
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
			title: CAM_TITLE,
			options: { retainContextWhenHidden: true },
			contentOptions: { allowScripts: true },
			extension: undefined,
		},
		CAM_VIEW_TYPE,
		CAM_TITLE,
		undefined,
		{ group: undefined, preserveFocus: false }
	);

	webviewInput.webview.setHtml(getCamHtml());

	registerCamWebviewHandlers(
		webviewInput,
		CAM_METADATA,
		openerService,
		editorService,
		quickInputService,
		commandService,
		clipboardService,
		notificationService,
		initialModel,
	);
}
