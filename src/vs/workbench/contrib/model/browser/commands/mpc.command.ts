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
import { IMpcMetadata } from '../common/mpc.types.js';
import { IModelReference } from '../common/model.types.js';
import { registerMpcWebviewHandlers } from '../handlers/mpc.handler.js';
import { getMpcHtml } from '../webviews/mpc.template.js';

const MPC_VIEW_TYPE = 'pollis.mpc';
const MPC_TITLE = 'Model Predictive Control';

const MPC_REFERENCES: IModelReference[] = [
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
		title: 'ModelPredictiveControl.jl: A Unified Predictive Control Toolbox for Julia',
		authors: 'Desbiens, Francis; Ozorio Cassol, Guilherme',
		year: 2024,
		journal: 'Journal of Open Source Software',
		doi: '10.21105/joss.06171',
		openAccess: true,
	},
	{ separator: true, label: 'Textbooks' },
	{
		title: 'Model Predictive Control: Theory, Computation, and Design',
		authors: 'Rawlings, James B.; Mayne, David Q.; Diehl, Moritz M.',
		year: 2017,
		journal: 'Nob Hill Publishing (2nd ed.)',
		url: 'https://sites.engineering.ucsb.edu/~jbraw/mpc/',
		openAccess: true,
	},
	{
		title: 'Predictive Control with Constraints',
		authors: 'Maciejowski, Jan M.',
		year: 2002,
		journal: 'Pearson Education',
		openAccess: false,
	},
	{ separator: true, label: 'Original Papers' },
	{
		title: 'Receding Horizon Control of Nonlinear Systems',
		authors: 'Mayne, David Q.; Michalska, H.',
		year: 1990,
		journal: 'IEEE Transactions on Automatic Control',
		doi: '10.1109/9.57020',
		openAccess: false,
	},
	{
		title: 'Constrained Model Predictive Control: Stability and Optimality',
		authors: 'Mayne, David Q.; Rawlings, James B.; Rao, Christopher V.; Scokaert, Pierre O. M.',
		year: 2000,
		journal: 'Automatica',
		doi: '10.1016/S0005-1098(99)00214-9',
		openAccess: false,
	},
];

const MPC_METADATA: IMpcMetadata = {
	mpc: {
		packages: [
			{
				name: 'ModelPredictiveControl.jl',
				github: 'https://github.com/JuliaControl/ModelPredictiveControl.jl',
				videos: [],
				papers: [],
			},
		],
		references: MPC_REFERENCES,
		notebooks: [
			{ name: 'Linear MPC Design', file: 'mpc/tutorial-01-linmpc.ipynb', bundled: true, description: 'Build and simulate a LinMPC controller with QP solver' },
			{ name: 'Nonlinear MPC Design', file: 'mpc/tutorial-02-nonlinmpc.ipynb', bundled: true, description: 'Build and simulate a NonLinMPC controller with NLP solver' },
			{ name: 'Constraint Handling', file: 'mpc/tutorial-03-constraints.ipynb', bundled: true, description: 'State and input constraints via setconstraint!()' },
			{ name: 'Disturbance Rejection', file: 'mpc/tutorial-04-disturbance.ipynb', bundled: true, description: 'Offset-free tracking with integrated disturbance model' },
		],
		wikis: [
			{ name: 'Factsheet',      file: 'mpc/factsheet.md',      bundled: true },
			{ name: 'Overview',       file: 'mpc/overview.md',       bundled: true },
			{ name: 'Assumptions',    file: 'mpc/assumptions.md',    bundled: true },
			{ name: 'Diagnostics',    file: 'mpc/diagnostics.md',    bundled: true },
			{ name: 'Interpretation', file: 'mpc/interpretation.md', bundled: true },
			{ name: 'Decision Guide', file: 'mpc/decision-guide.md', bundled: true },
			{ separator: true, label: 'MPC Variants' },
			{ name: 'Linear MPC',    file: 'mpc/linmpc.md',    bundled: true },
			{ name: 'Nonlinear MPC', file: 'mpc/nonlinmpc.md', bundled: true },
		],
	},
};

export function openMpcWebview(
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
			title: MPC_TITLE,
			options: { retainContextWhenHidden: true },
			contentOptions: { allowScripts: true },
			extension: undefined,
		},
		MPC_VIEW_TYPE,
		MPC_TITLE,
		undefined,
		{ group: undefined, preserveFocus: false }
	);

	webviewInput.webview.setHtml(getMpcHtml());

	registerMpcWebviewHandlers(
		webviewInput,
		MPC_METADATA,
		openerService,
		editorService,
		quickInputService,
		commandService,
		clipboardService,
		notificationService,
		initialModel,
	);
}
