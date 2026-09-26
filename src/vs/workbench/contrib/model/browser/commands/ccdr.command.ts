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
import { ICcdrMetadata } from '../common/ccdr.types.js';
import { registerCcdrWebviewHandlers } from '../handlers/ccdr.handler.js';
import { getCcdrHtml } from '../webviews/ccdr.template.js';

const CCDR_VIEW_TYPE = 'pollis.ccdr';
const CCDR_TITLE = 'Chance-Constrained and Distributionally Robust Optimisation';

const CCDR_REFERENCES: IModelReference[] = [
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
		title: 'Clarabel: An Interior-Point Solver for Conic Programs with Quadratic Objectives',
		authors: 'Goulart, Paul J.; Chen, Yuwen',
		year: 2024,
		journal: 'arXiv',
		doi: '10.48550/arXiv.2405.14674',
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
		title: 'Robust Optimization',
		authors: 'Ben-Tal, Aharon; El Ghaoui, Laurent; Nemirovski, Arkadi',
		year: 2009,
		journal: 'Princeton University Press',
		doi: '10.1515/9781400831050',
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
		title: 'Distributionally Robust Optimization under Moment Uncertainty with Application to Data-Driven Problems',
		authors: 'Delage, Erick; Ye, Yinyu',
		year: 2010,
		journal: 'Operations Research',
		doi: '10.1287/opre.1090.0741',
		openAccess: false,
	},
	{
		title: 'Data-Driven Distributionally Robust Optimization Using the Wasserstein Metric',
		authors: 'Mohajerin Esfahani, Peyman; Kuhn, Daniel',
		year: 2018,
		journal: 'Mathematical Programming',
		doi: '10.1007/s10107-017-1172-1',
		openAccess: true,
	},
	{
		title: 'Chance Constrained Programming',
		authors: 'Charnes, Abraham; Cooper, William W.',
		year: 1959,
		journal: 'Management Science',
		doi: '10.1287/mnsc.6.1.73',
		openAccess: false,
	},
	{
		title: 'A Sample Approximation Approach for Optimization with Probabilistic Constraints',
		authors: 'Luedtke, James; Ahmed, Shabbir',
		year: 2008,
		journal: 'SIAM Journal on Optimization',
		doi: '10.1137/070702928',
		openAccess: false,
	},
];

export const CCDR_NOTEBOOK_SECTIONS: IModelNotebookSection[] = [
	{
		label: '',
		notebooks: [
			{
				name: 'Chance-Constrained: Gaussian',
				file: 'ccdr/tutorial-01-cc-gaussian.ipynb',
				bundled: true,
				description: 'Individual chance constraints with Gaussian uncertainty: exact SOCP reformulation via JuMP and Clarabel',
			},
			{
				name: 'Chance-Constrained: Sample Average Approximation',
				file: 'ccdr/tutorial-02-cc-saa.ipynb',
				bundled: true,
				description: 'Joint chance constraints via sample average approximation: big-M MIP reformulation with HiGHS',
			},
			{
				name: 'DRO: Moment Ambiguity',
				file: 'ccdr/tutorial-03-dro-moment.ipynb',
				bundled: true,
				description: 'Distributionally robust optimisation with mean-covariance ambiguity set: SDP reformulation via Clarabel',
			},
			{
				name: 'DRO: Wasserstein',
				file: 'ccdr/tutorial-04-dro-wasserstein.ipynb',
				bundled: true,
				description: 'Wasserstein DRO: finite-sample ambiguity ball around empirical distribution, reformulated as LP/SOCP via JuMP',
			},
		],
	},
];

const CCDR_METADATA: ICcdrMetadata = {
	ccdr: {
		packages: [
			{ name: 'JuMP.jl',      github: 'https://github.com/jump-dev/JuMP.jl',          papers: [] },
			{ name: 'Clarabel.jl',  github: 'https://github.com/oxfordcontrol/Clarabel.jl', papers: [] },
			{ name: 'HiGHS.jl',     github: 'https://github.com/jump-dev/HiGHS.jl',         papers: [] },
		],
		notebookSections: CCDR_NOTEBOOK_SECTIONS,
		notebooks: CCDR_NOTEBOOK_SECTIONS.flatMap(s => s.notebooks),
		wikis: [
			{ name: 'Factsheet',      file: 'ccdr/factsheet.md',      bundled: true },
			{ name: 'Overview',       file: 'ccdr/overview.md',        bundled: true },
			{ name: 'Assumptions',    file: 'ccdr/assumptions.md',     bundled: true },
			{ name: 'Diagnostics',    file: 'ccdr/diagnostics.md',     bundled: true },
			{ name: 'Interpretation', file: 'ccdr/interpretation.md',  bundled: true },
			{ name: 'Decision Guide', file: 'ccdr/decision-guide.md',  bundled: true },
			{ separator: true, label: 'Methods' },
			{ name: 'Chance-Constrained',        file: 'ccdr/chance-constrained.md', bundled: true },
			{ name: 'Distributionally Robust',   file: 'ccdr/dro.md',                bundled: true },
		],
		references: CCDR_REFERENCES,
	},
};

export function openCcdrWebview(
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
			title: CCDR_TITLE,
			options: { retainContextWhenHidden: true },
			contentOptions: { allowScripts: true },
			extension: undefined,
		},
		CCDR_VIEW_TYPE,
		CCDR_TITLE,
		undefined,
		{ group: undefined, preserveFocus: false }
	);

	webviewInput.webview.setHtml(getCcdrHtml());

	registerCcdrWebviewHandlers(
		webviewInput,
		CCDR_METADATA,
		openerService,
		editorService,
		quickInputService,
		commandService,
		clipboardService,
		notificationService,
		initialModel,
	);
}
