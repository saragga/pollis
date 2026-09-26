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
import { IRctlMetadata } from '../common/rctl.types.js';
import { IModelReference } from '../common/model.types.js';
import { registerRctlWebviewHandlers } from '../handlers/rctl.handler.js';
import { getRctlHtml } from '../webviews/rctl.template.js';

const RCTL_VIEW_TYPE = 'pollis.rctl';
const RCTL_TITLE = 'Robot Control';

const RCTL_REFERENCES: IModelReference[] = [
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
		title: 'RobotDynamics.jl: Flexible Rigid Body Dynamics in Julia',
		authors: 'Howell, Taylor; Jackson, Brian; Manchester, Zachary',
		year: 2019,
		journal: 'GitHub',
		url: 'https://github.com/RoboticExplorationLab/RobotDynamics.jl',
		openAccess: true,
	},
	{
		title: 'RigidBodyDynamics.jl: Rigid Body Dynamics and Control in Julia',
		authors: 'Koolen, Twan; Deits, Robin',
		year: 2016,
		journal: 'GitHub',
		url: 'https://github.com/JuliaRobotics/RigidBodyDynamics.jl',
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
		title: 'Robotics: Modelling, Planning and Control',
		authors: 'Siciliano, Bruno; Sciavicco, Lorenzo; Villani, Luigi; Oriolo, Giuseppe',
		year: 2009,
		journal: 'Springer',
		doi: '10.1007/978-1-84628-642-1',
		openAccess: false,
	},
	{ separator: true, label: 'Original Papers' },
	{
		title: 'Impedance Control: An Approach to Manipulation',
		authors: 'Hogan, Neville',
		year: 1985,
		journal: 'Journal of Dynamic Systems, Measurement, and Control',
		doi: '10.1115/1.3140702',
		openAccess: false,
	},
	{
		title: 'A Unified Approach for Motion and Force Control of Robot Manipulators: The Operational Space Formulation',
		authors: 'Khatib, Oussama',
		year: 1987,
		journal: 'IEEE Journal of Robotics and Automation',
		doi: '10.1109/JRA.1987.1087068',
		openAccess: false,
	},
];

const RCTL_METADATA: IRctlMetadata = {
	rctl: {
		packages: [
			{
				name: 'RobotDynamics.jl',
				github: 'https://github.com/RoboticExplorationLab/RobotDynamics.jl',
				videos: [],
				papers: [],
			},
			{
				name: 'RigidBodyDynamics.jl',
				github: 'https://github.com/JuliaRobotics/RigidBodyDynamics.jl',
				videos: [],
				papers: [],
			},
		],
		references: RCTL_REFERENCES,
		notebooks: [
			{ name: 'Inverse Kinematics', file: 'rctl/tutorial-01-ik.ipynb', bundled: true, description: 'Jacobian pseudoinverse IK for Cartesian position targets' },
			{ name: 'PD Joint Control', file: 'rctl/tutorial-02-pd.ipynb', bundled: true, description: 'Independent joint PD control with gravity compensation' },
			{ name: 'Computed Torque', file: 'rctl/tutorial-03-ct.ipynb', bundled: true, description: 'Exact nonlinear feedback linearisation via RNEA' },
			{ name: 'Impedance Control', file: 'rctl/tutorial-04-imp.ipynb', bundled: true, description: 'Cartesian spring-damper law for compliant interaction' },
		],
		wikis: [
			{ name: 'Factsheet',      file: 'rctl/factsheet.md',      bundled: true },
			{ name: 'Overview',       file: 'rctl/overview.md',       bundled: true },
			{ name: 'Assumptions',    file: 'rctl/assumptions.md',    bundled: true },
			{ name: 'Diagnostics',    file: 'rctl/diagnostics.md',    bundled: true },
			{ name: 'Interpretation', file: 'rctl/interpretation.md', bundled: true },
			{ name: 'Decision Guide', file: 'rctl/decision-guide.md', bundled: true },
			{ separator: true, label: 'Methods' },
			{ name: 'Inverse Kinematics', file: 'rctl/ik.md',  bundled: true },
			{ name: 'PD Joint Control',   file: 'rctl/pd.md',  bundled: true },
			{ name: 'Computed Torque',    file: 'rctl/ct.md',  bundled: true },
			{ name: 'Impedance Control',  file: 'rctl/imp.md', bundled: true },
		],
	},
};

export function openRctlWebview(
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
			title: RCTL_TITLE,
			options: { retainContextWhenHidden: true },
			contentOptions: { allowScripts: true },
			extension: undefined,
		},
		RCTL_VIEW_TYPE,
		RCTL_TITLE,
		undefined,
		{ group: undefined, preserveFocus: false }
	);

	webviewInput.webview.setHtml(getRctlHtml());

	registerRctlWebviewHandlers(
		webviewInput,
		RCTL_METADATA,
		openerService,
		editorService,
		quickInputService,
		commandService,
		clipboardService,
		notificationService,
		initialModel,
	);
}
