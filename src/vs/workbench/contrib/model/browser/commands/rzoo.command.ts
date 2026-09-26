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
import { IRzooMetadata } from '../common/rzoo.types.js';
import { IModelReference } from '../common/model.types.js';
import { registerRzooWebviewHandlers } from '../handlers/rzoo.handler.js';
import { getRzooHtml } from '../webviews/rzoo.template.js';

const RZOO_VIEW_TYPE = 'pollis.rzoo';
const RZOO_TITLE = 'RobotZoo — Robot Model Library';

const RZOO_REFERENCES: IModelReference[] = [
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
		title: 'RobotZoo.jl: A Collection of Common Robot Models in Julia',
		authors: 'Howell, Taylor; Jackson, Brian; Manchester, Zachary',
		year: 2020,
		journal: 'GitHub',
		url: 'https://github.com/RoboticExplorationLab/RobotZoo.jl',
		openAccess: true,
	},
	{
		title: 'RobotDynamics.jl: Flexible Rigid Body Dynamics in Julia',
		authors: 'Howell, Taylor; Jackson, Brian; Manchester, Zachary',
		year: 2019,
		journal: 'GitHub',
		url: 'https://github.com/RoboticExplorationLab/RobotDynamics.jl',
		openAccess: true,
	},
	{ separator: true, label: 'Textbooks' },
	{
		title: 'Robot Modeling and Control',
		authors: 'Spong, Mark W.; Hutchinson, Seth; Vidyasagar, M.',
		year: 2005,
		journal: 'Wiley',
		openAccess: false,
	},
	{
		title: 'A Mathematical Introduction to Robotic Manipulation',
		authors: 'Murray, Richard M.; Li, Zexiang; Sastry, S. Shankar',
		year: 1994,
		journal: 'CRC Press',
		url: 'https://www.cds.caltech.edu/~murray/mlswiki/',
		openAccess: true,
	},
	{ separator: true, label: 'Original Papers' },
	{
		title: 'ALTRO: A Fast Solver for Constrained Trajectory Optimization',
		authors: 'Howell, Taylor A.; Jackson, Brian E.; Manchester, Zachary',
		year: 2019,
		journal: 'IEEE/RSJ IROS',
		doi: '10.1109/IROS40897.2019.8967788',
		openAccess: true,
	},
	{
		title: 'Minimum Snap Trajectory Generation and Control for Quadrotors',
		authors: 'Mellinger, Daniel; Kumar, Vijay',
		year: 2011,
		journal: 'IEEE ICRA',
		doi: '10.1109/ICRA.2011.5980409',
		openAccess: false,
	},
];

const RZOO_METADATA: IRzooMetadata = {
	rzoo: {
		packages: [
			{
				name: 'RobotZoo.jl',
				github: 'https://github.com/RoboticExplorationLab/RobotZoo.jl',
				videos: [],
				papers: [],
			},
			{
				name: 'RobotDynamics.jl',
				github: 'https://github.com/RoboticExplorationLab/RobotDynamics.jl',
				videos: [],
				papers: [],
			},
		],
		references: RZOO_REFERENCES,
		notebooks: [
			{ name: 'Pendulum', file: 'rzoo/tutorial-01-pendulum.ipynb', bundled: true, description: 'Single inverted pendulum: swing-up and balance benchmark' },
			{ name: 'Cart-Pole', file: 'rzoo/tutorial-02-cartpole.ipynb', bundled: true, description: 'Underactuated cart-pole: classic benchmark for trajectory optimisation' },
			{ name: 'Bicycle Model', file: 'rzoo/tutorial-03-bicycle.ipynb', bundled: true, description: 'Kinematic bicycle model for ground vehicle path planning' },
			{ name: 'Quadrotor', file: 'rzoo/tutorial-04-quadrotor.ipynb', bundled: true, description: 'Six-DOF quadrotor dynamics with quaternion attitude representation' },
		],
		wikis: [
			{ name: 'Factsheet',      file: 'rzoo/factsheet.md',      bundled: true },
			{ name: 'Overview',       file: 'rzoo/overview.md',       bundled: true },
			{ name: 'Assumptions',    file: 'rzoo/assumptions.md',    bundled: true },
			{ name: 'Diagnostics',    file: 'rzoo/diagnostics.md',    bundled: true },
			{ name: 'Interpretation', file: 'rzoo/interpretation.md', bundled: true },
			{ name: 'Decision Guide', file: 'rzoo/decision-guide.md', bundled: true },
			{ separator: true, label: 'Models' },
			{ name: 'Pendulum',      file: 'rzoo/pendulum.md',  bundled: true },
			{ name: 'Cart-Pole',     file: 'rzoo/cartpole.md',  bundled: true },
			{ name: 'Bicycle Model', file: 'rzoo/bicycle.md',   bundled: true },
			{ name: 'Quadrotor',     file: 'rzoo/quadrotor.md', bundled: true },
		],
	},
};

export function openRzooWebview(
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
			title: RZOO_TITLE,
			options: { retainContextWhenHidden: true },
			contentOptions: { allowScripts: true },
			extension: undefined,
		},
		RZOO_VIEW_TYPE,
		RZOO_TITLE,
		undefined,
		{ group: undefined, preserveFocus: false }
	);

	webviewInput.webview.setHtml(getRzooHtml());

	registerRzooWebviewHandlers(
		webviewInput,
		RZOO_METADATA,
		openerService,
		editorService,
		quickInputService,
		commandService,
		clipboardService,
		notificationService,
		initialModel,
	);
}
