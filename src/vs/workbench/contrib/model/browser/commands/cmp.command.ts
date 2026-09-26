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
import { ICmpMetadata } from '../common/cmp.types.js';
import { registerCmpWebviewHandlers } from '../handlers/cmp.handler.js';
import { getCmpHtml } from '../webviews/cmp.template.js';

const CMP_VIEW_TYPE = 'pollis.cmp';
const CMP_TITLE = 'Complementarity Problems';

const CMP_REFERENCES: IModelReference[] = [
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
		title: 'Complementarity.jl: Modeling and Solving Complementarity Problems in Julia',
		authors: 'Chung, Changhyun',
		year: 2023,
		journal: 'GitHub',
		url: 'https://github.com/chkwon/Complementarity.jl',
		openAccess: true,
	},
	{
		title: 'PATH Solver: A Non-Monotone Stabilisation Scheme for the Solution of Nonlinear Complementarity Problems',
		authors: 'Dirkse, Steven P.; Ferris, Michael C.',
		year: 1995,
		journal: 'Mathematical Programming',
		doi: '10.1007/BF02592958',
		openAccess: false,
	},
	{ separator: true, label: 'Textbooks' },
	{
		title: 'Finite-Dimensional Variational Inequalities and Complementarity Problems',
		authors: 'Facchinei, Francisco; Pang, Jong-Shi',
		year: 2003,
		journal: 'Springer (Vol. I & II)',
		openAccess: false,
	},
	{
		title: 'Complementarity Problems',
		authors: 'Isac, George',
		year: 1992,
		journal: 'Springer Lecture Notes in Mathematics',
		doi: '10.1007/BFb0084653',
		openAccess: false,
	},
	{ separator: true, label: 'Original Papers' },
	{
		title: 'The Linear Complementarity Problem',
		authors: 'Cottle, Richard W.; Pang, Jong-Shi; Stone, Richard E.',
		year: 1992,
		journal: 'SIAM Classics in Applied Mathematics',
		doi: '10.1137/1.9780898719000',
		openAccess: false,
	},
	{
		title: 'Engineering and Economic Applications of Complementarity Problems',
		authors: 'Ferris, Michael C.; Pang, Jong-Shi',
		year: 1997,
		journal: 'SIAM Review',
		doi: '10.1137/S0036144595285963',
		openAccess: false,
	},
];

export const CMP_NOTEBOOK_SECTIONS: IModelNotebookSection[] = [
	{
		label: '',
		notebooks: [
			{
				name: 'Linear Complementarity',
				file: 'cmp/tutorial-01-lcp.ipynb',
				bundled: true,
				description: 'Solve the LCP (Mx + q ≥ 0, x ≥ 0, complementarity) via Complementarity.jl and PATHSolver',
			},
			{
				name: 'Nonlinear Complementarity',
				file: 'cmp/tutorial-02-ncp.ipynb',
				bundled: true,
				description: 'Solve the NCP (F(x) ≥ 0, x ≥ 0, complementarity) for nonlinear operator F via PATH',
			},
			{
				name: 'Mixed Complementarity',
				file: 'cmp/tutorial-03-mcp.ipynb',
				bundled: true,
				description: 'Solve the MCP with box constraints lb ≤ x ≤ ub; models general equilibrium and traffic assignment',
			},
		],
	},
];

const CMP_METADATA: ICmpMetadata = {
	cmp: {
		packages: [
			{
				name: 'Complementarity.jl',
				github: 'https://github.com/chkwon/Complementarity.jl',
				papers: [],
			},
			{
				name: 'PATHSolver.jl',
				github: 'https://github.com/chkwon/PATHSolver.jl',
				papers: [],
			},
		],
		notebookSections: CMP_NOTEBOOK_SECTIONS,
		notebooks: CMP_NOTEBOOK_SECTIONS.flatMap(s => s.notebooks),
		wikis: [
			{ name: 'Factsheet',      file: 'cmp/factsheet.md',      bundled: true },
			{ name: 'Overview',       file: 'cmp/overview.md',        bundled: true },
			{ name: 'Assumptions',    file: 'cmp/assumptions.md',     bundled: true },
			{ name: 'Diagnostics',    file: 'cmp/diagnostics.md',     bundled: true },
			{ name: 'Interpretation', file: 'cmp/interpretation.md',  bundled: true },
			{ name: 'Decision Guide', file: 'cmp/decision-guide.md',  bundled: true },
			{ separator: true, label: 'Problems' },
			{ name: 'Linear Complementarity (LCP)',    file: 'cmp/lcp.md', bundled: true },
			{ name: 'Nonlinear Complementarity (NCP)', file: 'cmp/ncp.md', bundled: true },
			{ name: 'Mixed Complementarity (MCP)',     file: 'cmp/mcp.md', bundled: true },
		],
		references: CMP_REFERENCES,
	},
};

export function openCmpWebview(
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
			title: CMP_TITLE,
			options: { retainContextWhenHidden: true },
			contentOptions: { allowScripts: true },
			extension: undefined,
		},
		CMP_VIEW_TYPE,
		CMP_TITLE,
		undefined,
		{ group: undefined, preserveFocus: false }
	);

	webviewInput.webview.setHtml(getCmpHtml());

	registerCmpWebviewHandlers(
		webviewInput,
		CMP_METADATA,
		openerService,
		editorService,
		quickInputService,
		commandService,
		clipboardService,
		notificationService,
		initialModel,
	);
}
