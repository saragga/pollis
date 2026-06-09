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
import { ISproMetadata } from '../common/spro.types.js';
import { registerSproWebviewHandlers } from '../handlers/spro.handler.js';
import { getSproHtml } from '../webviews/spro.template.js';

const SPRO_VIEW_TYPE = 'pollis.spro';
const SPRO_TITLE = 'Stochastic Programming';

const SPRO_REFERENCES: IModelReference[] = [
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
		title: 'JuMP: A Modeling Language for Mathematical Optimization',
		authors: 'Dunning, Iain; Huchette, Joey; Lubin, Miles',
		year: 2017,
		journal: 'SIAM Review',
		doi: '10.1137/15M1020575',
		openAccess: true,
	},
	{
		title: 'StochasticPrograms.jl: A Progressive Hedging Library for Two-Stage Stochastic Programming in Julia',
		authors: 'Biel, Martin; Johansson, Mikael',
		year: 2022,
		journal: 'Journal of Statistical Software',
		doi: '10.18637/jss.v095.i05',
		openAccess: true,
	},
	{
		title: 'SDDP.jl: A Julia Package for Stochastic Dual Dynamic Programming',
		authors: 'Dowson, Oscar; Kapelevich, Lea',
		year: 2021,
		journal: 'INFORMS Journal on Computing',
		doi: '10.1287/ijoc.2022.1253',
		openAccess: true,
	},
	{
		title: 'HiGHS: Serial and Parallel Solution of Linear Programming',
		authors: 'Huangfu, Qi; Hall, J.A.J.',
		year: 2018,
		journal: 'Mathematical Programming Computation',
		doi: '10.1007/s12532-017-0130-5',
		openAccess: true,
	},
	{ separator: true, label: 'Textbooks' },
	{
		title: 'Introduction to Stochastic Programming',
		authors: 'Birge, John R.; Louveaux, Francois',
		year: 2011,
		journal: 'Springer (2nd ed.)',
		doi: '10.1007/978-1-4614-0237-4',
		openAccess: false,
	},
	{
		title: 'Lectures on Stochastic Programming: Modeling and Theory',
		authors: 'Shapiro, Alexander; Dentcheva, Darinka; Ruszczynski, Andrzej',
		year: 2021,
		journal: 'SIAM (3rd ed.)',
		doi: '10.1137/1.9780898718751',
		openAccess: false,
	},
	{ separator: true, label: 'Original Papers' },
	{
		title: 'Linear Programming under Uncertainty',
		authors: 'Dantzig, George B.',
		year: 1955,
		journal: 'Management Science',
		doi: '10.1287/mnsc.1.3-4.197',
		openAccess: false,
	},
	{
		title: 'Multi-stage Stochastic Optimization Applied to Energy Planning',
		authors: 'Pereira, Mario V.F.; Pinto, Leontina M.V.G.',
		year: 1991,
		journal: 'Mathematical Programming',
		doi: '10.1007/BF01582895',
		openAccess: false,
	},
	{
		title: 'The Optimal Decision Policy for Multi-stage Stochastic Programming',
		authors: 'Rockafellar, R. Tyrrell; Wets, Roger J-B.',
		year: 1991,
		journal: 'Mathematics of Operations Research',
		doi: '10.1287/moor.16.1.119',
		openAccess: false,
	},
];

export const SPRO_NOTEBOOK_SECTIONS: IModelNotebookSection[] = [
	{
		label: '',
		notebooks: [
			{
				name: 'Two-Stage: Newsvendor',
				file: 'spro/tutorial-01-two-stage.ipynb',
				bundled: true,
				description: 'Two-stage stochastic newsvendor problem: optimal order quantity under demand uncertainty using StochasticPrograms.jl and HiGHS',
			},
			{
				name: 'Multistage Inventory',
				file: 'spro/tutorial-02-multistage.ipynb',
				bundled: true,
				description: 'Multistage stochastic inventory control over T periods with scenario tree generation and progressive hedging via StochasticPrograms.jl',
			},
			{
				name: 'SDDP: Hydro Scheduling',
				file: 'spro/tutorial-03-sddp.ipynb',
				bundled: true,
				description: 'Hydrothermal scheduling with SDDP.jl: forward-backward pass, cutting plane convergence, and policy simulation over many stages',
			},
		],
	},
];

const SPRO_METADATA: ISproMetadata = {
	spro: {
		packages: [
			{ name: 'StochasticPrograms.jl', github: 'https://github.com/martinbiel/StochasticPrograms.jl', papers: [] },
			{ name: 'SDDP.jl',               github: 'https://github.com/odow/SDDP.jl',                   papers: [] },
			{ name: 'HiGHS.jl',              github: 'https://github.com/jump-dev/HiGHS.jl',              papers: [] },
		],
		notebookSections: SPRO_NOTEBOOK_SECTIONS,
		notebooks: SPRO_NOTEBOOK_SECTIONS.flatMap(s => s.notebooks),
		wikis: [
			{ name: 'Factsheet',      file: 'spro/factsheet.md',      bundled: true },
			{ name: 'Overview',       file: 'spro/overview.md',        bundled: true },
			{ name: 'Assumptions',    file: 'spro/assumptions.md',     bundled: true },
			{ name: 'Diagnostics',    file: 'spro/diagnostics.md',     bundled: true },
			{ name: 'Interpretation', file: 'spro/interpretation.md',  bundled: true },
			{ name: 'Decision Guide', file: 'spro/decision-guide.md',  bundled: true },
			{ separator: true, label: 'Methods' },
			{ name: 'Two-Stage SP',   file: 'spro/two-stage.md',       bundled: true },
			{ name: 'Multistage SP',  file: 'spro/multistage.md',      bundled: true },
			{ name: 'SDDP',           file: 'spro/sddp.md',            bundled: true },
		],
		references: SPRO_REFERENCES,
	},
};

export function openSproWebview(
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
			title: SPRO_TITLE,
			options: { retainContextWhenHidden: true },
			contentOptions: { allowScripts: true },
			extension: undefined,
		},
		SPRO_VIEW_TYPE,
		SPRO_TITLE,
		undefined,
		{ group: undefined, preserveFocus: false }
	);

	webviewInput.webview.setHtml(getSproHtml());

	registerSproWebviewHandlers(
		webviewInput,
		SPRO_METADATA,
		openerService,
		editorService,
		quickInputService,
		commandService,
		clipboardService,
		notificationService,
		initialModel,
	);
}
