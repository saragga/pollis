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
import { IDcoMetadata } from '../common/dco.types.js';
import { IModelReference, IModelNotebookSection } from '../common/model.types.js';
import { registerDcoWebviewHandlers } from '../handlers/dco.handler.js';
import { getDcoHtml } from '../webviews/dco.template.js';

const DCO_VIEW_TYPE = 'pollis.dco';
const DCO_TITLE = 'Discrete and Combinatorial Optimisation';

const DCO_REFERENCES: IModelReference[] = [
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
		title: 'Metaheuristics: From Design to Implementation',
		authors: 'Talbi, El-Ghazali',
		year: 2009,
		journal: 'Wiley',
		doi: '10.1002/9780470496916',
		openAccess: false,
	},
	{
		title: 'Handbook of Metaheuristics',
		authors: 'Gendreau, Michel; Potvin, Jean-Yves (eds.)',
		year: 2019,
		journal: 'Springer (3rd ed.)',
		openAccess: false,
	},
	{ separator: true, label: 'Original Papers' },
	{
		title: 'Greedy Randomized Adaptive Search Procedures',
		authors: 'Feo, Thomas A.; Resende, Mauricio G. C.',
		year: 1995,
		journal: 'Journal of Global Optimization',
		doi: '10.1007/BF01096763',
		openAccess: false,
	},
	{
		title: 'Variable Neighborhood Search',
		authors: 'Mladen&#769;ovic&#769;, Nenad; Hansen, Pierre',
		year: 1997,
		journal: 'Computers and Operations Research',
		doi: '10.1016/S0305-0548(97)00031-2',
		openAccess: false,
	},
	{
		title: 'Variable Neighbourhood Search: Principles and Applications',
		authors: 'Hansen, Pierre; Mladen&#769;ovic&#769;, Nenad',
		year: 2001,
		journal: 'European Journal of Operational Research',
		doi: '10.1016/S0377-2217(00)00100-4',
		openAccess: false,
	},
];

export const DCO_NOTEBOOK_SECTIONS: IModelNotebookSection[] = [
	{
		label: '',
		notebooks: [
			{
				name: 'GRASP',
				file: 'dco/tutorial-01-grasp.ipynb',
				bundled: true,
				description: 'Greedy randomised adaptive search: construction phase with restricted candidate list and local search',
			},
			{
				name: 'VND',
				file: 'dco/tutorial-02-vnd.ipynb',
				bundled: true,
				description: 'Variable neighbourhood descent: systematic cycling through neighbourhood structures until no improvement',
			},
			{
				name: 'VNS',
				file: 'dco/tutorial-03-vns.ipynb',
				bundled: true,
				description: 'Variable neighbourhood search: shaking perturbation + VND descent to escape local optima',
			},
		],
	},
];

const DCO_METADATA: IDcoMetadata = {
	dco: {
		packages: [
			{
				name: 'MHLib.jl',
				github: 'https://github.com/ac-tuwien/MHLib.jl',
				papers: [],
			},
		],
		notebookSections: DCO_NOTEBOOK_SECTIONS,
		notebooks: DCO_NOTEBOOK_SECTIONS.flatMap(s => s.notebooks),
		wikis: [
			{ name: 'Factsheet',      file: 'dco/factsheet.md',      bundled: true },
			{ name: 'Overview',       file: 'dco/overview.md',        bundled: true },
			{ name: 'Assumptions',    file: 'dco/assumptions.md',     bundled: true },
			{ name: 'Diagnostics',    file: 'dco/diagnostics.md',     bundled: true },
			{ name: 'Interpretation', file: 'dco/interpretation.md',  bundled: true },
			{ name: 'Decision Guide', file: 'dco/decision-guide.md',  bundled: true },
			{ separator: true, label: 'Algorithm Details' },
			{ name: 'GRASP', file: 'dco/grasp.md', bundled: true },
			{ name: 'VND',   file: 'dco/vnd.md',   bundled: true },
			{ name: 'VNS',   file: 'dco/vns.md',   bundled: true },
		],
		references: DCO_REFERENCES,
	},
};

export function openDcoWebview(
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
			title: DCO_TITLE,
			options: { retainContextWhenHidden: true },
			contentOptions: { allowScripts: true },
			extension: undefined,
		},
		DCO_VIEW_TYPE,
		DCO_TITLE,
		undefined,
		{ group: undefined, preserveFocus: false }
	);

	webviewInput.webview.setHtml(getDcoHtml());

	registerDcoWebviewHandlers(
		webviewInput,
		DCO_METADATA,
		openerService,
		editorService,
		quickInputService,
		commandService,
		clipboardService,
		notificationService,
		initialModel,
	);
}
