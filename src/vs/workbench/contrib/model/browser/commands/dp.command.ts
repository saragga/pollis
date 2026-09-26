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
import { IDpMetadata } from '../common/dp.types.js';
import { registerDpWebviewHandlers } from '../handlers/dp.handler.js';
import { getDpHtml } from '../webviews/dp.template.js';

const DP_VIEW_TYPE = 'pollis.dp';
const DP_TITLE = 'Dynamic Programming';

const DP_REFERENCES: IModelReference[] = [
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
		title: 'Quantitative Economics with Julia',
		authors: 'Sargent, Thomas J.; Stachurski, John',
		year: 2024,
		journal: 'QuantEcon',
		url: 'https://julia.quantecon.org',
		openAccess: true,
	},
	{ separator: true, label: 'Textbooks' },
	{
		title: 'Dynamic Programming and Optimal Control, Vol. 1',
		authors: 'Bertsekas, Dimitri P.',
		year: 2017,
		journal: 'Athena Scientific (4th ed.)',
		openAccess: false,
	},
	{
		title: 'Dynamic Programming and Optimal Control, Vol. 2',
		authors: 'Bertsekas, Dimitri P.',
		year: 2012,
		journal: 'Athena Scientific (4th ed.)',
		openAccess: false,
	},
	{
		title: 'Markov Decision Processes: Discrete Stochastic Dynamic Programming',
		authors: 'Puterman, Martin L.',
		year: 2005,
		journal: 'Wiley (2nd ed.)',
		doi: '10.1002/9780470316887',
		openAccess: false,
	},
	{ separator: true, label: 'Original Papers' },
	{
		title: 'The Theory of Dynamic Programming',
		authors: 'Bellman, Richard',
		year: 1954,
		journal: 'Proceedings of the National Academy of Sciences',
		doi: '10.1073/pnas.40.8.716',
		openAccess: true,
	},
	{
		title: 'Stochastic Games',
		authors: 'Shapley, Lloyd S.',
		year: 1953,
		journal: 'Proceedings of the National Academy of Sciences',
		doi: '10.1073/pnas.39.10.1095',
		openAccess: true,
	},
	{
		title: 'On the Solution of a Linear Programming Problem',
		authors: 'Howard, Ronald A.',
		year: 1960,
		journal: 'MIT Press',
		openAccess: false,
	},
];

export const DP_NOTEBOOK_SECTIONS: IModelNotebookSection[] = [
	{
		label: '',
		notebooks: [
			{
				name: 'Deterministic: Inventory Control',
				file: 'dp/tutorial-01-deterministic-inventory.ipynb',
				bundled: true,
				description: 'Finite-horizon deterministic inventory control via backward induction: value function, optimal policy extraction, and simulation',
			},
			{
				name: 'Deterministic: Shortest Path',
				file: 'dp/tutorial-02-deterministic-shortest-path.ipynb',
				bundled: true,
				description: 'Shortest-path DP on a directed graph: Bellman-Ford as a DP recursion, comparison with Dijkstra',
			},
			{
				name: 'Stochastic: Inventory Control',
				file: 'dp/tutorial-03-stochastic-inventory.ipynb',
				bundled: true,
				description: 'Stochastic inventory control with random demand via StochDynamicProgramming.jl: grid discretisation, backward induction, and policy simulation',
			},
		],
	},
];

const DP_METADATA: IDpMetadata = {
	dp: {
		packages: [
			{ name: 'QuantEcon.jl',               github: 'https://github.com/QuantEcon/QuantEcon.jl',                    papers: [] },
			{ name: 'StochDynamicProgramming.jl', github: 'https://github.com/JuliaStochOpt/StochDynamicProgramming.jl', papers: [] },
		],
		notebookSections: DP_NOTEBOOK_SECTIONS,
		notebooks: DP_NOTEBOOK_SECTIONS.flatMap(s => s.notebooks),
		wikis: [
			{ name: 'Factsheet',      file: 'dp/factsheet.md',      bundled: true },
			{ name: 'Overview',       file: 'dp/overview.md',        bundled: true },
			{ name: 'Assumptions',    file: 'dp/assumptions.md',     bundled: true },
			{ name: 'Diagnostics',    file: 'dp/diagnostics.md',     bundled: true },
			{ name: 'Interpretation', file: 'dp/interpretation.md',  bundled: true },
			{ name: 'Decision Guide', file: 'dp/decision-guide.md',  bundled: true },
			{ separator: true, label: 'Methods' },
			{ name: 'Deterministic DP', file: 'dp/deterministic.md', bundled: true },
			{ name: 'Stochastic DP',    file: 'dp/stochastic.md',    bundled: true },
		],
		references: DP_REFERENCES,
	},
};

export function openDpWebview(
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
			title: DP_TITLE,
			options: { retainContextWhenHidden: true },
			contentOptions: { allowScripts: true },
			extension: undefined,
		},
		DP_VIEW_TYPE,
		DP_TITLE,
		undefined,
		{ group: undefined, preserveFocus: false }
	);

	webviewInput.webview.setHtml(getDpHtml());

	registerDpWebviewHandlers(
		webviewInput,
		DP_METADATA,
		openerService,
		editorService,
		quickInputService,
		commandService,
		clipboardService,
		notificationService,
		initialModel,
	);
}
