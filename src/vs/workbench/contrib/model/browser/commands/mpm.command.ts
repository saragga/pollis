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
import { IMpmMetadata } from '../common/mpm.types.js';
import { registerMpmWebviewHandlers } from '../handlers/mpm.handler.js';
import { getMpmHtml } from '../webviews/mpm.template.js';

const MPM_VIEW_TYPE = 'pollis.mpm';
const MPM_TITLE = 'Multi-Objective Optimisation Performance Metrics';

const MPM_REFERENCES: IModelReference[] = [
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
	{ separator: true, label: 'Original Papers' },
	{
		title: 'Performance Assessment of Multiobjective Optimizers: An Analysis and Review',
		authors: 'Zitzler, Eckart; Thiele, Lothar; Laumanns, Marco; Fonseca, Carlos M.; da Fonseca, Viviane Grunert',
		year: 2003,
		journal: 'IEEE Transactions on Evolutionary Computation',
		doi: '10.1109/TEVC.2003.810758',
		openAccess: false,
	},
	{
		title: 'Multiobjective Evolutionary Algorithms: A Comparative Case Study and the Strength Pareto Approach',
		authors: 'Zitzler, Eckart; Thiele, Lothar',
		year: 1999,
		journal: 'IEEE Transactions on Evolutionary Computation',
		doi: '10.1109/4235.797969',
		openAccess: false,
	},
	{
		title: 'Measuring the Hypervolume Exactly for Multi-Objective Minimization Problems',
		authors: 'Beume, Nicola; Fonseca, Carlos M.; Lopez-Ibanez, Manuel; Paquete, Luis; Vahrenhold, Jan',
		year: 2009,
		journal: 'Evolutionary Computation',
		doi: '10.1162/evco.2009.17.1.17104',
		openAccess: false,
	},
	{
		title: 'Generational Distance Revisited',
		authors: 'Ishibuchi, Hisao; Masuda, Hiroyuki; Tanigaki, Yuki; Nojima, Yusuke',
		year: 2015,
		journal: 'GECCO Companion Proceedings',
		doi: '10.1145/2739482.2764899',
		openAccess: false,
	},
];

export const MPM_NOTEBOOK_SECTIONS: IModelNotebookSection[] = [
	{
		label: '',
		notebooks: [
			{
				name: 'Hypervolume',
				file: 'mpm/tutorial-01-hv.ipynb',
				bundled: true,
				description: 'Hypervolume indicator: volume of objective space dominated by the Pareto front',
			},
			{
				name: 'Generational Distance',
				file: 'mpm/tutorial-02-gd.ipynb',
				bundled: true,
				description: 'Generational Distance: average distance from obtained front to true Pareto front',
			},
			{
				name: 'Inverted Generational Distance',
				file: 'mpm/tutorial-03-igd.ipynb',
				bundled: true,
				description: 'Inverted Generational Distance: average distance from true front to obtained front',
			},
			{
				name: 'Epsilon-Indicator',
				file: 'mpm/tutorial-04-eps.ipynb',
				bundled: true,
				description: 'Additive epsilon-indicator: smallest epsilon such that the obtained front epsilon-dominates the true front',
			},
			{
				name: 'Spacing',
				file: 'mpm/tutorial-05-spacing.ipynb',
				bundled: true,
				description: 'Spacing metric: uniformity of distribution of solutions along the Pareto front',
			},
		],
	},
];

const MPM_METADATA: IMpmMetadata = {
	mpm: {
		packages: [
			{
				name: 'Metaheuristics.jl',
				github: 'https://github.com/jmejia8/Metaheuristics.jl',
				papers: [],
			},
		],
		notebookSections: MPM_NOTEBOOK_SECTIONS,
		notebooks: MPM_NOTEBOOK_SECTIONS.flatMap(s => s.notebooks),
		wikis: [
			{ name: 'Factsheet',      file: 'mpm/factsheet.md',      bundled: true },
			{ name: 'Overview',       file: 'mpm/overview.md',        bundled: true },
			{ name: 'Assumptions',    file: 'mpm/assumptions.md',     bundled: true },
			{ name: 'Diagnostics',    file: 'mpm/diagnostics.md',     bundled: true },
			{ name: 'Interpretation', file: 'mpm/interpretation.md',  bundled: true },
			{ name: 'Decision Guide', file: 'mpm/decision-guide.md',  bundled: true },
			{ separator: true, label: 'Metrics' },
			{ name: 'Hypervolume',        file: 'mpm/hv.md',      bundled: true },
			{ name: 'Generational Distance',         file: 'mpm/gd.md',  bundled: true },
			{ name: 'Inverted Generational Distance', file: 'mpm/igd.md', bundled: true },
			{ name: 'Epsilon-Indicator',  file: 'mpm/eps.md',     bundled: true },
			{ name: 'Spacing',            file: 'mpm/spacing.md', bundled: true },
		],
		references: MPM_REFERENCES,
	},
};

export function openMpmWebview(
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
			title: MPM_TITLE,
			options: { retainContextWhenHidden: true },
			contentOptions: { allowScripts: true },
			extension: undefined,
		},
		MPM_VIEW_TYPE,
		MPM_TITLE,
		undefined,
		{ group: undefined, preserveFocus: false }
	);

	webviewInput.webview.setHtml(getMpmHtml());

	registerMpmWebviewHandlers(
		webviewInput,
		MPM_METADATA,
		openerService,
		editorService,
		quickInputService,
		commandService,
		clipboardService,
		notificationService,
		initialModel,
	);
}
