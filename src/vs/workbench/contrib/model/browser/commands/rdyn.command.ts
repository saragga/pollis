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
import { IRdynMetadata } from '../common/rdyn.types.js';
import { IModelReference } from '../common/model.types.js';
import { registerRdynWebviewHandlers } from '../handlers/rdyn.handler.js';
import { getRdynHtml } from '../webviews/rdyn.template.js';

const RDYN_VIEW_TYPE = 'pollis.rdyn';
const RDYN_TITLE = 'Robot Dynamics';

const RDYN_REFERENCES: IModelReference[] = [
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
		title: 'Rotations.jl: Efficient Implementations of Rotation Types in Julia',
		authors: 'Koolen, Twan; Craig, Andy',
		year: 2019,
		journal: 'GitHub',
		url: 'https://github.com/JuliaGeometry/Rotations.jl',
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
		title: 'Rigid Body Dynamics Algorithms',
		authors: 'Featherstone, Roy',
		year: 2008,
		journal: 'Springer',
		doi: '10.1007/978-1-4899-7560-7',
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
		title: 'The Calculation of Robot Dynamics Using Articulated Body Inertias',
		authors: 'Featherstone, Roy',
		year: 1983,
		journal: 'The International Journal of Robotics Research',
		doi: '10.1177/027836498300200102',
		openAccess: false,
	},
	{
		title: 'Robot Dynamics: Equations and Algorithms',
		authors: 'Walker, Michael W.; Orin, David E.',
		year: 1982,
		journal: 'IEEE Transactions on Automatic Control',
		doi: '10.1109/TAC.1982.1102904',
		openAccess: false,
	},
];

const RDYN_METADATA: IRdynMetadata = {
	rdyn: {
		packages: [
			{
				name: 'Rotations.jl',
				github: 'https://github.com/JuliaGeometry/Rotations.jl',
				videos: [],
				papers: [],
			},
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
		references: RDYN_REFERENCES,
		notebooks: [
			{ name: 'Rotation Representations', file: 'rdyn/tutorial-01-rotations.ipynb', bundled: true, description: 'Quaternions, rotation matrices, MRP and SO(3) operations with Rotations.jl' },
			{ name: 'Forward Kinematics', file: 'rdyn/tutorial-02-fk.ipynb', bundled: true, description: 'End-effector pose from joint configuration via kinematic chain' },
			{ name: 'Forward Dynamics', file: 'rdyn/tutorial-03-fd.ipynb', bundled: true, description: 'Joint accelerations from applied torques via the ABA algorithm' },
			{ name: 'Inverse Dynamics', file: 'rdyn/tutorial-04-id.ipynb', bundled: true, description: 'Joint torques from desired motion via the RNEA algorithm' },
		],
		wikis: [
			{ name: 'Factsheet',      file: 'rdyn/factsheet.md',      bundled: true },
			{ name: 'Overview',       file: 'rdyn/overview.md',       bundled: true },
			{ name: 'Assumptions',    file: 'rdyn/assumptions.md',    bundled: true },
			{ name: 'Diagnostics',    file: 'rdyn/diagnostics.md',    bundled: true },
			{ name: 'Interpretation', file: 'rdyn/interpretation.md', bundled: true },
			{ name: 'Decision Guide', file: 'rdyn/decision-guide.md', bundled: true },
			{ separator: true, label: 'Methods' },
			{ name: 'Rotation Representations', file: 'rdyn/rotations.md',   bundled: true },
			{ name: 'Forward Kinematics',        file: 'rdyn/fk.md',         bundled: true },
			{ name: 'Forward Dynamics',          file: 'rdyn/fd.md',         bundled: true },
			{ name: 'Inverse Dynamics',          file: 'rdyn/id.md',         bundled: true },
		],
	},
};

export function openRdynWebview(
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
			title: RDYN_TITLE,
			options: { retainContextWhenHidden: true },
			contentOptions: { allowScripts: true },
			extension: undefined,
		},
		RDYN_VIEW_TYPE,
		RDYN_TITLE,
		undefined,
		{ group: undefined, preserveFocus: false }
	);

	webviewInput.webview.setHtml(getRdynHtml());

	registerRdynWebviewHandlers(
		webviewInput,
		RDYN_METADATA,
		openerService,
		editorService,
		quickInputService,
		commandService,
		clipboardService,
		notificationService,
		initialModel,
	);
}
