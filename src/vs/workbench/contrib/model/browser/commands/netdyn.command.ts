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
import { INetdynMetadata } from '../common/netdyn.types.js';
import { IModelReference } from '../common/model.types.js';
import { registerNetdynWebviewHandlers } from '../handlers/netdyn.handler.js';
import { getNetdynHtml } from '../webviews/netdyn.template.js';

const NETDYN_VIEW_TYPE = 'pollis.netdyn';
const NETDYN_TITLE = 'Network Dynamics';

const NETDYN_REFERENCES: IModelReference[] = [
	{ separator: true, label: 'Software' },
	{
		title: 'NetworkDynamics.jl: Composing and Simulating Complex Networks in Julia',
		authors: 'Lindner, Michael; Lincoln, Lucas; Drauschke, Franziska; Koulen, Julia M.; Wurfel, Hans; Plietzsch, Anton; Hellmann, Frank',
		year: 2021,
		journal: 'Chaos',
		doi: '10.1063/5.0051387',
		openAccess: true,
	},
	{ separator: true, label: 'Textbooks' },
	{
		title: 'Networks: An Introduction',
		authors: 'Newman, Mark E. J.',
		year: 2010,
		journal: 'Oxford University Press',
		openAccess: false,
	},
	{
		title: 'Dynamical Processes on Complex Networks',
		authors: 'Barrat, Alain; Barthelemy, Marc; Vespignani, Alessandro',
		year: 2008,
		journal: 'Cambridge University Press',
		openAccess: false,
	},
	{ separator: true, label: 'Original Papers' },
	{
		title: 'Chemical Oscillations, Waves, and Turbulence',
		authors: 'Kuramoto, Yoshiki',
		year: 1984,
		journal: 'Springer',
		openAccess: false,
	},
	{
		title: 'Cascade-based Attacks on Complex Networks',
		authors: 'Motter, Adilson E.; Lai, Ying-Cheng',
		year: 2002,
		journal: 'Physical Review E',
		doi: '10.1103/PhysRevE.66.065102',
		openAccess: false,
	},
];

const NETDYN_METADATA: INetdynMetadata = {
	netdyn: {
		packages: [
			{
				name: 'NetworkDynamics.jl',
				github: 'https://juliadynamics.github.io/NetworkDynamics.jl/dev/',
				papers: [],
				videos: [],
			},
			{
				name: 'Graphs.jl',
				github: 'https://juliagraphs.org/Graphs.jl/stable/',
				papers: [],
				videos: [],
			},
		],
		notebooks: [
			{ name: 'Kuramoto Oscillators', file: 'netdyn/tutorial-01-kuramoto.ipynb', bundled: true, description: 'Simulate coupled phase oscillators on a network and measure synchronisation as coupling strength increases' },
			{ name: 'Cascade Failures',     file: 'netdyn/tutorial-02-cascade.ipynb',  bundled: true, description: 'Trigger load-redistribution cascades and study how network topology determines systemic fragility' },
		],
		wikis: [
			{ name: 'Factsheet',        file: 'netdyn/factsheet.md',       bundled: true },
			{ name: 'Overview',         file: 'netdyn/overview.md',         bundled: true },
			{ name: 'Assumptions',      file: 'netdyn/assumptions.md',      bundled: true },
			{ name: 'Diagnostics',      file: 'netdyn/diagnostics.md',      bundled: true },
			{ name: 'Interpretation',   file: 'netdyn/interpretation.md',   bundled: true },
			{ name: 'Decision Guide',   file: 'netdyn/decision-guide.md',   bundled: true },
			{ separator: true, label: 'Models' },
			{ name: 'Kuramoto Oscillators', file: 'netdyn/kuramoto.md', bundled: true },
			{ name: 'Cascade Failures',     file: 'netdyn/cascade.md',  bundled: true },
		],
		references: NETDYN_REFERENCES,
	},
};

export function openNetdynWebview(
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
			title: NETDYN_TITLE,
			options: { retainContextWhenHidden: true },
			contentOptions: { allowScripts: true },
			extension: undefined,
		},
		NETDYN_VIEW_TYPE,
		NETDYN_TITLE,
		undefined,
		{ group: undefined, preserveFocus: false }
	);

	webviewInput.webview.setHtml(getNetdynHtml());

	registerNetdynWebviewHandlers(
		webviewInput,
		NETDYN_METADATA,
		openerService,
		editorService,
		quickInputService,
		commandService,
		clipboardService,
		notificationService,
		initialModel,
	);
}
