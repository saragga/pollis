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
import { IModelReference, IModelNotebookSection } from '../common/model.types.js';
import { ISboMetadata } from '../common/sbo.types.js';
import { registerSboWebviewHandlers } from '../handlers/sbo.handler.js';
import { getSboHtml } from '../webviews/sbo.template.js';

const SBO_VIEW_TYPE = 'pollis.sbo';
const SBO_TITLE = 'Surrogate-Based Optimisation';

const SBO_REFERENCES: IModelReference[] = [
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
		title: 'Engineering Design via Surrogate Modelling: A Practical Guide',
		authors: 'Forrester, Alexander I.J.; Sobester, Andras; Keane, Andy J.',
		year: 2008,
		journal: 'Wiley',
		openAccess: false,
	},
	{ separator: true, label: 'Original Papers' },
	{
		title: 'Design and Analysis of Computer Experiments',
		authors: 'Sacks, Jerome; Welch, William J.; Mitchell, Toby J.; Wynn, Henry P.',
		year: 1989,
		journal: 'Statistical Science',
		openAccess: false,
	},
	{
		title: 'A Taxonomy of Global Optimization Methods Based on Response Surfaces',
		authors: 'Jones, Donald R.',
		year: 2001,
		journal: 'Journal of Global Optimization',
		openAccess: false,
	},
];

export const SBO_NOTEBOOK_SECTIONS: IModelNotebookSection[] = [
	{
		label: '',
		notebooks: [
			{
				name: 'Response Surface Methods',
				file: 'sbo/tutorial-01-rsm.ipynb',
				bundled: true,
				description: 'Polynomial response surface fitted to sample data; minimised directly; interpretable for low-dimensional smooth problems',
			},
			{
				name: 'Kriging',
				file: 'sbo/tutorial-02-kriging.ipynb',
				bundled: true,
				description: 'GP interpolant from geostatistics; provides uncertainty estimates; used with EI or LCBS acquisition; suited to expensive black-box problems',
			},
			{
				name: 'Radial Basis Functions',
				file: 'sbo/tutorial-03-rbf.ipynb',
				bundled: true,
				description: 'Exact interpolant using radial basis functions; no uncertainty estimate; flexible kernel choice; scales to higher dimensions',
			},
		],
	},
];

const SBO_METADATA: ISboMetadata = {
	sbo: {
		packages: [
			{
				name: 'Surrogates.jl',
				github: 'https://github.com/SciML/Surrogates.jl',
				papers: [],
			},
		],
		notebookSections: SBO_NOTEBOOK_SECTIONS,
		notebooks: SBO_NOTEBOOK_SECTIONS.flatMap(s => s.notebooks),
		wikis: [
			{ name: 'Factsheet',      file: 'sbo/factsheet.md',      bundled: true },
			{ name: 'Overview',       file: 'sbo/overview.md',        bundled: true },
			{ name: 'Assumptions',    file: 'sbo/assumptions.md',     bundled: true },
			{ name: 'Diagnostics',    file: 'sbo/diagnostics.md',     bundled: true },
			{ name: 'Interpretation', file: 'sbo/interpretation.md',  bundled: true },
			{ name: 'Decision Guide', file: 'sbo/decision-guide.md',  bundled: true },
			{ separator: true, label: 'Surrogates' },
			{ name: 'Response Surface Methods', file: 'sbo/rsm.md',     bundled: true },
			{ name: 'Kriging',                  file: 'sbo/kriging.md', bundled: true },
			{ name: 'Radial Basis Functions',   file: 'sbo/rbf.md',     bundled: true },
		],
		references: SBO_REFERENCES,
	},
};

export function openSboWebview(
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
			title: SBO_TITLE,
			options: { retainContextWhenHidden: true },
			contentOptions: { allowScripts: true },
			extension: undefined,
		},
		SBO_VIEW_TYPE,
		SBO_TITLE,
		undefined,
		{ group: undefined, preserveFocus: false }
	);

	webviewInput.webview.setHtml(getSboHtml());

	registerSboWebviewHandlers(
		webviewInput,
		SBO_METADATA,
		openerService,
		editorService,
		quickInputService,
		commandService,
		clipboardService,
		notificationService,
		initialModel,
	);
}
