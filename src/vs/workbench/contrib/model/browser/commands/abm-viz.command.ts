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
import { IAbmVizMetadata } from '../common/abm-viz.types.js';
import { IModelReference } from '../common/model.types.js';
import { registerAbmVizWebviewHandlers } from '../handlers/abm-viz.handler.js';
import { getAbmVizHtml } from '../webviews/abm-viz.template.js';

const ABM_VIZ_VIEW_TYPE = 'pollis.abm-viz';
const ABM_VIZ_TITLE = 'ABM Visualisation';

const ABM_VIZ_REFERENCES: IModelReference[] = [
	{ separator: true, label: 'Software' },
	{
		title: 'Agents.jl: A performant and feature-full agent based modelling software of minimal code complexity',
		authors: 'Datseris, George; Vahdati, Ali R.; DuBois, Timothy C.',
		year: 2022,
		journal: 'SIMULATION',
		doi: '10.1177/00375497211068820',
		openAccess: true,
	},
	{
		title: 'Makie.jl: Flexible high-performance data visualization for Julia',
		authors: 'Danisch, Simon; Krumbiegel, Julius',
		year: 2021,
		journal: 'Journal of Open Source Software',
		doi: '10.21105/joss.03349',
		openAccess: true,
	},
	{ separator: true, label: 'Textbooks' },
	{
		title: 'An Introduction to Agent-Based Modeling',
		authors: 'Wilensky, Uri; Rand, William',
		year: 2015,
		journal: 'MIT Press',
		openAccess: false,
	},
	{ separator: true, label: 'Original Papers' },
	{
		title: 'Flocks, herds and schools: A distributed behavioral model',
		authors: 'Reynolds, Craig W.',
		year: 1987,
		journal: 'ACM SIGGRAPH Computer Graphics',
		doi: '10.1145/37401.37406',
		openAccess: false,
	},
	{
		title: 'Interactive data visualization for the web',
		authors: 'Murray, Scott',
		year: 2017,
		journal: "O'Reilly Media (2nd ed.)",
		openAccess: false,
	},
];

const ABM_VIZ_METADATA: IAbmVizMetadata = {
	abmViz: {
		packages: [
			{
				name: 'Agents.jl',
				github: 'https://github.com/JuliaDynamics/Agents.jl',
				papers: [],
				videos: [
					{
						title: 'Agents.jl Tutorial',
						description: 'Step-by-step introduction to building agent-based models with Agents.jl',
						url: 'https://www.youtube.com/watch?v=QL-bDjzS1pg',
					},
				],
			},
		],
		notebooks: [
			{ name: 'Static Plot (abmplot)',         file: 'abm-viz/tutorial-01-static.ipynb',      bundled: true, description: 'Produce a static snapshot of agent positions and states using abmplot' },
			{ name: 'Animation (abmvideo)',           file: 'abm-viz/tutorial-02-video.ipynb',       bundled: true, description: 'Record an MP4 animation of a model run with abmvideo' },
			{ name: 'Interactive Explorer',           file: 'abm-viz/tutorial-03-interactive.ipynb', bundled: true, description: 'Launch a live interactive dashboard with abmexploration to tune parameters in real time' },
		],
		wikis: [
			{ name: 'Factsheet',              file: 'abm-viz/factsheet.md',          bundled: true },
			{ name: 'Overview',               file: 'abm-viz/overview.md',            bundled: true },
			{ name: 'Assumptions',            file: 'abm-viz/assumptions.md',         bundled: true },
			{ name: 'Diagnostics',            file: 'abm-viz/diagnostics.md',         bundled: true },
			{ name: 'Interpretation',         file: 'abm-viz/interpretation.md',      bundled: true },
			{ name: 'Decision Guide',         file: 'abm-viz/decision-guide.md',      bundled: true },
			{ separator: true, label: 'Visualisation Methods' },
			{ name: 'Static Plot',            file: 'abm-viz/static-plot.md',         bundled: true },
			{ name: 'Video Animation',        file: 'abm-viz/video.md',               bundled: true },
			{ name: 'Interactive Explorer',   file: 'abm-viz/interactive.md',         bundled: true },
		],
		references: ABM_VIZ_REFERENCES,
	},
};

export function openAbmVizWebview(
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
			title: ABM_VIZ_TITLE,
			options: { retainContextWhenHidden: true },
			contentOptions: { allowScripts: true },
			extension: undefined,
		},
		ABM_VIZ_VIEW_TYPE,
		ABM_VIZ_TITLE,
		undefined,
		{ group: undefined, preserveFocus: false }
	);

	webviewInput.webview.setHtml(getAbmVizHtml());

	registerAbmVizWebviewHandlers(
		webviewInput,
		ABM_VIZ_METADATA,
		openerService,
		editorService,
		quickInputService,
		commandService,
		clipboardService,
		notificationService,
		initialModel,
	);
}
