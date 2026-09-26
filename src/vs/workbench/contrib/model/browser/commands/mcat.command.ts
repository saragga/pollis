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
import { IMcatMetadata } from '../common/mcat.types.js';
import { IModelReference } from '../common/model.types.js';
import { registerMcatWebviewHandlers } from '../handlers/mcat.handler.js';
import { getMcatHtml } from '../webviews/mcat.template.js';

const MCAT_VIEW_TYPE = 'pollis.mcat';
const MCAT_TITLE = 'MeshCat — 3D Visualisation';

const MCAT_REFERENCES: IModelReference[] = [
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
		title: 'MeshCat.jl: WebGL-Based 3D Visualizer for Julia',
		authors: 'Deits, Robin',
		year: 2018,
		journal: 'GitHub',
		url: 'https://github.com/rdeits/MeshCat.jl',
		openAccess: true,
	},
	{
		title: 'CoordinateTransformations.jl: A Fresh Approach to Coordinate Transformations in Julia',
		authors: 'Ferris, Andy',
		year: 2016,
		journal: 'GitHub',
		url: 'https://github.com/JuliaGeometry/CoordinateTransformations.jl',
		openAccess: true,
	},
	{ separator: true, label: 'Textbooks' },
	{
		title: 'Robotics: Modelling, Planning and Control',
		authors: 'Siciliano, Bruno; Sciavicco, Lorenzo; Villani, Luigi; Oriolo, Giuseppe',
		year: 2009,
		journal: 'Springer',
		doi: '10.1007/978-1-84628-642-1',
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
		title: 'Drake: Model-Based Design and Verification for Robotics',
		authors: 'Tedrake, Russ; Drake Development Team',
		year: 2019,
		journal: 'Technical Report',
		url: 'https://drake.mit.edu',
		openAccess: true,
	},
];

const MCAT_METADATA: IMcatMetadata = {
	mcat: {
		packages: [
			{
				name: 'MeshCat.jl',
				github: 'https://github.com/rdeits/MeshCat.jl',
				videos: [],
				papers: [],
			},
			{
				name: 'CoordinateTransformations.jl',
				github: 'https://github.com/JuliaGeometry/CoordinateTransformations.jl',
				videos: [],
				papers: [],
			},
		],
		references: MCAT_REFERENCES,
		notebooks: [
			{ name: 'Scene Setup', file: 'mcat/tutorial-01-scene.ipynb', bundled: true, description: 'Initialise a MeshCat visualizer, add geometry and set transforms' },
			{ name: 'Trajectory Animation', file: 'mcat/tutorial-02-anim.ipynb', bundled: true, description: 'Animate a robot state trajectory from a simulation result' },
			{ name: 'Frame Visualization', file: 'mcat/tutorial-03-frame.ipynb', bundled: true, description: 'Display coordinate frames (Triad) to debug kinematic transforms' },
			{ name: 'URDF Robot', file: 'mcat/tutorial-04-urdf.ipynb', bundled: true, description: 'Load a complete articulated robot from a URDF file' },
		],
		wikis: [
			{ name: 'Factsheet',      file: 'mcat/factsheet.md',      bundled: true },
			{ name: 'Overview',       file: 'mcat/overview.md',       bundled: true },
			{ name: 'Assumptions',    file: 'mcat/assumptions.md',    bundled: true },
			{ name: 'Diagnostics',    file: 'mcat/diagnostics.md',    bundled: true },
			{ name: 'Interpretation', file: 'mcat/interpretation.md', bundled: true },
			{ name: 'Decision Guide', file: 'mcat/decision-guide.md', bundled: true },
			{ separator: true, label: 'Methods' },
			{ name: 'Scene Setup',           file: 'mcat/scene.md', bundled: true },
			{ name: 'Trajectory Animation',  file: 'mcat/anim.md',  bundled: true },
			{ name: 'Frame Visualization',   file: 'mcat/frame.md', bundled: true },
			{ name: 'URDF Robot',            file: 'mcat/urdf.md',  bundled: true },
		],
	},
};

export function openMcatWebview(
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
			title: MCAT_TITLE,
			options: { retainContextWhenHidden: true },
			contentOptions: { allowScripts: true },
			extension: undefined,
		},
		MCAT_VIEW_TYPE,
		MCAT_TITLE,
		undefined,
		{ group: undefined, preserveFocus: false }
	);

	webviewInput.webview.setHtml(getMcatHtml());

	registerMcatWebviewHandlers(
		webviewInput,
		MCAT_METADATA,
		openerService,
		editorService,
		quickInputService,
		commandService,
		clipboardService,
		notificationService,
		initialModel,
	);
}
