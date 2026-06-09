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
import { IAbmMetadata } from '../common/abm.types.js';
import { IModelReference } from '../common/model.types.js';
import { registerAbmWebviewHandlers } from '../handlers/abm.handler.js';
import { getAbmHtml } from '../webviews/abm.template.js';

const ABM_VIEW_TYPE = 'pollis.abm';
const ABM_TITLE = 'Agent-Based Models';

const ABM_REFERENCES: IModelReference[] = [
	{ separator: true, label: 'Software' },
	{
		title: 'Agents.jl: A performant and feature-full agent based modelling software of minimal code complexity',
		authors: 'Datseris, George; Vahdati, Ali R.; DuBois, Timothy C.',
		year: 2022,
		journal: 'SIMULATION',
		doi: '10.1177/00375497211068820',
		openAccess: true,
	},
	{ separator: true, label: 'Textbooks' },
	{
		title: 'An Introduction to Agent-Based Modeling: Modeling Natural, Social, and Engineered Complex Systems',
		authors: 'Wilensky, Uri; Rand, William',
		year: 2015,
		journal: 'MIT Press',
		openAccess: false,
	},
	{
		title: 'Growing Artificial Societies: Social Science from the Bottom Up',
		authors: 'Epstein, Joshua M.; Axtell, Robert',
		year: 1996,
		journal: 'MIT Press',
		openAccess: false,
	},
	{ separator: true, label: 'Original Papers' },
	{
		title: 'Dynamic models of segregation',
		authors: 'Schelling, Thomas C.',
		year: 1971,
		journal: 'Journal of Mathematical Sociology',
		doi: '10.1080/0022250X.1971.9989794',
		openAccess: false,
	},
	{
		title: 'Flocks, herds and schools: A distributed behavioral model',
		authors: 'Reynolds, Craig W.',
		year: 1987,
		journal: 'ACM SIGGRAPH Computer Graphics',
		doi: '10.1145/37401.37406',
		openAccess: false,
	},
	{
		title: 'Artificial life: Organization, adaptation and complexity from the bottom up',
		authors: 'Bedau, Mark A.',
		year: 2003,
		journal: 'Trends in Cognitive Sciences',
		doi: '10.1016/S1364-6613(03)00144-6',
		openAccess: false,
	},
];

const ABM_METADATA: IAbmMetadata = {
	abm: {
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
			{ name: 'Grid Space: Schelling Segregation',     file: 'abm/tutorial-01-grid.ipynb',       bundled: true, description: 'Build the classic Schelling segregation model on a 2-D grid space' },
			{ name: 'Continuous Space: Flocking (Boids)',    file: 'abm/tutorial-02-continuous.ipynb', bundled: true, description: 'Simulate flocking behaviour using Reynolds rules in continuous 2-D space' },
			{ name: 'Graph Space: Spreading Processes',      file: 'abm/tutorial-03-graph.ipynb',      bundled: true, description: 'Model an SIR epidemic spreading over a social network graph' },
			{ name: 'Data Collection & Observables',         file: 'abm/tutorial-04-data.ipynb',       bundled: true, description: 'Collect agent and model-level data during a run and export to DataFrame' },
		],
		wikis: [
			{ name: 'Factsheet',              file: 'abm/factsheet.md',          bundled: true },
			{ name: 'Overview',               file: 'abm/overview.md',            bundled: true },
			{ name: 'Assumptions',            file: 'abm/assumptions.md',         bundled: true },
			{ name: 'Diagnostics',            file: 'abm/diagnostics.md',         bundled: true },
			{ name: 'Interpretation',         file: 'abm/interpretation.md',      bundled: true },
			{ name: 'Decision Guide',         file: 'abm/decision-guide.md',      bundled: true },
			{ separator: true, label: 'Space Types' },
			{ name: 'Grid Space',             file: 'abm/grid-space.md',          bundled: true },
			{ name: 'Continuous Space',       file: 'abm/continuous-space.md',    bundled: true },
			{ name: 'Graph Space',            file: 'abm/graph-space.md',         bundled: true },
		],
		references: ABM_REFERENCES,
	},
};

export function openAbmWebview(
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
			title: ABM_TITLE,
			options: { retainContextWhenHidden: true },
			contentOptions: { allowScripts: true },
			extension: undefined,
		},
		ABM_VIEW_TYPE,
		ABM_TITLE,
		undefined,
		{ group: undefined, preserveFocus: false }
	);

	webviewInput.webview.setHtml(getAbmHtml());

	registerAbmWebviewHandlers(
		webviewInput,
		ABM_METADATA,
		openerService,
		editorService,
		quickInputService,
		commandService,
		clipboardService,
		notificationService,
		initialModel,
	);
}
