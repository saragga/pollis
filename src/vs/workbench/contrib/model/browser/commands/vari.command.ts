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
import { IVariMetadata } from '../common/vari.types.js';
import { registerVariWebviewHandlers } from '../handlers/vari.handler.js';
import { getVariHtml } from '../webviews/vari.template.js';

const VARI_VIEW_TYPE = 'pollis.vari';
const VARI_TITLE = 'Variational Inequalities';

const VARI_REFERENCES: IModelReference[] = [
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
		title: 'An Introduction to Variational Inequalities and Their Applications',
		authors: 'Kinderlehrer, David; Stampacchia, Guido',
		year: 1980,
		journal: 'SIAM',
		doi: '10.1137/1.9780898719451',
		openAccess: false,
	},
	{ separator: true, label: 'Original Papers' },
	{
		title: 'On some non-linear elliptic differential-functional equations',
		authors: 'Hartman, Philip; Stampacchia, Guido',
		year: 1966,
		journal: 'Acta Mathematica',
		doi: '10.1007/BF02392214',
		openAccess: false,
	},
	{
		title: 'The Traffic Assignment Problem for a General Network',
		authors: 'Dafermos, Stella C.; Sparrow, Frederick T.',
		year: 1969,
		journal: 'Journal of Research of the National Bureau of Standards',
		doi: '10.6028/jres.073B.023',
		openAccess: false,
	},
];

export const VARI_NOTEBOOK_SECTIONS: IModelNotebookSection[] = [
	{
		label: '',
		notebooks: [
			{
				name: 'Variational Inequality',
				file: 'vari/tutorial-01-vi.ipynb',
				bundled: true,
				description: 'Find x* in K with F(x*)^T(y - x*) >= 0 for all y in K via MCP reformulation and PATHSolver',
			},
			{
				name: 'Quasi-Variational Inequality',
				file: 'vari/tutorial-02-qvi.ipynb',
				bundled: true,
				description: 'Find x* in K(x*) satisfying the QVI condition; state-dependent constraint set via fixed-point iteration',
			},
		],
	},
];

const VARI_METADATA: IVariMetadata = {
	vari: {
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
		notebookSections: VARI_NOTEBOOK_SECTIONS,
		notebooks: VARI_NOTEBOOK_SECTIONS.flatMap(s => s.notebooks),
		wikis: [
			{ name: 'Factsheet',      file: 'vari/factsheet.md',      bundled: true },
			{ name: 'Overview',       file: 'vari/overview.md',        bundled: true },
			{ name: 'Assumptions',    file: 'vari/assumptions.md',     bundled: true },
			{ name: 'Diagnostics',    file: 'vari/diagnostics.md',     bundled: true },
			{ name: 'Interpretation', file: 'vari/interpretation.md',  bundled: true },
			{ name: 'Decision Guide', file: 'vari/decision-guide.md',  bundled: true },
			{ separator: true, label: 'Problems' },
			{ name: 'Variational Inequality (VI)',       file: 'vari/vi.md',  bundled: true },
			{ name: 'Quasi-Variational Inequality (QVI)', file: 'vari/qvi.md', bundled: true },
		],
		references: VARI_REFERENCES,
	},
};

export function openVariWebview(
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
			title: VARI_TITLE,
			options: { retainContextWhenHidden: true },
			contentOptions: { allowScripts: true },
			extension: undefined,
		},
		VARI_VIEW_TYPE,
		VARI_TITLE,
		undefined,
		{ group: undefined, preserveFocus: false }
	);

	webviewInput.webview.setHtml(getVariHtml());

	registerVariWebviewHandlers(
		webviewInput,
		VARI_METADATA,
		openerService,
		editorService,
		quickInputService,
		commandService,
		clipboardService,
		notificationService,
		initialModel,
	);
}
