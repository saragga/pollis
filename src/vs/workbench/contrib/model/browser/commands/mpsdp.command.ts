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
import { IMpsdpMetadata } from '../common/mpsdp.types.js';
import { IModelReference, IModelNotebookSection } from '../common/model.types.js';
import { registerMpsdpWebviewHandlers } from '../handlers/mpsdp.handler.js';
import { getMpsdpHtml } from '../webviews/mpsdp.template.js';

const MPSDP_VIEW_TYPE = 'pollis.mpsdp';
const MPSDP_TITLE = 'Semidefinite Programming';

const MPSDP_REFERENCES: IModelReference[] = [
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
	{
		title: 'Hypatia.jl: Conic Interior Point Solver',
		authors: 'Coey, Chris; Kapelevich, Lea; Vielma, Juan Pablo',
		year: 2023,
		journal: 'INFORMS Journal on Computing',
		doi: '10.1287/ijoc.2022.1291',
		openAccess: true,
	},
	{ separator: true, label: 'Textbooks' },
	{
		title: 'Convex Optimization',
		authors: 'Boyd, Stephen; Vandenberghe, Lieven',
		year: 2004,
		journal: 'Cambridge University Press',
		url: 'https://web.stanford.edu/~boyd/cvxbook/',
		openAccess: true,
	},
	{
		title: 'Semidefinite Programming',
		authors: 'Vandenberghe, Lieven; Boyd, Stephen',
		year: 1996,
		journal: 'SIAM Review',
		doi: '10.1137/1038016',
		openAccess: false,
	},
	{ separator: true, label: 'Original Papers' },
	{
		title: 'Improved Approximation Algorithms for Maximum Cut and Satisfiability Problems Using Semidefinite Programming',
		authors: 'Goemans, Michel X.; Williamson, David P.',
		year: 1995,
		journal: 'Journal of the ACM',
		doi: '10.1145/227683.227684',
		openAccess: false,
	},
	{
		title: 'Interior-Point Polynomial Algorithms in Convex Programming',
		authors: 'Nesterov, Yurii; Nemirovskii, Arkadii',
		year: 1994,
		journal: 'SIAM',
		doi: '10.1137/1.9781611970791',
		openAccess: false,
	},
];

export const MPSDP_NOTEBOOK_SECTIONS: IModelNotebookSection[] = [
	{
		label: 'Semidefinite Programming',
		notebooks: [
			{ name: 'Basic SDP', file: 'mpsdp/tutorial-01-basic-sdp.ipynb', bundled: true, description: 'Formulate and solve a basic SDP with Clarabel; matrix constraints and duality' },
		],
	},
	{
		label: 'SDP Relaxations',
		notebooks: [
			{ name: 'Max-Cut SDP', file: 'mpsdp/tutorial-02-maxcut-sdp.ipynb', bundled: true, description: 'Goemans-Williamson SDP relaxation of max-cut; rounding to a 0.878-approximation' },
		],
	},
];

const MPSDP_METADATA: IMpsdpMetadata = {
	mpsdp: {
		packages: [
			{ name: 'JuMP.jl',     github: 'https://github.com/jump-dev/JuMP.jl',           papers: [] },
			{ name: 'Clarabel.jl', github: 'https://github.com/oxfordcontrol/Clarabel.jl',   papers: [] },
			{ name: 'COSMO.jl',    github: 'https://github.com/oxfordcontrol/COSMO.jl',      papers: [] },
			{ name: 'SCS.jl',      github: 'https://github.com/jump-dev/SCS.jl',             papers: [] },
			{ name: 'Hypatia.jl',  github: 'https://github.com/jump-dev/Hypatia.jl',         papers: [] },
		],
		notebookSections: MPSDP_NOTEBOOK_SECTIONS,
		notebooks: MPSDP_NOTEBOOK_SECTIONS.flatMap(s => s.notebooks),
		wikis: [
			{ name: 'Factsheet',      file: 'mpsdp/factsheet.md',      bundled: true },
			{ name: 'Overview',       file: 'mpsdp/overview.md',       bundled: true },
			{ name: 'Assumptions',    file: 'mpsdp/assumptions.md',    bundled: true },
			{ name: 'Diagnostics',    file: 'mpsdp/diagnostics.md',    bundled: true },
			{ name: 'Interpretation', file: 'mpsdp/interpretation.md', bundled: true },
			{ name: 'Decision Guide', file: 'mpsdp/decision-guide.md', bundled: true },
			{ separator: true, label: 'Methods' },
			{ name: 'SDP',             file: 'mpsdp/sdp.md',      bundled: true },
			{ name: 'SDP Relaxations', file: 'mpsdp/sdprelax.md', bundled: true },
			{ separator: true, label: 'Topics' },
			{ name: 'LMI Constraints', file: 'mpsdp/lmi.md',     bundled: true },
			{ name: 'Duality',         file: 'mpsdp/duality.md', bundled: true },
		],
		references: MPSDP_REFERENCES,
	},
};

export function openMpsdpWebview(
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
			title: MPSDP_TITLE,
			options: { retainContextWhenHidden: true },
			contentOptions: { allowScripts: true },
			extension: undefined,
		},
		MPSDP_VIEW_TYPE,
		MPSDP_TITLE,
		undefined,
		{ group: undefined, preserveFocus: false }
	);

	webviewInput.webview.setHtml(getMpsdpHtml());

	registerMpsdpWebviewHandlers(
		webviewInput,
		MPSDP_METADATA,
		openerService,
		editorService,
		quickInputService,
		commandService,
		clipboardService,
		notificationService,
		initialModel,
	);
}
