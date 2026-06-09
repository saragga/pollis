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
import { IMpsosMetadata } from '../common/mpsos.types.js';
import { IModelReference, IModelNotebookSection } from '../common/model.types.js';
import { registerMpsosWebviewHandlers } from '../handlers/mpsos.handler.js';
import { getMpsosHtml } from '../webviews/mpsos.template.js';

const MPSOS_VIEW_TYPE = 'pollis.mpsos';
const MPSOS_TITLE = 'Polynomial Programming';

const MPSOS_REFERENCES: IModelReference[] = [
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
		title: 'SumOfSquares.jl: Polynomial Sum-of-Squares Optimization in Julia',
		authors: 'Legat, Benoit; Weisser, Tillmann; Lofberg, Johan; Parrilo, Pablo A.',
		year: 2023,
		journal: 'GitHub',
		url: 'https://github.com/jump-dev/SumOfSquares.jl',
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
		title: 'COSMO: A Conic Operator Splitting Method for Convex Conic Problems',
		authors: 'Garstka, Michael; Cannon, Mark; Goulart, Paul',
		year: 2021,
		journal: 'Journal of Optimization Theory and Applications',
		doi: '10.1007/s10957-021-01896-7',
		openAccess: true,
	},
	{
		title: 'Conic Optimization via Operator Splitting and Homogeneous Self-Dual Embedding',
		authors: 'O\'Donoghue, Brendan; Chu, Eric; Parikh, Neal; Boyd, Stephen',
		year: 2016,
		journal: 'Journal of Optimization Theory and Applications',
		doi: '10.1007/s10957-016-0892-3',
		openAccess: false,
	},
	{ separator: true, label: 'Textbooks' },
	{
		title: 'Semidefinite Optimization and Convex Algebraic Geometry',
		authors: 'Blekherman, Grigoriy; Parrilo, Pablo A.; Thomas, Rekha R. (Eds.)',
		year: 2012,
		journal: 'SIAM',
		doi: '10.1137/1.9781611972290',
		openAccess: false,
	},
	{
		title: 'An Introduction to Polynomial and Semi-Algebraic Optimization',
		authors: 'Lasserre, Jean B.',
		year: 2015,
		journal: 'Cambridge University Press',
		doi: '10.1017/CBO9781107447226',
		openAccess: false,
	},
	{ separator: true, label: 'Original Papers' },
	{
		title: 'Semidefinite Programming Relaxations for Semialgebraic Problems',
		authors: 'Parrilo, Pablo A.',
		year: 2003,
		journal: 'Mathematical Programming',
		doi: '10.1007/s10107-003-0387-5',
		openAccess: false,
	},
	{
		title: 'Global Optimization with Polynomials and the Problem of Moments',
		authors: 'Lasserre, Jean B.',
		year: 2001,
		journal: 'SIAM Journal on Optimization',
		doi: '10.1137/S1052623400366802',
		openAccess: false,
	},
];

export const MPSOS_NOTEBOOK_SECTIONS: IModelNotebookSection[] = [
	{
		label: 'SOS Programming',
		notebooks: [
			{ name: 'Sum of Squares Certification', file: 'mpsos/tutorial-01-sos-certificate.ipynb', bundled: true, description: 'Certify polynomial non-negativity via a sum-of-squares decomposition' },
		],
	},
	{
		label: 'Polynomial Optimisation',
		notebooks: [
			{ name: 'Polynomial Optimisation', file: 'mpsos/tutorial-02-polynomial-optimisation.ipynb', bundled: true, description: 'Global lower bound via the Lasserre moment-SOS hierarchy' },
		],
	},
];

const MPSOS_METADATA: IMpsosMetadata = {
	mpsos: {
		packages: [
			{ name: 'SumOfSquares.jl', github: 'https://github.com/jump-dev/SumOfSquares.jl', papers: [] },
			{ name: 'Clarabel.jl',     github: 'https://github.com/oxfordcontrol/Clarabel.jl', papers: [] },
			{ name: 'COSMO.jl',        github: 'https://github.com/oxfordcontrol/COSMO.jl',    papers: [] },
			{ name: 'SCS.jl',          github: 'https://github.com/jump-dev/SCS.jl',           papers: [] },
		],
		notebookSections: MPSOS_NOTEBOOK_SECTIONS,
		notebooks: MPSOS_NOTEBOOK_SECTIONS.flatMap(s => s.notebooks),
		wikis: [
			{ name: 'Factsheet',      file: 'mpsos/factsheet.md',      bundled: true },
			{ name: 'Overview',       file: 'mpsos/overview.md',       bundled: true },
			{ name: 'Assumptions',    file: 'mpsos/assumptions.md',    bundled: true },
			{ name: 'Diagnostics',    file: 'mpsos/diagnostics.md',    bundled: true },
			{ name: 'Interpretation', file: 'mpsos/interpretation.md', bundled: true },
			{ name: 'Decision Guide', file: 'mpsos/decision-guide.md', bundled: true },
			{ separator: true, label: 'Methods' },
			{ name: 'Sum of Squares Certification',          file: 'mpsos/sos.md',     bundled: true },
			{ name: 'Polynomial Optimisation',  file: 'mpsos/polyopt.md', bundled: true },
			{ separator: true, label: 'Topics' },
			{ name: 'Lasserre Hierarchy',  file: 'mpsos/lasserre.md', bundled: true },
			{ name: 'Duality',             file: 'mpsos/duality.md',  bundled: true },
		],
		references: MPSOS_REFERENCES,
	},
};

export function openMpsosWebview(
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
			title: MPSOS_TITLE,
			options: { retainContextWhenHidden: true },
			contentOptions: { allowScripts: true },
			extension: undefined,
		},
		MPSOS_VIEW_TYPE,
		MPSOS_TITLE,
		undefined,
		{ group: undefined, preserveFocus: false }
	);

	webviewInput.webview.setHtml(getMpsosHtml());

	registerMpsosWebviewHandlers(
		webviewInput,
		MPSOS_METADATA,
		openerService,
		editorService,
		quickInputService,
		commandService,
		clipboardService,
		notificationService,
		initialModel,
	);
}
