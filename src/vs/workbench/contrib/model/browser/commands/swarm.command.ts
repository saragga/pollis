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
import { ISwarmMetadata } from '../common/swarm.types.js';
import { registerSwarmWebviewHandlers } from '../handlers/swarm.handler.js';
import { getSwarmHtml } from '../webviews/swarm.template.js';

const SWARM_VIEW_TYPE = 'pollis.swarm';
const SWARM_TITLE = 'Swarm Intelligence';

const SWARM_REFERENCES: IModelReference[] = [
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
		authors: 'Mej&#237;a-de-Dios, Jes&#250;s-Adolfo; Mezura-Montes, Efr&#233;n',
		year: 2022,
		journal: 'SoftwareX',
		doi: '10.1016/j.softx.2022.101049',
		openAccess: true,
	},
	{ separator: true, label: 'Textbooks' },
	{
		title: 'Swarm Intelligence',
		authors: 'Kennedy, James; Eberhart, Russell C.; Shi, Yuhui',
		year: 2001,
		journal: 'Morgan Kaufmann',
		openAccess: false,
	},
	{
		title: 'Fundamentals of Computational Swarm Intelligence',
		authors: 'Engelbrecht, Andries P.',
		year: 2005,
		journal: 'Wiley',
		openAccess: false,
	},
	{ separator: true, label: 'Original Papers' },
	{
		title: 'Particle Swarm Optimization',
		authors: 'Kennedy, James; Eberhart, Russell C.',
		year: 1995,
		journal: 'ICNN\'95 &#8212; International Conference on Neural Networks',
		doi: '10.1109/ICNN.1995.488968',
		openAccess: false,
	},
	{
		title: 'A Competitive Swarm Optimizer for Large Scale Optimization',
		authors: 'Cheng, Ran; Jin, Yaochu',
		year: 2015,
		journal: 'IEEE Transactions on Cybernetics',
		doi: '10.1109/TCYB.2014.2322602',
		openAccess: false,
	},
	{
		title: 'A Powerful and Efficient Algorithm for Numerical Function Optimization: Artificial Bee Colony (ABC) Algorithm',
		authors: 'Karaboga, Dervis; Basturk, Bahriye',
		year: 2007,
		journal: 'Journal of Global Optimization',
		doi: '10.1007/s10898-007-9149-x',
		openAccess: false,
	},
	{
		title: 'The Whale Optimization Algorithm',
		authors: 'Mirjalili, Seyedali; Lewis, Andrew',
		year: 2016,
		journal: 'Advances in Engineering Software',
		doi: '10.1016/j.advengsoft.2016.01.008',
		openAccess: false,
	},
	{
		title: 'GSA: A Gravitational Search Algorithm',
		authors: 'Rashedi, Esmat; Nezamabadi-pour, Hossein; Saryazdi, Saeid',
		year: 2009,
		journal: 'Information Sciences',
		doi: '10.1016/j.ins.2009.03.004',
		openAccess: false,
	},
];

export const SWARM_NOTEBOOK_SECTIONS: IModelNotebookSection[] = [
	{
		label: '',
		notebooks: [
			{
				name: 'PSO',
				file: 'swarm/tutorial-01-pso.ipynb',
				bundled: true,
				description: 'Particle swarm optimisation: social and cognitive velocity updates drive particles toward the global best',
			},
			{
				name: 'CSO',
				file: 'swarm/tutorial-02-cso.ipynb',
				bundled: true,
				description: 'Competitive swarm optimiser: pairwise competition updates loser velocity toward winner and global mean',
			},
			{
				name: 'ABC',
				file: 'swarm/tutorial-03-abc.ipynb',
				bundled: true,
				description: 'Artificial bee colony: employed, onlooker and scout bee phases balance exploitation and exploration',
			},
			{
				name: 'WOA',
				file: 'swarm/tutorial-04-woa.ipynb',
				bundled: true,
				description: 'Whale optimisation algorithm: bubble-net attacking and spiral updating mimic humpback whale foraging',
			},
			{
				name: 'GSA',
				file: 'swarm/tutorial-05-gsa.ipynb',
				bundled: true,
				description: 'Gravitational search algorithm: agents attract each other via simulated gravity proportional to fitness mass',
			},
		],
	},
];

const SWARM_METADATA: ISwarmMetadata = {
	swarm: {
		packages: [
			{
				name: 'Metaheuristics.jl',
				github: 'https://github.com/jmejia8/Metaheuristics.jl',
				papers: [],
			},
		],
		notebookSections: SWARM_NOTEBOOK_SECTIONS,
		notebooks: SWARM_NOTEBOOK_SECTIONS.flatMap(s => s.notebooks),
		wikis: [
			{ name: 'Factsheet',      file: 'swarm/factsheet.md',      bundled: true },
			{ name: 'Overview',       file: 'swarm/overview.md',        bundled: true },
			{ name: 'Assumptions',    file: 'swarm/assumptions.md',     bundled: true },
			{ name: 'Diagnostics',    file: 'swarm/diagnostics.md',     bundled: true },
			{ name: 'Interpretation', file: 'swarm/interpretation.md',  bundled: true },
			{ name: 'Decision Guide', file: 'swarm/decision-guide.md',  bundled: true },
			{ separator: true, label: 'Algorithm Details' },
			{ name: 'PSO', file: 'swarm/pso.md', bundled: true },
			{ name: 'CSO', file: 'swarm/cso.md', bundled: true },
			{ name: 'ABC', file: 'swarm/abc.md', bundled: true },
			{ name: 'WOA', file: 'swarm/woa.md', bundled: true },
			{ name: 'GSA', file: 'swarm/gsa.md', bundled: true },
		],
		references: SWARM_REFERENCES,
	},
};

export function openSwarmWebview(
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
			title: SWARM_TITLE,
			options: { retainContextWhenHidden: true },
			contentOptions: { allowScripts: true },
			extension: undefined,
		},
		SWARM_VIEW_TYPE,
		SWARM_TITLE,
		undefined,
		{ group: undefined, preserveFocus: false }
	);

	webviewInput.webview.setHtml(getSwarmHtml());

	registerSwarmWebviewHandlers(
		webviewInput,
		SWARM_METADATA,
		openerService,
		editorService,
		quickInputService,
		commandService,
		clipboardService,
		notificationService,
		initialModel,
	);
}
