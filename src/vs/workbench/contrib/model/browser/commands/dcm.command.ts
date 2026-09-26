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
import { IModelReference, IModelNotebookSection } from '../common/model.types.js';
import { IDcmMetadata } from '../common/dcm.types.js';
import { registerDcmWebviewHandlers } from '../handlers/dcm.handler.js';
import { getDcmHtml } from '../webviews/dcm.template.js';

const DCM_VIEW_TYPE = 'pollis.dcm';
const DCM_TITLE = 'Decomposition and Constrained Multi-Objective Optimisation';

const DCM_REFERENCES: IModelReference[] = [
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
		title: 'Metaheuristics: A Julia Package for Single- and Multi-Objective Optimization',
		authors: 'Mejia-de-Dios, Jesus-Adolfo; Mezura-Montes, Efren',
		year: 2022,
		journal: 'Journal of Open Source Software',
		doi: '10.21105/joss.04723',
		openAccess: true,
	},
	{ separator: true, label: 'Textbooks' },
	{
		title: 'Multi-Objective Optimization Using Evolutionary Algorithms',
		authors: 'Deb, Kalyanmoy',
		year: 2001,
		journal: 'Wiley',
		openAccess: false,
	},
	{
		title: 'Evolutionary Algorithms for Solving Multi-Objective Problems',
		authors: 'Coello Coello, Carlos A.; Lamont, Gary B.; Van Veldhuizen, David A.',
		year: 2007,
		journal: 'Springer (2nd ed.)',
		openAccess: false,
	},
	{ separator: true, label: 'Original Papers' },
	{
		title: 'MOEA/D: A Multiobjective Evolutionary Algorithm Based on Decomposition',
		authors: 'Zhang, Qingfu; Li, Hui',
		year: 2007,
		journal: 'IEEE Transactions on Evolutionary Computation',
		doi: '10.1109/TEVC.2007.892759',
		openAccess: false,
	},
	{
		title: 'A Coevolutionary Framework for Constrained Multiobjective Optimization Problems',
		authors: 'Tian, Ye; Zhang, Tao; Xiao, Jianhua; Zhang, Xingyi; Jin, Yaochu',
		year: 2021,
		journal: 'IEEE Transactions on Evolutionary Computation',
		doi: '10.1109/TEVC.2020.3004012',
		openAccess: false,
	},
	{
		title: 'Borg: An Auto-Adaptive Many-Objective Evolutionary Computing Framework',
		authors: 'Hadka, David; Reed, Patrick',
		year: 2013,
		journal: 'Evolutionary Computation',
		doi: '10.1162/EVCO_a_00075',
		openAccess: false,
	},
];

export const DCM_NOTEBOOK_SECTIONS: IModelNotebookSection[] = [
	{
		label: '',
		notebooks: [
			{
				name: 'MOEA/D',
				file: 'dcm/tutorial-01-moead.ipynb',
				bundled: true,
				description: 'Multiobjective Evolutionary Algorithm Based on Decomposition using weight vectors',
			},
			{
				name: 'CCMO',
				file: 'dcm/tutorial-02-ccmo.ipynb',
				bundled: true,
				description: 'Coevolutionary Constrained Multiobjective Optimisation with helper and main populations',
			},
			{
				name: 'Borg MOEA',
				file: 'dcm/tutorial-03-borg.ipynb',
				bundled: true,
				description: 'Auto-adaptive many-objective evolutionary algorithm with epsilon-dominance archiving',
			},
		],
	},
];

const DCM_METADATA: IDcmMetadata = {
	dcm: {
		packages: [
			{
				name: 'Metaheuristics.jl',
				github: 'https://github.com/jmejia8/Metaheuristics.jl',
				papers: [],
			},
		],
		notebookSections: DCM_NOTEBOOK_SECTIONS,
		notebooks: DCM_NOTEBOOK_SECTIONS.flatMap(s => s.notebooks),
		wikis: [
			{ name: 'Factsheet',      file: 'dcm/factsheet.md',      bundled: true },
			{ name: 'Overview',       file: 'dcm/overview.md',        bundled: true },
			{ name: 'Assumptions',    file: 'dcm/assumptions.md',     bundled: true },
			{ name: 'Diagnostics',    file: 'dcm/diagnostics.md',     bundled: true },
			{ name: 'Interpretation', file: 'dcm/interpretation.md',  bundled: true },
			{ name: 'Decision Guide', file: 'dcm/decision-guide.md',  bundled: true },
			{ separator: true, label: 'Algorithms' },
			{ name: 'MOEA/D',    file: 'dcm/moead.md', bundled: true },
			{ name: 'CCMO',      file: 'dcm/ccmo.md',  bundled: true },
			{ name: 'Borg MOEA', file: 'dcm/borg.md',  bundled: true },
		],
		references: DCM_REFERENCES,
	},
};

export function openDcmWebview(
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
			title: DCM_TITLE,
			options: { retainContextWhenHidden: true },
			contentOptions: { allowScripts: true },
			extension: undefined,
		},
		DCM_VIEW_TYPE,
		DCM_TITLE,
		undefined,
		{ group: undefined, preserveFocus: false }
	);

	webviewInput.webview.setHtml(getDcmHtml());

	registerDcmWebviewHandlers(
		webviewInput,
		DCM_METADATA,
		openerService,
		editorService,
		quickInputService,
		commandService,
		clipboardService,
		notificationService,
		initialModel,
	);
}
