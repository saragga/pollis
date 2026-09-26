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
import { ITrajMetadata } from '../common/traj.types.js';
import { IModelReference } from '../common/model.types.js';
import { registerTrajWebviewHandlers } from '../handlers/traj.handler.js';
import { getTrajHtml } from '../webviews/traj.template.js';

const TRAJ_VIEW_TYPE = 'pollis.traj';
const TRAJ_TITLE = 'Trajectory Optimisation';

const TRAJ_REFERENCES: IModelReference[] = [
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
		title: 'TrajectoryOptimization.jl: A Julia Package for Motion Planning',
		authors: 'Jackson, Brian E.; Fong, Ethan; Howell, Taylor A.; Maric, Filip',
		year: 2021,
		journal: 'Journal of Open Source Software',
		doi: '10.21105/joss.03153',
		openAccess: true,
	},
	{ separator: true, label: 'Textbooks' },
	{
		title: 'Optimal Control: An Introduction',
		authors: 'Kirk, Donald E.',
		year: 2012,
		journal: 'Dover Publications',
		url: 'https://doverpublications.com/',
		openAccess: false,
	},
	{
		title: 'Nonlinear Dynamics and Chaos',
		authors: 'Strogatz, Steven H.',
		year: 2015,
		journal: 'Westview Press (2nd ed.)',
		openAccess: false,
	},
	{ separator: true, label: 'Original Papers' },
	{
		title: 'Differential Dynamic Programming and Newton\'s Method for Discrete Optimal Control Problems',
		authors: 'Jacobson, David H.; Mayne, David Q.',
		year: 1970,
		journal: 'Journal of Mathematical Analysis and Applications',
		doi: '10.1016/0022-247X(70)90272-X',
		openAccess: false,
	},
	{
		title: 'A Differential Dynamic Programming Framework for Optimal Control of Smooth Rigid Body Systems',
		authors: 'Tassa, Yuval; Erez, Tom; Todorov, Emanuel',
		year: 2012,
		journal: 'IEEE Transactions on Automatic Control',
		doi: '10.1109/TAC.2012.2195830',
		openAccess: false,
	},
];

const TRAJ_METADATA: ITrajMetadata = {
	traj: {
		packages: [
			{
				name: 'TrajectoryOptimization.jl',
				github: 'https://github.com/RoboticExplorationLab/TrajectoryOptimization.jl',
				videos: [
					{
						title: 'Trajectory Optimization in Julia',
						description: 'Introduction to trajectory optimization methods and tools',
						url: 'https://www.youtube.com/watch?v=wPFPT-Ech2c',
					},
				],
				papers: [],
			},
			{
				name: 'Altro.jl',
				github: 'https://github.com/RoboticExplorationLab/Altro.jl',
				videos: [],
				papers: [],
			},
		],
		references: TRAJ_REFERENCES,
		notebooks: [
			{ name: 'Direct Methods (DIRCOL)', file: 'trajectory-optimization/tutorial-01-direct.ipynb', bundled: true, description: 'Direct collocation: transcribe continuous trajectory to finite-dimensional NLP' },
			{ name: 'Indirect Methods (iLQR)', file: 'trajectory-optimization/tutorial-02-ilqr.ipynb', bundled: true, description: 'Iterative LQR: local trajectory refinement via successive quadratic approximation' },
			{ name: 'Differential Dynamic Programming (DDP)', file: 'trajectory-optimization/tutorial-03-ddp.ipynb', bundled: true, description: 'Second-order trajectory optimization with backward-forward sweep' },
			{ name: 'ALTRO Algorithm', file: 'trajectory-optimization/tutorial-04-altro.ipynb', bundled: true, description: 'Augmented Lagrangian trajectory optimizer combining DDP with constraint handling' },
		],
		wikis: [
			{ name: 'Factsheet',      file: 'trajectory-optimization/factsheet.md',      bundled: true },
			{ name: 'Overview',       file: 'trajectory-optimization/overview.md',       bundled: true },
			{ name: 'Assumptions',    file: 'trajectory-optimization/assumptions.md',    bundled: true },
			{ name: 'Diagnostics',    file: 'trajectory-optimization/diagnostics.md',    bundled: true },
			{ name: 'Interpretation', file: 'trajectory-optimization/interpretation.md', bundled: true },
			{ name: 'Decision Guide', file: 'trajectory-optimization/decision-guide.md', bundled: true },
			{ separator: true, label: 'Trajectory Methods' },
			{ name: 'Direct Methods', file: 'trajectory-optimization/direct.md', bundled: true },
			{ name: 'Indirect Methods', file: 'trajectory-optimization/indirect.md', bundled: true },
			{ name: 'DDP', file: 'trajectory-optimization/ddp.md', bundled: true },
			{ name: 'ALTRO', file: 'trajectory-optimization/altro.md', bundled: true },
		],
	},
};

export function openTrajWebview(
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
			title: TRAJ_TITLE,
			options: { retainContextWhenHidden: true },
			contentOptions: { allowScripts: true },
			extension: undefined,
		},
		TRAJ_VIEW_TYPE,
		TRAJ_TITLE,
		undefined,
		{ group: undefined, preserveFocus: false }
	);

	webviewInput.webview.setHtml(getTrajHtml());

	registerTrajWebviewHandlers(
		webviewInput,
		TRAJ_METADATA,
		openerService,
		editorService,
		quickInputService,
		commandService,
		clipboardService,
		notificationService,
		initialModel,
	);
}
