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
import { IDgoMetadata } from '../common/dgo.types.js';
import { IModelReference, IModelNotebookSection } from '../common/model.types.js';
import { registerDgoWebviewHandlers } from '../handlers/dgo.handler.js';
import { getDgoHtml } from '../webviews/dgo.template.js';

const DGO_VIEW_TYPE = 'pollis.dgo';
const DGO_TITLE = 'Deterministic Global Methods';

const DGO_REFERENCES: IModelReference[] = [
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
		title: 'Introduction to Global Optimization',
		authors: 'Neumaier, Arnold',
		year: 2004,
		journal: 'Cambridge University Press',
		doi: '10.1017/CBO9780511569029',
		openAccess: false,
	},
	{
		title: 'Deterministic Global Optimization',
		authors: 'Floudas, Christodoulos A.',
		year: 2000,
		journal: 'Springer',
		doi: '10.1007/978-1-4757-4949-6',
		openAccess: false,
	},
	{ separator: true, label: 'Original Papers' },
	{
		title: 'Lipschitzian Optimization Without the Lipschitz Constant',
		authors: 'Jones, Donald R.; Perttunen, Cary D.; Stuckman, Bruce E.',
		year: 1993,
		journal: 'Journal of Optimization Theory and Applications',
		doi: '10.1007/BF00941892',
		openAccess: false,
	},
	{
		title: 'A Locally-Biased Form of the DIRECT Algorithm',
		authors: 'Gablonsky, Joerg M.; Kelley, Carl T.',
		year: 2001,
		journal: 'Journal of Global Optimization',
		doi: '10.1023/A:1017930332101',
		openAccess: false,
	},
];

export const DGO_NOTEBOOK_SECTIONS: IModelNotebookSection[] = [
	{
		label: '',
		notebooks: [
			{
				name: 'DIRECT Methods',
				file: 'dgo/tutorial-01-direct.ipynb',
				bundled: true,
				description: 'DIRECT and DIRECT-L with NLopt.jl: setup, bounds, and convergence analysis',
			},
			{
				name: 'QuadDirect',
				file: 'dgo/tutorial-03-quaddirect.ipynb',
				bundled: true,
				description: 'QuadDIRECT.jl: quadratic interpolation-based global search with fewer evaluations',
			},
		],
	},
];

const DGO_METADATA: IDgoMetadata = {
	dgo: {
		packages: [
			{
				name: 'NLopt.jl',
				github: 'https://github.com/JuliaOpt/NLopt.jl',
				papers: [],
			},
			{
				name: 'QuadDIRECT.jl',
				github: 'https://github.com/timholy/QuadDIRECT.jl',
				papers: [],
			},
		],
		notebookSections: DGO_NOTEBOOK_SECTIONS,
		notebooks: DGO_NOTEBOOK_SECTIONS.flatMap(s => s.notebooks),
		wikis: [
			{ name: 'Factsheet',      file: 'dgo/factsheet.md',      bundled: true },
			{ name: 'Overview',       file: 'dgo/overview.md',        bundled: true },
			{ name: 'Assumptions',    file: 'dgo/assumptions.md',     bundled: true },
			{ name: 'Diagnostics',    file: 'dgo/diagnostics.md',     bundled: true },
			{ name: 'Interpretation', file: 'dgo/interpretation.md',  bundled: true },
			{ name: 'Decision Guide', file: 'dgo/decision-guide.md',  bundled: true },
			{ separator: true, label: 'Algorithm Details' },
			{ name: 'DIRECT & DIRECT-L', file: 'dgo/direct.md',      bundled: true },
			{ name: 'QuadDirect',        file: 'dgo/quaddirect.md',   bundled: true },
		],
		references: DGO_REFERENCES,
	},
};

export function openDgoWebview(
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
			title: DGO_TITLE,
			options: { retainContextWhenHidden: true },
			contentOptions: { allowScripts: true },
			extension: undefined,
		},
		DGO_VIEW_TYPE,
		DGO_TITLE,
		undefined,
		{ group: undefined, preserveFocus: false }
	);

	webviewInput.webview.setHtml(getDgoHtml());

	registerDgoWebviewHandlers(
		webviewInput,
		DGO_METADATA,
		openerService,
		editorService,
		quickInputService,
		commandService,
		clipboardService,
		notificationService,
		initialModel,
	);
}
