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
import { IMpecMetadata } from '../common/mpec.types.js';
import { registerMpecWebviewHandlers } from '../handlers/mpec.handler.js';
import { getMpecHtml } from '../webviews/mpec.template.js';

const MPEC_VIEW_TYPE = 'pollis.mpec';
const MPEC_TITLE = 'Mathematical Programming with Equilibrium Constraints';

const MPEC_REFERENCES: IModelReference[] = [
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
		title: 'Mathematical Programs with Equilibrium Constraints',
		authors: 'Luo, Zhi-Quan; Pang, Jong-Shi; Ralph, Daniel',
		year: 1996,
		journal: 'Cambridge University Press',
		doi: '10.1017/CBO9780511983658',
		openAccess: false,
	},
	{
		title: 'Finite-Dimensional Variational Inequalities and Complementarity Problems',
		authors: 'Facchinei, Francisco; Pang, Jong-Shi',
		year: 2003,
		journal: 'Springer (Vol. I & II)',
		openAccess: false,
	},
	{ separator: true, label: 'Original Papers' },
	{
		title: 'Engineering and Economic Applications of Complementarity Problems',
		authors: 'Ferris, Michael C.; Pang, Jong-Shi',
		year: 1997,
		journal: 'SIAM Review',
		doi: '10.1137/S0036144595285963',
		openAccess: false,
	},
	{
		title: 'Mathematical Programs with Complementarity Constraints: Stationarity, Optimality, and Sensitivity',
		authors: 'Scheel, Holger; Scholtes, Stefan',
		year: 2000,
		journal: 'Mathematics of Operations Research',
		doi: '10.1287/moor.25.1.1.15213',
		openAccess: false,
	},
];

export const MPEC_NOTEBOOK_SECTIONS: IModelNotebookSection[] = [
	{
		label: '',
		notebooks: [
			{
				name: 'MPEC',
				file: 'mpec/tutorial-01-mpec.ipynb',
				bundled: true,
				description: 'Optimise an outer objective subject to complementarity constraints via Complementarity.jl and PATHSolver; models network design and regulatory pricing',
			},
		],
	},
];

const MPEC_METADATA: IMpecMetadata = {
	mpec: {
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
		notebookSections: MPEC_NOTEBOOK_SECTIONS,
		notebooks: MPEC_NOTEBOOK_SECTIONS.flatMap(s => s.notebooks),
		wikis: [
			{ name: 'Factsheet',      file: 'mpec/factsheet.md',      bundled: true },
			{ name: 'Overview',       file: 'mpec/overview.md',        bundled: true },
			{ name: 'Assumptions',    file: 'mpec/assumptions.md',     bundled: true },
			{ name: 'Diagnostics',    file: 'mpec/diagnostics.md',     bundled: true },
			{ name: 'Interpretation', file: 'mpec/interpretation.md',  bundled: true },
			{ name: 'Decision Guide', file: 'mpec/decision-guide.md',  bundled: true },
			{ separator: true, label: 'Formulation' },
			{ name: 'MPEC', file: 'mpec/mpec.md', bundled: true },
		],
		references: MPEC_REFERENCES,
	},
};

export function openMpecWebview(
	webviewWorkbenchService: IWebviewWorkbenchService,
	openerService: IOpenerService,
	editorService: IEditorService,
	quickInputService: IQuickInputService,
	commandService: ICommandService,
	clipboardService: IClipboardService,
	notificationService: INotificationService,
): void {
	const webviewInput = webviewWorkbenchService.openWebview(
		{
			title: MPEC_TITLE,
			options: { retainContextWhenHidden: true },
			contentOptions: { allowScripts: true },
			extension: undefined,
		},
		MPEC_VIEW_TYPE,
		MPEC_TITLE,
		undefined,
		{ group: undefined, preserveFocus: false }
	);

	webviewInput.webview.setHtml(getMpecHtml());

	registerMpecWebviewHandlers(
		webviewInput,
		MPEC_METADATA,
		openerService,
		editorService,
		quickInputService,
		commandService,
		clipboardService,
		notificationService,
	);
}
