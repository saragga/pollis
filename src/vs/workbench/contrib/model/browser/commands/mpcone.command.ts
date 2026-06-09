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
import { IMpconeMetadata } from '../common/mpcone.types.js';
import { IModelReference, IModelNotebookSection } from '../common/model.types.js';
import { registerMpconeWebviewHandlers } from '../handlers/mpcone.handler.js';
import { getMpconeHtml } from '../webviews/mpcone.template.js';

const MPCONE_VIEW_TYPE = 'pollis.mpcone';
const MPCONE_TITLE = 'Convex and Conic Programming';

const MPCONE_REFERENCES: IModelReference[] = [
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
		title: 'ECOS: An SOCP Solver for Embedded Systems',
		authors: 'Domahidi, Alexander; Chu, Eric; Boyd, Stephen',
		year: 2013,
		journal: 'European Control Conference',
		url: 'https://ieeexplore.ieee.org/document/6669541',
		openAccess: false,
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
		title: 'Convex Optimization',
		authors: 'Boyd, Stephen; Vandenberghe, Lieven',
		year: 2004,
		journal: 'Cambridge University Press',
		url: 'https://web.stanford.edu/~boyd/cvxbook/',
		openAccess: true,
	},
	{
		title: 'Lectures on Modern Convex Optimization',
		authors: 'Ben-Tal, Aharon; Nemirovski, Arkadi',
		year: 2001,
		journal: 'SIAM',
		doi: '10.1137/1.9780898718829',
		openAccess: false,
	},
	{ separator: true, label: 'Original Papers' },
	{
		title: 'Interior-Point Polynomial Algorithms in Convex Programming',
		authors: 'Nesterov, Yurii; Nemirovskii, Arkadii',
		year: 1994,
		journal: 'SIAM',
		doi: '10.1137/1.9781611970791',
		openAccess: false,
	},
	{
		title: 'Applications of Second-Order Cone Programming',
		authors: 'Lobo, Miguel Sousa; Vandenberghe, Lieven; Boyd, Stephen; Lebret, Herve',
		year: 1998,
		journal: 'Linear Algebra and its Applications',
		doi: '10.1016/S0024-3795(98)10032-0',
		openAccess: false,
	},
];

export const MPCONE_NOTEBOOK_SECTIONS: IModelNotebookSection[] = [
	{
		label: 'Convex Programming',
		notebooks: [
			{ name: 'Basic Convex',   file: 'mpcone/tutorial-01-basic-convex.ipynb',   bundled: true, description: 'Formulate and solve a smooth convex programme with Clarabel' },
		],
	},
	{
		label: 'Cone Programming',
		notebooks: [
			{ name: 'SOCP',           file: 'mpcone/tutorial-02-socp.ipynb',           bundled: true, description: 'Second-order cone constraints; norm minimisation and robust problems' },
			{ name: 'Exponential Cone', file: 'mpcone/tutorial-03-exp-cone.ipynb',       bundled: true, description: 'Exponential cone programming; entropy and geometric programmes' },
			{ name: 'Power Cone',     file: 'mpcone/tutorial-04-power-cone.ipynb',     bundled: true, description: 'Power cone programming; p-norms and geometric means' },
		],
	},
];

const MPCONE_METADATA: IMpconeMetadata = {
	mpcone: {
		packages: [
			{ name: 'JuMP.jl',      github: 'https://github.com/jump-dev/JuMP.jl',           papers: [] },
			{ name: 'Clarabel.jl',  github: 'https://github.com/oxfordcontrol/Clarabel.jl',  papers: [] },
			{ name: 'COSMO.jl',     github: 'https://github.com/oxfordcontrol/COSMO.jl',     papers: [] },
			{ name: 'SCS.jl',       github: 'https://github.com/jump-dev/SCS.jl',            papers: [] },
			{ name: 'ECOS.jl',      github: 'https://github.com/jump-dev/ECOS.jl',           papers: [] },
		],
		notebookSections: MPCONE_NOTEBOOK_SECTIONS,
		notebooks: MPCONE_NOTEBOOK_SECTIONS.flatMap(s => s.notebooks),
		wikis: [
			{ name: 'Factsheet',      file: 'mpcone/factsheet.md',      bundled: true },
			{ name: 'Overview',       file: 'mpcone/overview.md',       bundled: true },
			{ name: 'Assumptions',    file: 'mpcone/assumptions.md',    bundled: true },
			{ name: 'Diagnostics',    file: 'mpcone/diagnostics.md',    bundled: true },
			{ name: 'Interpretation', file: 'mpcone/interpretation.md', bundled: true },
			{ name: 'Decision Guide', file: 'mpcone/decision-guide.md', bundled: true },
			{ separator: true, label: 'Methods' },
			{ name: 'Convex Programming', file: 'mpcone/convex.md',    bundled: true },
			{ name: 'SOCP',               file: 'mpcone/socp.md',      bundled: true },
			{ name: 'Exponential Cone',   file: 'mpcone/expcone.md',   bundled: true },
			{ name: 'Power Cone',         file: 'mpcone/powcone.md',   bundled: true },
			{ separator: true, label: 'Topics' },
			{ name: 'Duality',            file: 'mpcone/duality.md',   bundled: true },
			{ name: 'Interior Point',     file: 'mpcone/ipm.md',       bundled: true },
		],
		references: MPCONE_REFERENCES,
	},
};

export function openMpconeWebview(
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
			title: MPCONE_TITLE,
			options: { retainContextWhenHidden: true },
			contentOptions: { allowScripts: true },
			extension: undefined,
		},
		MPCONE_VIEW_TYPE,
		MPCONE_TITLE,
		undefined,
		{ group: undefined, preserveFocus: false }
	);

	webviewInput.webview.setHtml(getMpconeHtml());

	registerMpconeWebviewHandlers(
		webviewInput,
		MPCONE_METADATA,
		openerService,
		editorService,
		quickInputService,
		commandService,
		clipboardService,
		notificationService,
		initialModel,
	);
}
