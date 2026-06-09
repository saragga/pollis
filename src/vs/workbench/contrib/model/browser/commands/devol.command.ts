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
import { IDevolMetadata } from '../common/devol.types.js';
import { IModelReference, IModelNotebookSection } from '../common/model.types.js';
import { registerDevolWebviewHandlers } from '../handlers/devol.handler.js';
import { getDevolHtml } from '../webviews/devol.template.js';

const DEVOL_VIEW_TYPE = 'pollis.devol';
const DEVOL_TITLE = 'Differential Evolution';

const DEVOL_REFERENCES: IModelReference[] = [
	{ separator: true, label: 'Software' },
	{
		title: 'Julia: A Fresh Approach to Numerical Computing',
		authors: 'Bezanson, Jeff; Edelman, Alan; Karpinski, Stefan; Shah, Viral B.',
		year: 2017,
		journal: 'SIAM Review',
		doi: '10.1137/141000671',
		openAccess: false,
	},
	{
		title: 'Evolutionary.jl: A Julia package for evolutionary algorithms',
		authors: 'Poliak, Art',
		year: 2021,
		journal: 'GitHub',
		doi: '10.5281/zenodo.5781169',
		openAccess: true,
	},
	{ separator: true, label: 'Textbooks' },
	{
		title: 'Differential Evolution: A Practical Approach to Global Optimization',
		authors: 'Price, Kenneth V.; Storn, Rainer M.; Lampinen, Jouni A.',
		year: 2005,
		journal: 'Springer',
		doi: '10.1007/3-540-31306-0',
		openAccess: false,
	},
	{
		title: 'Introduction to Evolutionary Computing',
		authors: 'Eiben, A. E.; Smith, J. E.',
		year: 2015,
		journal: 'Springer',
		doi: '10.1007/978-3-662-44874-8',
		openAccess: false,
	},
	{ separator: true, label: 'Original Papers' },
	{
		title: 'Differential Evolution &#8212; A Simple and Efficient Heuristic for Global Optimization over Continuous Spaces',
		authors: 'Storn, Rainer; Price, Kenneth',
		year: 1997,
		journal: 'Journal of Global Optimization',
		doi: '10.1023/A:1008202821328',
		openAccess: false,
	},
	{
		title: 'JADE: Adaptive Differential Evolution with Optional External Archive',
		authors: 'Zhang, Jingqiao; Sanderson, Arthur C.',
		year: 2009,
		journal: 'IEEE Transactions on Evolutionary Computation',
		doi: '10.1109/TEVC.2009.2014613',
		openAccess: false,
	},
	{
		title: 'Success-History Based Parameter Adaptation for Differential Evolution',
		authors: 'Tanabe, Ryoji; Fukunaga, Alex',
		year: 2013,
		journal: 'IEEE Congress on Evolutionary Computation',
		doi: '10.1109/CEC.2013.6557555',
		openAccess: false,
	},
];

export const DEVOL_NOTEBOOK_SECTIONS: IModelNotebookSection[] = [
	{
		label: '',
		notebooks: [
			{
				name: 'Classic DE',
				file: 'devol/tutorial-01-de.ipynb',
				bundled: true,
				description: 'Classic DE with Evolutionary.jl: strategy, F, Cr, and convergence',
			},
			{
				name: 'Adaptive Variants',
				file: 'devol/tutorial-02-adaptive.ipynb',
				bundled: true,
				description: 'SHADE and Adaptive DE: self-adaptive parameters and archive',
			},
		],
	},
];

const DEVOL_METADATA: IDevolMetadata = {
	devol: {
		packages: [
			{
				name: 'Evolutionary.jl',
				github: 'https://github.com/wildart/Evolutionary.jl',
				papers: [],
			},
		],
		notebookSections: DEVOL_NOTEBOOK_SECTIONS,
		notebooks: DEVOL_NOTEBOOK_SECTIONS.flatMap(s => s.notebooks),
		wikis: [
			{ name: 'Factsheet',      file: 'devol/factsheet.md',      bundled: true },
			{ name: 'Overview',       file: 'devol/overview.md',        bundled: true },
			{ name: 'Assumptions',    file: 'devol/assumptions.md',     bundled: true },
			{ name: 'Diagnostics',    file: 'devol/diagnostics.md',     bundled: true },
			{ name: 'Interpretation', file: 'devol/interpretation.md',  bundled: true },
			{ name: 'Decision Guide', file: 'devol/decision-guide.md',  bundled: true },
			{ separator: true, label: 'Algorithm Details' },
			{ name: 'Classic DE',   file: 'devol/de.md',          bundled: true },
			{ name: 'SHADE',        file: 'devol/shade.md',       bundled: true },
			{ name: 'Adaptive DE',  file: 'devol/adaptive-de.md', bundled: true },
		],
		references: DEVOL_REFERENCES,
	},
};

export function openDevolWebview(
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
			title: DEVOL_TITLE,
			options: { retainContextWhenHidden: true },
			contentOptions: { allowScripts: true },
			extension: undefined,
		},
		DEVOL_VIEW_TYPE,
		DEVOL_TITLE,
		undefined,
		{ group: undefined, preserveFocus: false }
	);

	webviewInput.webview.setHtml(getDevolHtml());

	registerDevolWebviewHandlers(
		webviewInput,
		DEVOL_METADATA,
		openerService,
		editorService,
		quickInputService,
		commandService,
		clipboardService,
		notificationService,
		initialModel,
	);
}
