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
import { IPbmMetadata } from '../common/pbm.types.js';
import { registerPbmWebviewHandlers } from '../handlers/pbm.handler.js';
import { getPbmHtml } from '../webviews/pbm.template.js';

const PBM_VIEW_TYPE = 'pollis.pbm';
const PBM_TITLE = 'Pareto-Based Multi-Objective Optimisation';

const PBM_REFERENCES: IModelReference[] = [
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
		title: 'A Fast and Elitist Multiobjective Genetic Algorithm: NSGA-II',
		authors: 'Deb, Kalyanmoy; Pratap, Amrit; Agarwal, Sameer; Meyarivan, T.',
		year: 2002,
		journal: 'IEEE Transactions on Evolutionary Computation',
		doi: '10.1109/4235.996017',
		openAccess: false,
	},
	{
		title: 'An Evolutionary Many-Objective Optimization Algorithm Using Reference-Point-Based Nondominated Sorting Approach, Part I: Solving Problems with Box Constraints',
		authors: 'Deb, Kalyanmoy; Jain, Himanshu',
		year: 2014,
		journal: 'IEEE Transactions on Evolutionary Computation',
		doi: '10.1109/TEVC.2013.2281535',
		openAccess: false,
	},
	{
		title: 'SPEA2: Improving the Strength Pareto Evolutionary Algorithm',
		authors: 'Zitzler, Eckart; Laumanns, Marco; Thiele, Lothar',
		year: 2001,
		journal: 'TIK-Report 103, ETH Zurich',
		openAccess: false,
	},
	{
		title: 'SMS-EMOA: Multiobjective Selection Based on Dominated Hypervolume',
		authors: 'Beume, Nicola; Naujoks, Boris; Emmerich, Michael',
		year: 2007,
		journal: 'European Journal of Operational Research',
		doi: '10.1016/j.ejor.2006.08.008',
		openAccess: false,
	},
];

export const PBM_NOTEBOOK_SECTIONS: IModelNotebookSection[] = [
	{
		label: '',
		notebooks: [
			{
				name: 'NSGA-II',
				file: 'pbm/tutorial-01-nsga2.ipynb',
				bundled: true,
				description: 'Non-dominated Sorting Genetic Algorithm II for two- and three-objective problems',
			},
			{
				name: 'NSGA-III',
				file: 'pbm/tutorial-02-nsga3.ipynb',
				bundled: true,
				description: 'Reference-point-based NSGA for many-objective problems with 4 or more objectives',
			},
			{
				name: 'SPEA2',
				file: 'pbm/tutorial-03-spea2.ipynb',
				bundled: true,
				description: 'Strength Pareto Evolutionary Algorithm 2 with archive-based selection',
			},
			{
				name: 'SMS-EMOA',
				file: 'pbm/tutorial-04-sms.ipynb',
				bundled: true,
				description: 'Hypervolume-based steady-state multiobjective evolutionary algorithm',
			},
		],
	},
];

const PBM_METADATA: IPbmMetadata = {
	pbm: {
		packages: [
			{
				name: 'Metaheuristics.jl',
				github: 'https://github.com/jmejia8/Metaheuristics.jl',
				papers: [],
			},
		],
		notebookSections: PBM_NOTEBOOK_SECTIONS,
		notebooks: PBM_NOTEBOOK_SECTIONS.flatMap(s => s.notebooks),
		wikis: [
			{ name: 'Factsheet',      file: 'pbm/factsheet.md',      bundled: true },
			{ name: 'Overview',       file: 'pbm/overview.md',        bundled: true },
			{ name: 'Assumptions',    file: 'pbm/assumptions.md',     bundled: true },
			{ name: 'Diagnostics',    file: 'pbm/diagnostics.md',     bundled: true },
			{ name: 'Interpretation', file: 'pbm/interpretation.md',  bundled: true },
			{ name: 'Decision Guide', file: 'pbm/decision-guide.md',  bundled: true },
			{ separator: true, label: 'Algorithms' },
			{ name: 'NSGA-II',   file: 'pbm/nsga2.md',  bundled: true },
			{ name: 'NSGA-III',  file: 'pbm/nsga3.md',  bundled: true },
			{ name: 'SPEA2',     file: 'pbm/spea2.md',  bundled: true },
			{ name: 'SMS-EMOA',  file: 'pbm/sms.md',    bundled: true },
		],
		references: PBM_REFERENCES,
	},
};

export function openPbmWebview(
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
			title: PBM_TITLE,
			options: { retainContextWhenHidden: true },
			contentOptions: { allowScripts: true },
			extension: undefined,
		},
		PBM_VIEW_TYPE,
		PBM_TITLE,
		undefined,
		{ group: undefined, preserveFocus: false }
	);

	webviewInput.webview.setHtml(getPbmHtml());

	registerPbmWebviewHandlers(
		webviewInput,
		PBM_METADATA,
		openerService,
		editorService,
		quickInputService,
		commandService,
		clipboardService,
		notificationService,
		initialModel,
	);
}
